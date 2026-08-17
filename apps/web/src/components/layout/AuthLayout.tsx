import ThemeToggle from "./ThemeToggle";

export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-theme-auth">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-center justify-center p-4 pb-8">
        <div className="w-full max-w-md rounded-2xl border border-theme bg-theme-surface p-6 shadow-lg sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-theme-brand-soft text-xl">
              👶
            </div>
            <h1 className="text-2xl font-bold text-theme-body">{title}</h1>
            <p className="mt-1 text-sm text-theme-muted">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
