import Image from "next/image";
import { SocialLinks } from "./social-links";

export function MobileHeader() {
  return (
    <div className="flex md:hidden items-center justify-between px-4 py-3 sticky top-0 z-10 bg-bg-surface/80 backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        <Image
          src="/ion.jpeg"
          alt="Ion Mesca"
          width={28}
          height={28}
          className="rounded-full"
        />
        <span className="text-[14px] font-semibold text-text-primary">
          Ion Mesca
        </span>
      </div>
      <SocialLinks />
    </div>
  );
}
