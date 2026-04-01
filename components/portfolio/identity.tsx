import Image from "next/image";

export function Identity() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/ion.jpeg"
        alt="Ion Mesca"
        width={42}
        height={42}
        className="rounded-full"
        priority
      />
      <div className="flex flex-col">
        <span className="text-base font-medium text-text-primary">
          Ion Mesca
        </span>
        <span className="text-xs text-text-subtitle">
          Design Engineer
        </span>
      </div>
    </div>
  );
}
