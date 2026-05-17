"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Copy, ArrowUp, ArrowDown, Layers } from "lucide-react";
import { useVisualBuilder } from "./VisualBuilderContext";

export default function ElementInspector() {
  const { state, updateProps, updateStyles, updateContent, removeElement, moveUp, moveDown, duplicate, selectElement } = useVisualBuilder();
  const selected = state.selectedId ? state.elements[state.selectedId] : null;

  if (!selected) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <Layers size={16} className="text-gray-600" />
        </div>
        <p className="text-xs text-gray-500">Selecione um elemento</p>
        <p className="text-[9px] text-gray-600 mt-1">Clique no canvas para inspecionar</p>
      </div>
    );
  }

  const handleStyleChange = (key: string, value: string) => {
    updateStyles(selected.id, { [key]: value });
  };

  const handlePropChange = (key: string, value: any) => {
    updateProps(selected.id, { [key]: value });
  };

  const inputClass = "w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all";
  const labelClass = "text-[9px] font-medium text-gray-500 uppercase tracking-wider";
  const sectionClass = "space-y-2";
  const dividerClass = "border-t border-white/[0.04] my-3";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between rounded-t-xl border-b border-white/[0.06] bg-white/[0.02] px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] font-medium text-gray-400">Inspector</span>
        </div>
        <span className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[8px] text-gray-500 font-mono">
          {selected.type}
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 no-scrollbar">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-indigo-500/20 text-xs">
            {selected.meta.icon}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-200">{selected.label}</p>
            <p className="text-[9px] text-gray-500 font-mono">&lt;{selected.tag}&gt;</p>
          </div>
        </div>

        <div className="flex gap-1">
          <button onClick={() => moveUp(selected.id)} className="flex items-center gap-1 rounded-lg border border-white/[0.06] px-2 py-1.5 text-[9px] text-gray-400 hover:text-white hover:border-white/20 transition-all">
            <ArrowUp size={10} /> Up
          </button>
          <button onClick={() => moveDown(selected.id)} className="flex items-center gap-1 rounded-lg border border-white/[0.06] px-2 py-1.5 text-[9px] text-gray-400 hover:text-white hover:border-white/20 transition-all">
            <ArrowDown size={10} /> Down
          </button>
          <button onClick={() => duplicate(selected.id)} className="flex items-center gap-1 rounded-lg border border-white/[0.06] px-2 py-1.5 text-[9px] text-gray-400 hover:text-white hover:border-white/20 transition-all">
            <Copy size={10} /> Duplicate
          </button>
          <button onClick={() => removeElement(selected.id)} className="flex items-center gap-1 rounded-lg border border-red-500/20 px-2 py-1.5 text-[9px] text-red-400 hover:bg-red-500/10 transition-all ml-auto">
            <Trash2 size={10} /> Delete
          </button>
        </div>

        <div className={dividerClass} />

        {(selected.tag !== "img" && selected.tag !== "input") && (
          <div className={sectionClass}>
            <p className={labelClass}>Conteúdo</p>
            {selected.type === "hero" ? (
              <div className="space-y-2">
                <div>
                  <label className="text-[9px] text-gray-500">Título</label>
                  <input className={inputClass} value={selected.props.title || ""} onChange={e => handlePropChange("title", e.target.value)} />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500">Subtítulo</label>
                  <input className={inputClass} value={selected.props.subtitle || ""} onChange={e => handlePropChange("subtitle", e.target.value)} />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500">CTA Text</label>
                  <input className={inputClass} value={selected.props.ctaText || ""} onChange={e => handlePropChange("ctaText", e.target.value)} />
                </div>
              </div>
            ) : selected.type === "pricing" ? (
              <div className="space-y-2">
                <div>
                  <label className="text-[9px] text-gray-500">Plano</label>
                  <input className={inputClass} value={selected.props.plan || ""} onChange={e => handlePropChange("plan", e.target.value)} />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500">Preço</label>
                  <input className={inputClass} value={selected.props.price || ""} onChange={e => handlePropChange("price", e.target.value)} />
                </div>
              </div>
            ) : selected.type === "testimonial" ? (
              <div className="space-y-2">
                <div>
                  <label className="text-[9px] text-gray-500">Quote</label>
                  <textarea className={inputClass + " resize-none"} rows={2} value={selected.props.quote || ""} onChange={e => handlePropChange("quote", e.target.value)} />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500">Author</label>
                  <input className={inputClass} value={selected.props.author || ""} onChange={e => handlePropChange("author", e.target.value)} />
                </div>
                <div>
                  <label className="text-[9px] text-gray-500">Role</label>
                  <input className={inputClass} value={selected.props.role || ""} onChange={e => handlePropChange("role", e.target.value)} />
                </div>
              </div>
            ) : selected.type === "faq" ? (
              <div className="space-y-2">
                <p className="text-[9px] text-gray-500">FAQ items (edição inline em breve)</p>
                {(selected.props.items || []).map((item: any, i: number) => (
                  <div key={i} className="rounded-lg bg-white/[0.02] p-2 space-y-1">
                    <input className={inputClass} value={item.q} placeholder="Pergunta" onChange={e => {
                      const items = [...(selected.props.items || [])];
                      items[i] = { ...items[i], q: e.target.value };
                      handlePropChange("items", items);
                    }} />
                    <input className={inputClass} value={item.a} placeholder="Resposta" onChange={e => {
                      const items = [...(selected.props.items || [])];
                      items[i] = { ...items[i], a: e.target.value };
                      handlePropChange("items", items);
                    }} />
                  </div>
                ))}
              </div>
            ) : (
              <textarea
                className={inputClass + " resize-none min-h-[60px]"}
                rows={3}
                value={selected.content}
                onChange={e => updateContent(selected.id, e.target.value)}
              />
            )}
          </div>
        )}

        {selected.type === "input" && (
          <div className={sectionClass}>
            <p className={labelClass}>Campo</p>
            <div>
              <label className="text-[9px] text-gray-500">Label</label>
              <input className={inputClass} value={selected.props.label || ""} onChange={e => handlePropChange("label", e.target.value)} />
            </div>
            <div>
              <label className="text-[9px] text-gray-500">Placeholder</label>
              <input className={inputClass} value={selected.props.placeholder || ""} onChange={e => handlePropChange("placeholder", e.target.value)} />
            </div>
          </div>
        )}

        {selected.type === "button" && (
          <div className={sectionClass}>
            <p className={labelClass}>Botão</p>
            <div>
              <label className="text-[9px] text-gray-500">Texto</label>
              <input className={inputClass} value={selected.content} onChange={e => updateContent(selected.id, e.target.value)} />
            </div>
            <div>
              <label className="text-[9px] text-gray-500">Link</label>
              <input className={inputClass} value={selected.props.href || ""} onChange={e => handlePropChange("href", e.target.value)} />
            </div>
          </div>
        )}

        <div className={dividerClass} />

        <div className={sectionClass}>
          <p className={labelClass}>Estilos</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] text-gray-500">Largura</label>
              <select className={inputClass} value={selected.styles.width || ""} onChange={e => handleStyleChange("width", e.target.value)}>
                <option value="w-full">100%</option>
                <option value="w-1/2">50%</option>
                <option value="w-1/3">33%</option>
                <option value="w-2/3">66%</option>
                <option value="w-1/4">25%</option>
                <option value="w-3/4">75%</option>
                <option value="w-auto">Auto</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] text-gray-500">Altura</label>
              <select className={inputClass} value={selected.styles.height || ""} onChange={e => handleStyleChange("height", e.target.value)}>
                <option value="">Auto</option>
                <option value="h-24">h-24</option>
                <option value="h-48">h-48</option>
                <option value="h-64">h-64</option>
                <option value="h-96">h-96</option>
                <option value="h-screen">Tela</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] text-gray-500">Padding</label>
              <select className={inputClass} value={selected.styles.padding || ""} onChange={e => handleStyleChange("padding", e.target.value)}>
                <option value="p-0">Nenhum</option>
                <option value="p-2">Pequeno</option>
                <option value="p-4">Médio</option>
                <option value="p-6">Grande</option>
                <option value="p-8">Extra</option>
                <option value="p-12">Maior</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] text-gray-500">Borda</label>
              <select className={inputClass} value={selected.styles.rounded || ""} onChange={e => handleStyleChange("rounded", e.target.value)}>
                <option value="">Nenhum</option>
                <option value="rounded">rounded</option>
                <option value="rounded-lg">rounded-lg</option>
                <option value="rounded-xl">rounded-xl</option>
                <option value="rounded-2xl">rounded-2xl</option>
                <option value="rounded-full">Arredondado</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] text-gray-500">Alinhamento</label>
              <select className={inputClass} value={selected.styles.align || ""} onChange={e => handleStyleChange("align", e.target.value)}>
                <option value="text-left">Esquerda</option>
                <option value="text-center">Centro</option>
                <option value="text-right">Direita</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] text-gray-500">Fundo</label>
              <select className={inputClass} value={selected.styles.bg || ""} onChange={e => handleStyleChange("bg", e.target.value)}>
                <option value="bg-transparent">Transparente</option>
                <option value="bg-white/5">White 5%</option>
                <option value="bg-white/10">White 10%</option>
                <option value="bg-primary/10">Primary 10%</option>
                <option value="bg-primary/20">Primary 20%</option>
                <option value="bg-gradient-to-br from-blue-500/10 to-indigo-500/5">Gradiente</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
