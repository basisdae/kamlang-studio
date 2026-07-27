import type { BiSupabaseClient } from "../supabase/client";
import { biRuntimeError, configError, normalizeError } from "../supabase/errors";
import {
  BI_MEDIA_BUCKET,
  BI_MEDIA_MAX_BYTES,
  isAllowedMediaMime,
  sanitizeMediaFileName,
  type MediaRecord,
} from "../media/types";
import type { MediaRepository } from "./mediaRepository";

type MediaRow = {
  id: string;
  workspace_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};

function publicUrlFor(
  client: BiSupabaseClient,
  storagePath: string
): string {
  const { data } = client.storage.from(BI_MEDIA_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

function fromRow(client: BiSupabaseClient, row: MediaRow): MediaRecord {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    fileName: row.file_name,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes) || 0,
    createdAt: row.created_at,
    publicUrl: publicUrlFor(client, row.storage_path),
  };
}

export function createSupabaseMediaRepository(
  client: BiSupabaseClient | null
): MediaRepository {
  function requireClient(): BiSupabaseClient {
    if (!client) throw configError();
    return client;
  }

  return {
    async listByWorkspace(workspaceId) {
      try {
        const c = requireClient();
        const { data, error } = await c
          .from("bi_media")
          .select("*")
          .eq("workspace_id", workspaceId)
          .order("created_at", { ascending: false });
        if (error) {
          biRuntimeError("supabaseMediaRepository", "listByWorkspace", error, {
            table: "bi_media",
          });
          throw error;
        }
        return ((data ?? []) as MediaRow[]).map((row) => fromRow(c, row));
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async upload(workspaceId, file, options) {
      try {
        const c = requireClient();
        if (!isAllowedMediaMime(file.type)) {
          throw new Error("รองรับเฉพาะไฟล์ JPG, PNG หรือ WebP");
        }
        if (file.size <= 0 || file.size > BI_MEDIA_MAX_BYTES) {
          throw new Error("ไฟล์ต้องไม่เกิน 5 MB");
        }

        const id = crypto.randomUUID();
        const safeName = sanitizeMediaFileName(file.name);
        const storagePath = `${workspaceId}/${id}/${safeName}`;

        const { error: upError } = await c.storage
          .from(BI_MEDIA_BUCKET)
          .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });
        if (upError) {
          biRuntimeError("supabaseMediaRepository", "storage.upload", upError, {
            table: "bi_media",
          });
          throw upError;
        }

        const { data, error } = await c
          .from("bi_media")
          .insert({
            id,
            workspace_id: workspaceId,
            file_name: safeName,
            storage_path: storagePath,
            mime_type: file.type,
            size_bytes: file.size,
            created_by: options?.createdBy ?? null,
          })
          .select("*")
          .single();

        if (error) {
          await c.storage.from(BI_MEDIA_BUCKET).remove([storagePath]);
          biRuntimeError("supabaseMediaRepository", "insert", error, {
            table: "bi_media",
          });
          throw error;
        }
        return fromRow(c, data as MediaRow);
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async remove(id, workspaceId) {
      try {
        const c = requireClient();
        const { data: row, error: getError } = await c
          .from("bi_media")
          .select("*")
          .eq("id", id)
          .eq("workspace_id", workspaceId)
          .maybeSingle();
        if (getError) throw getError;
        if (!row) throw new Error("ไม่พบรูปในคลัง");

        const path = (row as MediaRow).storage_path;
        const { error: delStorage } = await c.storage
          .from(BI_MEDIA_BUCKET)
          .remove([path]);
        if (delStorage) {
          biRuntimeError("supabaseMediaRepository", "storage.remove", delStorage, {
            table: "bi_media",
          });
          throw delStorage;
        }

        const { error: delRow } = await c
          .from("bi_media")
          .delete()
          .eq("id", id)
          .eq("workspace_id", workspaceId);
        if (delRow) {
          biRuntimeError("supabaseMediaRepository", "delete", delRow, {
            table: "bi_media",
          });
          throw delRow;
        }
      } catch (e) {
        throw normalizeError(e);
      }
    },
  };
}
