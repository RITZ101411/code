import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { Titlebar } from "./components/Titlebar";
import { Editor } from "./components/Editor";
import { FileTree } from "./components/FileTree";

function App() {
  const [content, setContent] = useState("");
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [rootPath] = useState(() => {
    // Default to home directory or current project
    return "/Users/ritz/Projects/CodeEditorTauri";
  });

  async function handleFileSelect(path: string) {
    try {
      const fileContent = await invoke<string>("read_file", { path });
      setContent(fileContent);
      setCurrentFile(path);
    } catch (e) {
      console.error("Failed to open file:", e);
    }
  }

  async function handleSave() {
    if (!currentFile) return;
    try {
      await invoke("write_file", { path: currentFile, content });
    } catch (e) {
      console.error("Failed to save file:", e);
    }
  }

  function handleChange(newContent: string) {
    setContent(newContent);
  }

  return (
    <div
      className="flex flex-col h-screen bg-bg-primary text-text-primary font-sans"
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "s") {
          e.preventDefault();
          handleSave();
        }
      }}
    >
      <Titlebar />
      <main className="flex flex-1 overflow-hidden">
        <aside className="w-60 min-w-50 bg-bg-sidebar border-r border-border p-2 overflow-y-auto">
          <FileTree rootPath={rootPath} onFileSelect={handleFileSelect} />
        </aside>
        <section className="flex-1 overflow-hidden">
          <Editor content={content} onChange={handleChange} />
        </section>
      </main>
    </div>
  );
}

export default App;
