"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle } from "lucide-react";

type DialogRequest =
  | { message: string; mode: "alert"; title: string }
  | { message: string; mode: "confirm"; title: string };

interface AlertContextValue {
  showAlert: (message: string, title?: string) => Promise<void>;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return context;
}

export default function AlertProvider({ children }: { children: ReactNode }) {
  const [dialogs, setDialogs] = useState<DialogRequest[]>([]);
  const resolvers = useRef<Array<(result: boolean) => void>>([]);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const activeDialog = dialogs[0];

  const showAlert = useCallback((message: string, title = "Thông báo") => {
    return new Promise<void>((resolve) => {
      resolvers.current.push(() => resolve());
      setDialogs((current) => [...current, { message, mode: "alert", title }]);
    });
  }, []);

  const showConfirm = useCallback((message: string, title = "Xác nhận") => {
    return new Promise<boolean>((resolve) => {
      resolvers.current.push(resolve);
      setDialogs((current) => [...current, { message, mode: "confirm", title }]);
    });
  }, []);

  const finishDialog = useCallback((result: boolean) => {
    const resolve = resolvers.current.shift();
    resolve?.(result);
    setDialogs((current) => current.slice(1));
  }, []);

  useEffect(() => {
    if (!activeDialog) return;
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeDialog]);

  useEffect(() => {
    if (!activeDialog) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finishDialog(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDialog, finishDialog]);

  const contextValue = useMemo(
    () => ({ showAlert, showConfirm }),
    [showAlert, showConfirm]
  );

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      {activeDialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) finishDialog(false);
          }}
        >
          <section
            aria-describedby="app-alert-message"
            aria-labelledby="app-alert-title"
            aria-modal="true"
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            role="alertdialog"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <AlertTriangle aria-hidden="true" size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="app-alert-title" className="text-lg font-bold text-slate-900">
                  {activeDialog.title}
                </h2>
                <p id="app-alert-message" className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {activeDialog.message}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              {activeDialog.mode === "confirm" && (
                <button
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={() => finishDialog(false)}
                  type="button"
                >
                  Hủy
                </button>
              )}
              <button
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                onClick={() => finishDialog(true)}
                ref={closeButtonRef}
                type="button"
              >
                {activeDialog.mode === "confirm" ? "Xác nhận" : "Đóng"}
              </button>
            </div>
          </section>
        </div>
      )}
    </AlertContext.Provider>
  );
}
