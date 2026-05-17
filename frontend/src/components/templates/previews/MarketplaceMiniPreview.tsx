"use client";

export default function MarketplaceMiniPreview({ template }: { template: any }) {
  const products = template?.demo_data?.products || ["Item A", "Item B", "Item C", "Item D"];
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-white">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-rose-300">{template?.name || "Marketplace"}</span>
        <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-200">Checkout</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {products.slice(0, 4).map((product: string) => (
          <div key={product} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="h-12 rounded-lg bg-white/[0.08]" />
            <div className="mt-2 h-2 w-2/3 rounded-full bg-white/20" />
            <div className="mt-1 h-2 w-1/2 rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

