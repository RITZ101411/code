import "./App.css";

function App() {
  return (
    <main className="flex h-screen bg-bg-primary text-text-primary font-sans">
      <aside className="w-60 min-w-50 bg-bg-sidebar border-r border-border p-3 overflow-y-auto">
        <p className="text-sm text-text-muted">File Tree</p>
      </aside>
      <section className="flex-1 p-3 overflow-hidden">
        <p className="text-sm text-text-muted">Editor</p>
      </section>
    </main>
  );
}

export default App;
