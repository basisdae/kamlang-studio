import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import SectionTitle from "../../../components/ui/SectionTitle";
import StatCell from "../../../components/ui/StatCell";
import { EMPTY_STATE } from "../../copy/emptyStates";
import type { ImportResult } from "../../lib/excelImport";
import { formatImportIssue } from "../utils";

type Props = {
  result: ImportResult<unknown>;
  onResetFile?: () => void;
};

export default function ImportResultPanel({ result, onResetFile }: Props) {
  const hasIssues = result.warnings.length > 0 || result.errors.length > 0;
  const isClean =
    result.failedCount === 0 && result.errors.length === 0 && result.successCount > 0;

  return (
    <section className="space-y-3">
      <SectionTitle>ผลการตรวจสอบ</SectionTitle>

      <Card className="space-y-4">
        <div className="kl-metric-grid">
          <StatCell
            label="จำนวนที่ผ่าน"
            value={result.successCount}
            size="lg"
            className="text-kl-success-text"
          />
          <StatCell
            label="จำนวนที่ผิด"
            value={result.failedCount}
            size="lg"
            className="text-kl-danger-text"
          />
        </div>

        {isClean ? (
          <div className="flex items-center justify-center gap-2">
            <Badge tone="ready">พร้อมบันทึก</Badge>
            <span className="kl-type-body text-kl-success-text">
              ไฟล์ผ่านการตรวจสอบ
            </span>
          </div>
        ) : null}

        {!hasIssues && result.successCount === 0 ? (
          <EmptyState
            {...EMPTY_STATE.import.noData}
            onAction={onResetFile}
          />
        ) : null}

        {result.warnings.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="kl-type-card-title">คำเตือน</div>
              <Badge tone="warning">{result.warnings.length}</Badge>
            </div>

            <ul className="kl-list">
              {result.warnings.map((issue, index) => (
                <li
                  key={`warning-${issue.row}-${issue.code}-${index}`}
                  className="kl-type-caption break-words text-kl-warning-text"
                >
                  {formatImportIssue(issue)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {result.errors.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="kl-type-card-title">ข้อผิดพลาด</div>
              <Badge tone="danger">{result.errors.length}</Badge>
            </div>

            <ul className="kl-list">
              {result.errors.map((issue, index) => (
                <li
                  key={`error-${issue.row}-${issue.code}-${index}`}
                  className="kl-type-caption break-words text-kl-danger-text"
                >
                  {formatImportIssue(issue)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>
    </section>
  );
}
