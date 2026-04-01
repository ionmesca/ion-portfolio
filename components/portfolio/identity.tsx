import Image from "next/image";

export function Identity() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Image
          src="/ion.jpeg"
          alt="Ion Mesca"
          width={36}
          height={36}
          className="rounded-full"
          priority
        />
        <span className="text-[15px] font-semibold text-text-primary">
          Ion Mesca
        </span>
      </div>
      <p className="text-[13px] text-text-secondary leading-relaxed">
        Design engineer building interfaces for AI products. Previously at
        Ledgy.
      </p>
    </div>
  );
}
