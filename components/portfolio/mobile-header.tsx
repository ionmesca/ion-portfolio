import Image from "next/image";
import Link from "next/link";
import { SocialLinks } from "./social-links";

export function MobileHeader() {
  return (
    <div className="flex md:hidden items-center justify-between px-4 py-3 sticky top-0 z-10 bg-bg-surface/80 backdrop-blur-sm">
      <Link
        href="/agent"
        aria-label="Open Ion's agent"
        className="-ml-2 inline-flex min-h-10 items-center gap-2.5 rounded-full px-2 outline-none transition-colors hover:bg-bg-elevated focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Image
          src="/ion.jpeg"
          alt="Ion Mesca"
          width={28}
          height={28}
          className="size-7 rounded-full object-cover"
        />
        <span className="text-sm font-medium text-text-primary">
          Ion Mesca
        </span>
      </Link>
      <SocialLinks />
    </div>
  );
}
