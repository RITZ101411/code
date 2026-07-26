import { Fragment, useEffect, useRef, useState } from "react";

export type TabDropPosition = "before" | "after";

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
  onReorder: (
    draggedPath: string,
    targetPath: string,
    position: TabDropPosition,
  ) => void;
}

interface TabPointerDrag {
  path: string;
  pointerId: number;
  startX: number;
  startLeft: number;
  startTop: number;
  width: number;
  height: number;
  isDragging: boolean;
}

export function EditorTabs({
  tabs,
  activePath,
  onSelect,
  onClose,
  onReorder,
}: EditorTabsProps) {
  const [draggedPath, setDraggedPath] = useState<string | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const tabStrip = useRef<HTMLDivElement>(null);
  const pointerDrag = useRef<TabPointerDrag | null>(null);
  const tabsRef = useRef(tabs);
  const onReorderRef = useRef(onReorder);

  tabsRef.current = tabs;
  onReorderRef.current = onReorder;

  useEffect(() => {
    function resetDragState() {
      const drag = pointerDrag.current;
      if (drag && tabStrip.current?.hasPointerCapture(drag.pointerId)) {
        tabStrip.current.releasePointerCapture(drag.pointerId);
      }

      pointerDrag.current = null;
      setDraggedPath(null);
      setDragOffsetX(0);
    }

    function handlePointerMove(event: PointerEvent) {
      const drag = pointerDrag.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      event.preventDefault();

      if (!drag.isDragging) {
        if (Math.abs(event.clientX - drag.startX) < 4) return;

        drag.isDragging = true;
        setDraggedPath(drag.path);
      }

      const stripBounds = tabStrip.current?.getBoundingClientRect();
      if (!stripBounds) return;

      const desiredLeft = drag.startLeft + event.clientX - drag.startX;
      const maxLeft = Math.max(
        stripBounds.left,
        stripBounds.right - drag.width,
      );
      const draggedLeft = Math.min(
        Math.max(desiredLeft, stripBounds.left),
        maxLeft,
      );
      const offsetX = draggedLeft - drag.startLeft;
      const draggedCenterX = draggedLeft + drag.width / 2;
      setDragOffsetX(offsetX);

      const candidates = Array.from(
        tabStrip.current?.querySelectorAll<HTMLElement>("[data-tab-path]") ??
          [],
      ).filter((element) => element.dataset.tabPath !== drag.path);

      let nextTarget: {
        path: string;
        position: TabDropPosition;
      } | null = null;

      for (const candidate of candidates) {
        const candidatePath = candidate.dataset.tabPath;
        if (!candidatePath) continue;

        const bounds = candidate.getBoundingClientRect();
        if (draggedCenterX < bounds.left + bounds.width / 2) {
          nextTarget = { path: candidatePath, position: "before" };
          break;
        }
      }

      if (!nextTarget && candidates.length > 0) {
        const lastPath = candidates[candidates.length - 1]?.dataset.tabPath;
        if (lastPath) {
          nextTarget = { path: lastPath, position: "after" };
        }
      }

      if (!nextTarget) return;

      const currentTabs = tabsRef.current;
      const sourceIndex = currentTabs.findIndex(
        (item) => item.path === drag.path,
      );
      const targetIndex = currentTabs.findIndex(
        (item) => item.path === nextTarget.path,
      );
      const isAlreadyPositioned =
        nextTarget.position === "before"
          ? sourceIndex + 1 === targetIndex
          : sourceIndex === targetIndex + 1;

      if (!isAlreadyPositioned) {
        onReorderRef.current(
          drag.path,
          nextTarget.path,
          nextTarget.position,
        );
      }
    }

    function handlePointerEnd(event: PointerEvent) {
      const drag = pointerDrag.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      if (drag.isDragging) {
        event.preventDefault();
      }

      resetDragState();
    }

    window.addEventListener("pointermove", handlePointerMove, {
      passive: false,
    });
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);
    window.addEventListener("blur", resetDragState);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
      window.removeEventListener("blur", resetDragState);
    };
  }, []);

  return (
    <div
      ref={tabStrip}
      className="tab-strip flex h-full overflow-x-auto overscroll-none bg-bg-sidebar"
      role="tablist"
      aria-label="開いているファイル"
      data-tauri-drag-region
    >
      {tabs.map((tab) => {
        const isActive = tab.path === activePath;
        const isDragging = tab.path === draggedPath;
        const drag = pointerDrag.current;

        return (
          <Fragment key={tab.path}>
            {isDragging && (
              <div
                className="min-w-32 max-w-56 shrink-0 border-r border-border"
                style={{ width: drag?.width, height: drag?.height }}
                aria-hidden
              />
            )}
            <div
              data-tab-path={tab.path}
              className={[
                "group relative flex min-w-32 max-w-56 shrink-0 cursor-grab items-center border-r border-border active:cursor-grabbing",
                isActive
                  ? "bg-bg-primary text-text-primary"
                  : "bg-bg-sidebar text-text-muted hover:bg-bg-hover",
                isDragging
                  ? "pointer-events-none z-10 opacity-90 shadow-lg"
                  : "",
              ].join(" ")}
              style={
                isDragging
                  ? {
                      position: "fixed",
                      left: drag?.startLeft,
                      top: drag?.startTop,
                      width: drag?.width,
                      height: drag?.height,
                      transform: `translateX(${dragOffsetX}px)`,
                      willChange: "transform",
                    }
                  : undefined
              }
              onPointerDown={(event) => {
                if (event.button !== 0) return;

                const target = event.target as HTMLElement;
                if (target.closest("[data-tab-close]")) return;

                event.preventDefault();
                tabStrip.current?.setPointerCapture(event.pointerId);
                const bounds = event.currentTarget.getBoundingClientRect();
                pointerDrag.current = {
                  path: tab.path,
                  pointerId: event.pointerId,
                  startX: event.clientX,
                  startLeft: bounds.left,
                  startTop: bounds.top,
                  width: bounds.width,
                  height: bounds.height,
                  isDragging: false,
                };
                onSelect(tab.path);
              }}
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
                data-tab-close
                onClick={() => onClose(tab.path)}
              >
                ×
              </button>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
