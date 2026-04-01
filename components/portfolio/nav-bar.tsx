import { Identity } from "./identity";
import { SocialLinks } from "./social-links";

export function NavBar() {
  return (
    <header className="hidden md:flex items-center justify-between px-3 py-4 flex-shrink-0">
      <Identity />
      <SocialLinks />
    </header>
  );
}
