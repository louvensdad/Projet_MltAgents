export type ElementType =
  | "container" | "section" | "grid" | "flex-row" | "flex-col"
  | "heading" | "text" | "image" | "button" | "link" | "icon"
  | "navbar" | "hero" | "card" | "faq" | "form" | "input"
  | "footer" | "pricing" | "testimonial";

export type ElementCategory = "layout" | "content" | "components";

export interface ElementMeta {
  type: ElementType;
  label: string;
  icon: string;
  category: ElementCategory;
  tag: string;
  defaultContent: string;
  defaultStyles: Record<string, string>;
  defaultProps: Record<string, any>;
  canHaveChildren: boolean;
  allowedChildren?: ElementType[];
}

export interface BuilderElement {
  id: string;
  type: ElementType;
  tag: string;
  label: string;
  parentId: string | null;
  children: string[];
  content: string;
  props: Record<string, any>;
  styles: Record<string, string>;
  meta: ElementMeta;
}

export interface BuilderState {
  elements: Record<string, BuilderElement>;
  rootIds: string[];
  selectedId: string | null;
  nextId: number;
}

export type BuilderAction =
  | { type: "ADD_ELEMENT"; elementType: ElementType; parentId?: string }
  | { type: "REMOVE_ELEMENT"; id: string }
  | { type: "SELECT_ELEMENT"; id: string | null }
  | { type: "UPDATE_PROPS"; id: string; props: Record<string, any> }
  | { type: "UPDATE_STYLES"; id: string; styles: Record<string, string> }
  | { type: "UPDATE_CONTENT"; id: string; content: string }
  | { type: "MOVE_UP"; id: string }
  | { type: "MOVE_DOWN"; id: string }
  | { type: "DUPLICATE"; id: string }
  | { type: "REPARENT"; id: string; newParentId: string | null }
  | { type: "CLEAR_ALL" }
  | { type: "LOAD_STATE"; state: BuilderState };

