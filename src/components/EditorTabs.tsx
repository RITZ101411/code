interface EditorTabItem {
  path: string;
  name: string;
  isDirty: boolean;
}

interface EditorTabsProps {
  tabs: EditorTabItem[];
  activePath: string | null;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
}

export function EditorTabs({
  tabs,
  activePath,
  onSelect,
  onClose,
}: EditorTabsProps) {
  return (
    <div
      className="tab-strip flex h-full overflow-x-auto overscroll-none bg-bg-sidebar"
      role="tablist"
      aria-label="開いているファイル"
      data-tauri-drag-region
    >
      {tabs.map((tab) => {
        const isActive = tab.path === activePath;

        return (
          <div
            key={tab.path}
            className={[
              "group flex min-w-32 max-w-56 shrink-0 items-center border-r border-border",
              isActive
                ? "bg-bg-primary text-text-primary"
                : "bg-bg-sidebar text-text-muted hover:bg-bg-hover",
            ].join(" ")}
          >
            <button
              type="button"
              className="min-w-0 flex-1 truncate py-2 pl-3 text-left text-xs"
              title={tab.path}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelect(tab.path)}
              onAuxClick={(event) => {
                if (event.button === 1) {
                  onClose(tab.path);
                }
              }}
            >
              {tab.name}
            </button>
            {tab.isDirty && (
              <span
                className="mr-1 text-[10px] text-amber-400"
                aria-label="未保存"
                title="未保存"
              >
                ●
              </span>
            )}
            <button
              type="button"
              className="mr-1 grid size-6 shrink-0 place-items-center rounded text-base leading-none text-text-muted hover:bg-bg-hover hover:text-text-primary"
              aria-label={`${tab.name}を閉じる`}
              title="閉じる"
              onClick={() => onClose(tab.path)}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
