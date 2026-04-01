export function Sidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <aside className="hidden md:flex w-[432px] min-w-[432px] h-full flex-col border-r-2 border-bg-surface">
      <div className="px-4 py-6">
        <span className="text-sm font-medium text-text-label">
          Projects
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 pb-6">{children}</nav>
    </aside>
  );
}
