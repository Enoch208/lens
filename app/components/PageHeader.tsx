export default function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.06] px-8 py-6">
      <div>
        <h1 className="text-2xl font-light tracking-tight">{title}</h1>
        <p className="mt-1 text-sm font-extralight text-zinc-500">{subtitle}</p>
      </div>
    </header>
  );
}
