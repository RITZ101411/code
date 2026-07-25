import "./App.css";

function App() {
  return (
    <div className="flex flex-col h-screen bg-bg-primary text-text-primary font-sans">
      <header
        className="h-9 shrink-0 bg-bg-sidebar border-b border-border flex items-center pl-20 pr-3 select-none"
        data-tauri-drag-region
      >
        <span className="text-xs text-text-muted" data-tauri-drag-region>
          CodeEditorTauri
        </span>
      </header>
      <main className="flex flex-1 overflow-hidden">
        <aside className="w-60 min-w-50 bg-bg-sidebar border-r border-border p-3 overflow-y-auto">
          <p className="text-sm text-text-muted">File Tree</p>
        </aside>
        <section className="flex-1 p-3 overflow-hidden">
          <p className="text-sm text-text-muted">Editor</p>
        </section>
      </main>
    </div>
  );
}

export default App;
