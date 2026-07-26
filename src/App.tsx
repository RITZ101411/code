import { useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { Titlebar } from "./components/Titlebar";
import { Editor } from "./components/Editor";
import {
  EditorTabs,
  type TabDropPosition,
} from "./components/EditorTabs";
import { FileTree } from "./components/FileTree";

interface OpenFile {
  path: string;
  name: string;
  content: string;
  savedContent: string;
}

function getFileName(path: string) {
  return path.split(/[/\\]/).pop() || path;
}

function App() {
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const latestOpenRequest = useRef(0);
  const [rootPath] = useState(() => {
    return "/Users/ritz/Projects/CodeEditorTauri";
  });

  async function handleFileSelect(path: string) {
    const requestId = ++latestOpenRequest.current;
    const openFile = openFiles.find((file) => file.path === path);

    if (openFile) {
      setActivePath(path);
      return;
    }

    try {
      const fileContent = await invoke<string>("read_file", { path });
      setOpenFiles((files) => {
        if (files.some((file) => file.path === path)) {
          return files;
        }

        return [
          ...files,
          {
            path,
            name: getFileName(path),
            content: fileContent,
            savedContent: fileContent,
          },
        ];
      });

      setActivePath((currentPath) =>
        requestId === latestOpenRequest.current || currentPath === null
          ? path
          : currentPath,
      );
    } catch (e) {
      console.error("Failed to open file:", e);
    }
  }

  async function handleSave() {
    const file = openFiles.find((openFile) => openFile.path === activePath);
    if (!file) return;

    const contentToSave = file.content;

    try {
      await invoke("write_file", {
        path: file.path,
        content: contentToSave,
      });
      setOpenFiles((files) =>
        files.map((openFile) =>
          openFile.path === file.path
            ? { ...openFile, savedContent: contentToSave }
            : openFile,
        ),
      );
    } catch (e) {
      console.error("Failed to save file:", e);
    }
  }

  function handleChange(path: string, content: string) {
    setOpenFiles((files) =>
      files.map((file) =>
        file.path === path ? { ...file, content } : file,
      ),
    );
  }

  function handleClose(path: string) {
    const closingIndex = openFiles.findIndex((file) => file.path === path);
    if (closingIndex === -1) return;

    const file = openFiles[closingIndex];
    const isDirty = file.content !== file.savedContent;

    if (
      isDirty &&
      !window.confirm(`${file.name}の未保存の変更を破棄しますか？`)
    ) {
      return;
    }

    const remainingFiles = openFiles.filter((openFile) => openFile.path !== path);
    setOpenFiles(remainingFiles);

    if (activePath === path) {
      const nextFile =
        remainingFiles[closingIndex] ?? remainingFiles[closingIndex - 1];
      setActivePath(nextFile?.path ?? null);
    }
  }

  function handleReorder(
    draggedPath: string,
    targetPath: string,
    position: TabDropPosition,
  ) {
    setOpenFiles((files) => {
      const sourceIndex = files.findIndex((file) => file.path === draggedPath);
      const targetIndex = files.findIndex((file) => file.path === targetPath);

      if (
        sourceIndex === -1 ||
        targetIndex === -1 ||
        sourceIndex === targetIndex
      ) {
        return files;
      }

      const reorderedFiles = [...files];
      const [draggedFile] = reorderedFiles.splice(sourceIndex, 1);
      const updatedTargetIndex = reorderedFiles.findIndex(
        (file) => file.path === targetPath,
      );
      const insertionIndex =
        position === "after" ? updatedTargetIndex + 1 : updatedTargetIndex;

      reorderedFiles.splice(insertionIndex, 0, draggedFile);
      const orderChanged = reorderedFiles.some(
        (file, index) => file.path !== files[index]?.path,
      );

      if (!orderChanged) {
        return files;
      }

      return reorderedFiles;
    });
  }

  return (
    <div
      className="flex flex-col h-screen bg-bg-primary text-text-primary font-sans"
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "s") {
          e.preventDefault();
          handleSave();
        }
        if (
          (e.metaKey || e.ctrlKey) &&
          e.key === "w" &&
          activePath !== null
        ) {
          e.preventDefault();
          handleClose(activePath);
        }
      }}
    >
      <Titlebar>
        <EditorTabs
          tabs={openFiles.map((file) => ({
            path: file.path,
            name: file.name,
            isDirty: file.content !== file.savedContent,
          }))}
          activePath={activePath}
          onSelect={setActivePath}
          onClose={handleClose}
          onReorder={handleReorder}
        />
      </Titlebar>
      <main className="flex flex-1 overflow-hidden">
        <aside className="w-60 min-w-50 shrink-0 bg-bg-sidebar border-r border-border p-2 overflow-y-auto overscroll-none">
          <FileTree rootPath={rootPath} onFileSelect={handleFileSelect} />
        </aside>
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-hidden">
            {openFiles.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-text-muted">
                ファイルツリーからファイルを開いてください
              </div>
            ) : (
              openFiles.map((file) => {
                const isActive = file.path === activePath;

                return (
                  <div
                    key={file.path}
                    className={isActive ? "h-full" : "hidden"}
                  >
                    <Editor
                      content={file.content}
                      isActive={isActive}
                      onChange={(content) => handleChange(file.path, content)}
                    />
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
