"use client";

import { useWizard } from "@/context/WizardContext";

export default function Step9DesignUX() {
  const { data, updateData } = useWizard();

  const emotions = ["Profissional", "Acolhedor", "Inovador", "Divertido", "Luxuoso", "Minimalista", "Agressivo (Tech)"];
  const styles = ["Futurista", "Clean/Corporativo", "Material Design", "Neumorphism", "Glassmorphism", "Brutalism"];

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 pb-10">
      <div>
        <h2 className="text-2xl font-bold mb-2">Design & UX</h2>
        <p className="text-gray-400">Defina a identidade visual e o comportamento da interface do seu software.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Estilo Visual</label>
          <select 
            className="w-full bg-[#0a0a0f] border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
            value={data.design_style}
            onChange={e => updateData({ design_style: e.target.value })}
          >
            {styles.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Emoção do Design</label>
          <select 
            className="w-full bg-[#0a0a0f] border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
            value={data.design_emotion}
            onChange={e => updateData({ design_emotion: e.target.value })}
          >
            {emotions.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Referências (Opcional)</label>
        <textarea 
          rows={3}
          placeholder="Ex: Quero algo parecido com o painel do Stripe ou Vercel, com muito contraste e modo escuro nativo."
          className="w-full bg-[#0a0a0f] border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
          value={data.design_references}
          onChange={e => updateData({ design_references: e.target.value })}
        />
      </div>
    </div>
  );
}