export const ELEMENT_META: Record<ElementType, ElementMeta> = {
  container: {
    type: "container", label: "Div/Container", icon: "▣",
    category: "layout", tag: "div", defaultContent: "",
    defaultStyles: { padding: "p-6", width: "w-full", bg: "bg-white/5", rounded: "rounded-xl", border: "border border-white/10" },
    defaultProps: {}, canHaveChildren: true,
  },
  section: {
    type: "section", label: "Section", icon: "◈",
    category: "layout", tag: "section", defaultContent: "",
    defaultStyles: { padding: "py-16 px-6", width: "w-full", bg: "bg-transparent" },
    defaultProps: {}, canHaveChildren: true,
  },
  grid: {
    type: "grid", label: "Grid", icon: "⊞",
    category: "layout", tag: "div", defaultContent: "",
    defaultStyles: { display: "grid", cols: "grid-cols-3", gap: "gap-4", width: "w-full" },
    defaultProps: { cols: 3 }, canHaveChildren: true,
  },
  "flex-row": {
    type: "flex-row", label: "Flex Row", icon: "⇉",
    category: "layout", tag: "div", defaultContent: "",
    defaultStyles: { display: "flex", direction: "flex-row", gap: "gap-4", width: "w-full", align: "items-center" },
    defaultProps: {}, canHaveChildren: true,
  },
  "flex-col": {
    type: "flex-col", label: "Flex Column", icon: "⇊",
    category: "layout", tag: "div", defaultContent: "",
    defaultStyles: { display: "flex", direction: "flex-col", gap: "gap-3", width: "w-full" },
    defaultProps: {}, canHaveChildren: true,
  },
  heading: {
    type: "heading", label: "Heading", icon: "H",
    category: "content", tag: "h2", defaultContent: "Título do Site",
    defaultStyles: { color: "text-white", size: "text-3xl", weight: "font-bold", align: "text-left", width: "w-full" },
    defaultProps: { level: 2 }, canHaveChildren: false,
  },
  text: {
    type: "text", label: "Text", icon: "¶",
    category: "content", tag: "p", defaultContent: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
    defaultStyles: { color: "text-gray-300", size: "text-base", align: "text-left", width: "w-full" },
    defaultProps: {}, canHaveChildren: false,
  },
  image: {
    type: "image", label: "Image", icon: "🖼",
    category: "content", tag: "img", defaultContent: "",
    defaultStyles: { width: "w-full", height: "h-48", rounded: "rounded-xl", objectFit: "object-cover" },
    defaultProps: { src: "/placeholder.svg", alt: "Placeholder" }, canHaveChildren: false,
  },
  button: {
    type: "button", label: "Button", icon: "▶",
    category: "content", tag: "button", defaultContent: "Clique Aqui",
    defaultStyles: { padding: "px-6 py-3", bg: "bg-primary", color: "text-white", rounded: "rounded-xl", size: "text-sm", weight: "font-semibold", border: "border border-primary/20" },
    defaultProps: { href: "" }, canHaveChildren: false,
  },
  link: {
    type: "link", label: "Link", icon: "🔗",
    category: "content", tag: "a", defaultContent: "Saiba mais",
    defaultStyles: { color: "text-primary", size: "text-sm", weight: "font-medium", align: "text-left" },
    defaultProps: { href: "#" }, canHaveChildren: false,
  },
  icon: {
    type: "icon", label: "Icon", icon: "◇",
    category: "content", tag: "span", defaultContent: "★",
    defaultStyles: { color: "text-primary", size: "text-2xl", align: "text-center", width: "w-8" },
    defaultProps: {}, canHaveChildren: false,
  },
  navbar: {
    type: "navbar", label: "Navbar", icon: "≡",
    category: "components", tag: "nav", defaultContent: "",
    defaultStyles: { padding: "px-6 py-4", bg: "bg-white/5", width: "w-full", border: "border-b border-white/10" },
    defaultProps: { links: ["Home", "Sobre", "Serviços", "Contato"] }, canHaveChildren: true,
    allowedChildren: ["container", "flex-row", "button", "link", "icon"],
  },
  hero: {
    type: "hero", label: "Hero", icon: "★",
    category: "components", tag: "section", defaultContent: "",
    defaultStyles: { padding: "py-20 px-6", width: "w-full", bg: "bg-gradient-to-br from-blue-500/10 to-indigo-500/5", align: "text-center" },
    defaultProps: { title: "Transforme seu Negócio", subtitle: "Soluções inovadoras para o futuro", ctaText: "Começar Agora" },
    canHaveChildren: true,
    allowedChildren: ["container", "heading", "text", "button", "flex-row", "flex-col", "image"],
  },
  card: {
    type: "card", label: "Card", icon: "◆",
    category: "components", tag: "div", defaultContent: "",
    defaultStyles: { padding: "p-6", bg: "bg-white/5", rounded: "rounded-xl", border: "border border-white/10", width: "w-full" },
    defaultProps: {}, canHaveChildren: true,
    allowedChildren: ["heading", "text", "image", "button", "icon", "container"],
  },
  faq: {
    type: "faq", label: "FAQ", icon: "?",
    category: "components", tag: "div", defaultContent: "",
    defaultStyles: { padding: "p-6", width: "w-full", bg: "bg-white/5", rounded: "rounded-xl", border: "border border-white/10" },
    defaultProps: { items: [{ q: "Como funciona?", a: "Resposta aqui" }, { q: "Quanto custa?", a: "Valores acessíveis" }] },
    canHaveChildren: true,
  },
  form: {
    type: "form", label: "Form", icon: "✉",
    category: "components", tag: "form", defaultContent: "",
    defaultStyles: { padding: "p-6", bg: "bg-white/5", rounded: "rounded-xl", border: "border border-white/10", width: "w-full" },
    defaultProps: {}, canHaveChildren: true,
    allowedChildren: ["input", "button", "container", "flex-row", "flex-col"],
  },
  input: {
    type: "input", label: "Input", icon: "⎕",
    category: "components", tag: "input", defaultContent: "",
    defaultStyles: { padding: "px-4 py-2", bg: "bg-white/10", rounded: "rounded-lg", border: "border border-white/10", width: "w-full", color: "text-white" },
    defaultProps: { placeholder: "Digite aqui...", type: "text", label: "Campo" },
    canHaveChildren: false,
  },
  footer: {
    type: "footer", label: "Footer", icon: "—",
    category: "components", tag: "footer", defaultContent: "",
    defaultStyles: { padding: "py-12 px-6", bg: "bg-white/5", width: "w-full", border: "border-t border-white/10" },
    defaultProps: { copyright: "© 2026 Todos os direitos reservados." },
    canHaveChildren: true,
    allowedChildren: ["container", "flex-row", "flex-col", "text", "link", "icon"],
  },
  pricing: {
    type: "pricing", label: "Pricing", icon: "$",
    category: "components", tag: "div", defaultContent: "",
    defaultStyles: { padding: "p-6", bg: "bg-white/5", rounded: "rounded-xl", border: "border border-white/10", width: "w-full" },
    defaultProps: { plan: "Professional", price: "R$ 97", period: "/mês", features: ["Feature 1", "Feature 2", "Feature 3"] },
    canHaveChildren: true,
  },
  testimonial: {
    type: "testimonial", label: "Testimonial", icon: "💬",
    category: "components", tag: "div", defaultContent: "",
    defaultStyles: { padding: "p-6", bg: "bg-white/5", rounded: "rounded-xl", border: "border border-white/10", width: "w-full" },
    defaultProps: { quote: "Produto incrível! Transformou nosso negócio.", author: "João Silva", role: "CEO, Empresa X" },
    canHaveChildren: true,
  },
};

