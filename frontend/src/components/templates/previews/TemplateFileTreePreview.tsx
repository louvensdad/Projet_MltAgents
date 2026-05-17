"use client";

export default function TemplateFileTreePreview({ template }: { template: any }) {
  const files = template?.blueprint?.file_tree || template?.required_files || [];
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-slate-400">File Tree</span>
        <span className="text-[10px] text-slate-500">{files.length} files</span>
      </div>
      <div className="space-y-2">
        {files.map((file: string) => (
          <div key={file} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-200">
            {file}
          </div>
        ))}
      </div>
    </div>
  );
}

