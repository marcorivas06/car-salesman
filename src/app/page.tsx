const phaseItems = [
  'Next.js + TypeScript + Tailwind foundation ready',
  'Drizzle schema and migration config wired',
  'Environment validation added for DB/Auth/Stripe keys',
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">CarSalesman</h1>
      <p className="text-slate-700">
        Phase 1 foundation is in progress. This baseline app now includes the core
        setup needed to continue with auth, billing, and dashboard features.
      </p>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Phase 1 progress</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
          {phaseItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
