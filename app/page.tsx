import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Ion Mesca</h1>
        <ThemeToggle />
      </div>
      <p className="text-muted-foreground">Design Engineer</p>
    </div>
  );
}
