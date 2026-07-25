export function Titlebar() {
  return (
    <header
      className="h-9 shrink-0 bg-bg-sidebar border-b border-border flex items-center pl-20 pr-3 select-none"
      data-tauri-drag-region
    >
      <span className="text-xs text-text-muted" data-tauri-drag-region>
        CodeEditorTauri
      </span>
    </header>
  );
}