export const ELEMENT_CATEGORIES: { key: ElementCategory; label: string; icon: string }[] = [
  { key: "layout", label: "Layout", icon: "⊞" },
  { key: "content", label: "Conteúdo", icon: "¶" },
  { key: "components", label: "Componentes", icon: "◆" },
];

let _nextId = 1;
export function generateId(): string {
  return `el_${_nextId++}`;
}
export function resetIdCounter(val = 1) { _nextId = val; }

export function createElement(type: ElementType, parentId: string | null = null): BuilderElement {
  const meta = ELEMENT_META[type];
  const id = generateId();
  return {
    id,
    type,
    tag: meta.tag,
    label: meta.label,
    parentId,
    children: [],
    content: meta.defaultContent,
    props: { ...meta.defaultProps },
    styles: { ...meta.defaultStyles },
    meta,
  };
}

export function createInitialState(): BuilderState {
  resetIdCounter(1);
  const page = createElement("section", null);
  page.id = "root";
  page.label = "Page";
  return {
    elements: { root: page },
    rootIds: ["root"],
    selectedId: null,
    nextId: 2,
  };
}

export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case "ADD_ELEMENT": {
      const parentId = action.parentId || state.rootIds[0] || "root";
      const parent = state.elements[parentId];
      if (!parent) return state;
      const el = createElement(action.elementType, parentId);
      const nextId = state.nextId + 1;
      return {
        ...state,
        elements: {
          ...state.elements,
          [el.id]: el,
          [parentId]: { ...parent, children: [...parent.children, el.id] },
        },
        selectedId: el.id,
        nextId,
      };
    }
    case "REMOVE_ELEMENT": {
      const { [action.id]: removed, ...rest } = state.elements;
      if (!removed) return state;
      const removeRecursive = (ids: string[]): Record<string, BuilderElement> => {
        let acc = { ...rest };
        for (const id of ids) {
          const el = acc[id];
          if (el) {
            const { [id]: _, ...without } = acc;
            acc = without;
            if (el.children.length > 0) {
              acc = removeRecursive(el.children);
            }
          }
        }
        return acc;
      };
      const newElements = removeRecursive([action.id]);
      if (removed.parentId) {
        const parent = newElements[removed.parentId];
        if (parent) {
          newElements[removed.parentId] = {
            ...parent,
            children: parent.children.filter(c => c !== action.id),
          };
        }
      }
      return {
        ...state,
        elements: newElements,
        rootIds: state.rootIds.filter(r => r !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      };
    }
    case "SELECT_ELEMENT":
      return { ...state, selectedId: action.id };
    case "UPDATE_PROPS": {
      const el = state.elements[action.id];
      if (!el) return state;
      return {
        ...state,
        elements: {
          ...state.elements,
          [action.id]: { ...el, props: { ...el.props, ...action.props } },
        },
      };
    }
    case "UPDATE_STYLES": {
      const el = state.elements[action.id];
      if (!el) return state;
      return {
        ...state,
        elements: {
          ...state.elements,
          [action.id]: { ...el, styles: { ...el.styles, ...action.styles } },
        },
      };
    }
    case "UPDATE_CONTENT": {
      const el = state.elements[action.id];
      if (!el) return state;
      return {
        ...state,
        elements: {
          ...state.elements,
          [action.id]: { ...el, content: action.content },
        },
      };
    }
    case "MOVE_UP": {
      const el = state.elements[action.id];
      if (!el || !el.parentId) return state;
      const parent = state.elements[el.parentId];
      if (!parent) return state;
      const idx = parent.children.indexOf(action.id);
      if (idx <= 0) return state;
      const newChildren = [...parent.children];
      [newChildren[idx - 1], newChildren[idx]] = [newChildren[idx], newChildren[idx - 1]];
      return {
        ...state,
        elements: { ...state.elements, [el.parentId]: { ...parent, children: newChildren } },
      };
    }
    case "MOVE_DOWN": {
      const el = state.elements[action.id];
      if (!el || !el.parentId) return state;
      const parent = state.elements[el.parentId];
      if (!parent) return state;
      const idx = parent.children.indexOf(action.id);
      if (idx < 0 || idx >= parent.children.length - 1) return state;
      const newChildren = [...parent.children];
      [newChildren[idx], newChildren[idx + 1]] = [newChildren[idx + 1], newChildren[idx]];
      return {
        ...state,
        elements: { ...state.elements, [el.parentId]: { ...parent, children: newChildren } },
      };
    }
    case "DUPLICATE": {
      const original = state.elements[action.id];
      if (!original) return state;
      const cloneId = generateId();
      const clone: BuilderElement = {
        ...JSON.parse(JSON.stringify(original)),
        id: cloneId,
        parentId: original.parentId,
        children: [],
      };
      const newNextId = state.nextId + 1;
      const newElements = { ...state.elements, [cloneId]: clone };
      if (clone.parentId) {
        const parent = newElements[clone.parentId];
        if (parent) {
          const idx = parent.children.indexOf(action.id);
          const newChildren = [...parent.children];
          newChildren.splice(idx + 1, 0, cloneId);
          newElements[clone.parentId] = { ...parent, children: newChildren };
        }
      }
      return { ...state, elements: newElements, selectedId: cloneId, nextId: newNextId };
    }
    case "REPARENT": {
      const el = state.elements[action.id];
      if (!el) return state;
      const oldParent = el.parentId ? state.elements[el.parentId] : null;
      const newParentId = action.newParentId;
      const newParent = newParentId ? state.elements[newParentId] : null;
      const newElements = { ...state.elements };
      if (oldParent) {
        newElements[oldParent.id] = { ...oldParent, children: oldParent.children.filter(c => c !== action.id) };
      }
      newElements[action.id] = { ...el, parentId: newParentId };
      if (newParent && newParentId) {
        newElements[newParentId] = { ...newParent, children: [...newParent.children, action.id] };
      }
      return {
        ...state,
        elements: newElements,
        rootIds: newParentId === null
          ? [...state.rootIds.filter(r => r !== action.id), action.id]
          : state.rootIds.filter(r => r !== action.id),
      };
    }
    case "CLEAR_ALL":
      return createInitialState();
    case "LOAD_STATE":
      return action.state;
    default:
      return state;
  }
}

