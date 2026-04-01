import { Identity } from "./identity";
import { SocialLinks } from "./social-links";

export function Sidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <aside className="hidden md:flex w-80 min-w-80 sticky top-0 h-screen flex-col border-r border-border-subtle">
      <div className="flex items-center justify-between px-6 py-4">
        <Identity />
        <SocialLinks />
      </div>
      <div className="px-6 py-2">
        <span className="text-[12px] font-medium text-text-tertiary">
          Projects
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 pb-6">{children}</nav>
    </aside>
  );
}
