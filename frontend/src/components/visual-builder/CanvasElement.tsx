"use client";

import { motion } from "framer-motion";
import { useVisualBuilder } from "./VisualBuilderContext";
import type { BuilderElement, BuilderState } from "./builderSchema";

interface Props {
  element: BuilderElement;
  state: BuilderState;
  depth?: number;
}

export default function CanvasElement({ element, state, depth = 0 }: Props) {
  const { selectElement, state: builderState } = useVisualBuilder();
  const isSelected = builderState.selectedId === element.id;
  const hasChildren = element.children.length > 0;

  const childElements = element.children
    .map(id => state.elements[id])
    .filter(Boolean);

  const baseClasses = Object.values(element.styles).filter(Boolean).join(" ");
  const selectedClass = isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:ring-1 hover:ring-white/20";
  const dropZoneClass = "relative";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onClick={(e) => {
        e.stopPropagation();
        selectElement(element.id);
      }}
      className={`${dropZoneClass} ${baseClasses} ${selectedClass} cursor-pointer transition-all`}
      style={{ minHeight: hasChildren ? undefined : "auto" }}
    >
      {renderContent(element, childElements, state)}

      {isSelected && (
        <div className="absolute -top-2.5 left-2 flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5">
          <span className="text-[8px] font-bold text-white uppercase">{element.label}</span>
          <span className="text-[7px] text-white/60">#{element.id.slice(-4)}</span>
        </div>
      )}
    </motion.div>
  );
}

function renderContent(el: BuilderElement, children: BuilderElement[], st: BuilderState) {
  if (children.length > 0) {
    return (
      <div className="space-y-2">
        {children.map(child => (
          <CanvasElement key={child.id} element={child} state={st} depth={1} />
        ))}
      </div>
    );
  }

  switch (el.type) {
    case "image":
      return (
        <div className="flex h-full w-full items-center justify-center rounded-lg bg-white/[0.03]">
          <span className="text-4xl text-gray-600">🖼</span>
        </div>
      );
    case "input":
      return (
        <div className="space-y-1">
          {el.props.label && (
            <label className="text-[11px] font-medium text-gray-400">{el.props.label}</label>
          )}
          <div className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm text-gray-400">
            {el.props.placeholder || "Digite..."}
          </div>
        </div>
      );
    case "button":
      return (
        <span>{el.content}</span>
      );
    case "heading":
      return (
        <span>{el.content}</span>
      );
    case "text":
      return (
        <span>{el.content}</span>
      );
    case "link":
      return (
        <span>{el.content}</span>
      );
    case "icon":
      return (
        <span>{el.content}</span>
      );
    case "hero":
      return (
        <div className="space-y-4">
          <div className="text-3xl font-bold text-white">{el.props.title}</div>
          <div className="text-base text-gray-300">{el.props.subtitle}</div>
          <div className="inline-block rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white">
            {el.props.ctaText}
          </div>
        </div>
      );
    case "navbar":
      return (
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-white">Logo</span>
          <div className="flex gap-4">
            {(el.props.links || []).map((link: string, i: number) => (
              <span key={i} className="text-xs text-gray-300">{link}</span>
            ))}
          </div>
        </div>
      );
    case "faq":
      return (
        <div className="space-y-2">
          {(el.props.items || []).map((item: any, i: number) => (
            <div key={i} className="border-b border-white/10 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{item.q}</span>
                <span className="text-xs text-gray-400">▼</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">{item.a}</p>
            </div>
          ))}
        </div>
      );
    case "pricing":
      return (
        <div className="text-center">
          <div className="text-lg font-bold text-white">{el.props.plan}</div>
          <div className="mt-2 text-3xl font-bold text-primary">
            {el.props.price}
            <span className="text-sm text-gray-400">{el.props.period}</span>
          </div>
          <ul className="mt-4 space-y-2">
            {(el.props.features || []).map((f: string, i: number) => (
              <li key={i} className="flex items-center gap-2 text-xs text-gray-300">✓ {f}</li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white">
            Assinar
          </div>
        </div>
      );
    case "testimonial":
      return (
        <div>
          <p className="text-sm text-gray-300 italic">&ldquo;{el.props.quote}&rdquo;</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
              {(el.props.author || "U")[0]}
            </div>
            <div>
              <p className="text-xs font-medium text-white">{el.props.author}</p>
              <p className="text-[10px] text-gray-400">{el.props.role}</p>
            </div>
          </div>
        </div>
      );
    default:
      return el.content ? <span>{el.content}</span> : null;
  }
}
