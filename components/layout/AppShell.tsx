import Link from "next/link";

type AppShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  backHref?: string;
};

export default function AppShell({
  title,
  description,
  children,
  backHref,
}: AppShellProps) {
  return (
    <main className="min-h-screen bg-[#f7f2ea] px-4 py-5 pb-24 text-[#2b2118]">
      <div className="mx-auto max-w-md space-y-5">
        <header className="flex items-start gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl shadow-sm active:scale-95"
            >
              ←
            </Link>
          )}

          <div>
            <h1 className="text-2xl font-bold leading-tight">{title}</h1>
            {description && (
              <p className="mt-1 text-sm leading-6 text-black/50">
                {description}
              </p>
            )}
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}