import { ResizableRail } from "./resizable-rail";

export function Sidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ResizableRail storageKey="ion-portfolio-detail-rail-width">
      <div className="px-4 pb-5 pt-6">
        <span className="text-sm font-medium text-text-label">
          Projects
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 pb-6">{children}</nav>
    </ResizableRail>
  );
}
