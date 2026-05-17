"use client";

export default function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
      <p className="mt-2 text-gray-400">{subtitle}</p>
    </header>
  );
}
