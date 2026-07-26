import type { ReactNode } from "react";

interface TitlebarProps {
  children: ReactNode;
}

export function Titlebar({ children }: TitlebarProps) {
  return (
    <header
      className="flex h-9 shrink-0 select-none border-b border-border bg-bg-sidebar"
      data-tauri-decorum-tb
    >
      <div
        className="flex h-full w-60 shrink-0 items-center border-r border-border pl-20"
        data-tauri-drag-region
      >
        <span className="text-xs text-text-muted" data-tauri-drag-region>
          CodeEditorTauri
        </span>
      </div>
      <div
        className="h-full min-w-0 flex-1"
        data-tauri-drag-region
      >
        {children}
      </div>
    </header>
  );
}
