import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface DirEntry {
  name: string;
  path: string;
  is_dir: boolean;
}

interface FileTreeProps {
  rootPath: string;
  onFileSelect: (path: string) => void;
}

export function FileTree({ rootPath, onFileSelect }: FileTreeProps) {
  const [entries, setEntries] = useState<DirEntry[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [children, setChildren] = useState<Record<string, DirEntry[]>>({});

  useEffect(() => {
    if (rootPath) {
      loadDir(rootPath).then(setEntries);
    }
  }, [rootPath]);

  async function loadDir(path: string): Promise<DirEntry[]> {
    try {
      return await invoke<DirEntry[]>("read_dir", { path });
    } catch (e) {
      console.error("Failed to read dir:", e);
      return [];
    }
  }

  async function toggleDir(path: string) {
    const next = new Set(expanded);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
      if (!children[path]) {
        const entries = await loadDir(path);
        setChildren((prev) => ({ ...prev, [path]: entries }));
      }
    }
    setExpanded(next);
  }

  function renderEntry(entry: DirEntry, depth: number) {
    const isOpen = expanded.has(entry.path);

    if (entry.is_dir) {
      return (
        <div key={entry.path}>
          <button
            className="w-full text-left px-2 py-0.5 text-sm hover:bg-bg-hover rounded truncate"
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={() => toggleDir(entry.path)}
          >
            <span className="mr-1">{isOpen ? "🔽" : "▶️"}</span>
            {entry.name}
          </button>
          {isOpen && children[entry.path]?.map((child) => renderEntry(child, depth + 1))}
        </div>
      );
    }

    return (
      <button
        key={entry.path}
        className="w-full text-left px-2 py-0.5 text-sm hover:bg-bg-hover rounded truncate"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => onFileSelect(entry.path)}
      >
        {entry.name}
      </button>
    );
  }

  return (
    <div className="text-text-primary">
      {entries.map((entry) => renderEntry(entry, 0))}
    </div>
  );
}