export function generateHtml(state: BuilderState): { html: string; css: string; js: string } {
  const page = state.elements["root"] || state.elements[state.rootIds[0]];
  if (!page) return { html: "<!-- vazio -->", css: "", js: "" };

  function renderElement(id: string, depth: number = 0): string {
    const el = state.elements[id];
    if (!el) return "";
    const indent = "  ".repeat(depth);
    const classes = Object.values(el.styles).filter(Boolean).join(" ");
    const tag = el.tag;

    let attrs = `class="${classes}"`;
    if (el.props.href) attrs += ` href="${el.props.href}"`;
    if (el.props.src) attrs += ` src="${el.props.src}" alt="${el.props.alt || ""}"`;
    if (el.props.placeholder) attrs += ` placeholder="${el.props.placeholder}"`;
    if (el.props.type && el.tag === "input") attrs += ` type="${el.props.type}"`;

    let inner = "";
    const hasCustomRender = ["hero", "navbar", "faq", "pricing", "testimonial", "card"].includes(el.type);

    if (hasCustomRender) {
      inner = renderCustomComponent(el, state, depth);
    } else if (el.children.length > 0) {
      inner = "\n" + el.children.map(cid => renderElement(cid, depth + 1)).join("\n") + "\n" + indent;
    } else if (el.tag !== "img" && el.tag !== "input") {
      inner = el.content || "";
    }

    if (el.tag === "img" || el.tag === "input") {
      return `${indent}<${tag} ${attrs}>`;
    }
    return `${indent}<${tag} ${attrs}>\n${inner}\n${indent}</${tag}>`;
  }

  function renderCustomComponent(el: BuilderElement, st: BuilderState, depth: number): string {
    const indent = "  ".repeat(depth + 1);
    const inner = el.children.length > 0
      ? "\n" + el.children.map(cid => renderElement(cid, depth + 1)).join("\n") + "\n" + "  ".repeat(depth)
      : "";

    switch (el.type) {
      case "hero":
        return `${indent}<h1 class="text-4xl font-bold text-white mb-4">${el.props.title || "Title"}</h1>\n${indent}<p class="text-lg text-gray-300 mb-6">${el.props.subtitle || ""}</p>\n${indent}<button class="px-8 py-3 bg-primary text-white rounded-xl font-semibold">${el.props.ctaText || "CTA"}</button>${inner}`;
      case "navbar":
        return `${indent}<div class="flex items-center justify-between">\n${indent}  <span class="text-xl font-bold text-white">Logo</span>\n${indent}  <div class="flex gap-6">\n${(el.props.links || []).map((l: string) => `${indent}    <a href="#" class="text-sm text-gray-300 hover:text-white">${l}</a>`).join("\n")}\n${indent}  </div>\n${indent}</div>${inner}`;
      case "faq":
        return (el.props.items || []).map((item: any, i: number) =>
          `${indent}<div class="border-b border-white/10 py-4">\n${indent}  <button class="flex items-center justify-between w-full text-left">\n${indent}    <span class="font-medium text-white">${item.q}</span>\n${indent}    <span class="text-gray-400">▼</span>\n${indent}  </button>\n${indent}  <p class="mt-2 text-gray-400 text-sm">${item.a}</p>\n${indent}</div>`
        ).join("\n") + inner;
      case "pricing":
        return `${indent}<h3 class="text-xl font-bold text-white mb-2">${el.props.plan || "Plan"}</h3>\n${indent}<p class="text-3xl font-bold text-primary mb-4">${el.props.price || "$0"}<span class="text-sm text-gray-400">${el.props.period || ""}</span></p>\n${indent}<ul class="space-y-2 mb-6">\n${(el.props.features || []).map((f: string) => `${indent}  <li class="flex items-center gap-2 text-sm text-gray-300">✓ ${f}</li>`).join("\n")}\n${indent}</ul>\n${indent}<button class="w-full py-3 bg-primary text-white rounded-xl font-semibold">Assinar</button>${inner}`;
      case "testimonial":
        return `${indent}<p class="text-gray-300 italic mb-4">"${el.props.quote || ""}"</p>\n${indent}<div class="flex items-center gap-3">\n${indent}  <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">${(el.props.author || "U")[0]}</div>\n${indent}  <div>\n${indent}    <p class="text-sm font-medium text-white">${el.props.author || ""}</p>\n${indent}    <p class="text-xs text-gray-400">${el.props.role || ""}</p>\n${indent}  </div>\n${indent}</div>${inner}`;
      default:
        return inner || el.content || "";
    }
  }

  const bodyContent = page.children.map(cid => renderElement(cid)).join("\n\n");
  const allStyles = collectStyles(state);

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${page.props.title || "Meu Site"}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #050508; color: #f8fafc; }
    ${allStyles}
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;

  return { html, css: allStyles, js: "" };
}

function collectStyles(state: BuilderState): string {
  const lines: string[] = [];
  for (const el of Object.values(state.elements)) {
    if (el.styles.bg?.startsWith("bg-gradient")) {
      const match = el.styles.bg.match(/bg-gradient-to-([a-z]+)/);
      if (match) {
        const dir = match[1];
        const from = el.styles.bg.match(/from-([a-zA-Z0-9-]+)/);
        const to = el.styles.bg.match(/to-([a-zA-Z0-9-]+)/);
        if (from && to) {
          lines.push(`.el-${el.id} { background: linear-gradient(to ${dir === "r" ? "right" : dir === "l" ? "left" : dir === "t" ? "top" : "bottom"}, var(--tw-${from[1]}) 0%, var(--tw-${to[1]}) 100%); }`);
        }
      }
    }
  }
  return lines.join("\n");
}

export function saveBuilderState(state: BuilderState): string {
  return JSON.stringify(state);
}
export function loadBuilderState(json: string): BuilderState | null {
  try { return JSON.parse(json); } catch { return null; }
}
