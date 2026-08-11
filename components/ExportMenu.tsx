"use client";

import { useEffect, useRef, useState } from "react";

import {
  type ExportFormat,
  exportAllIdeas,
  exportIdea,
} from "@/lib/export";
import type { SaasIdea } from "@/lib/types";

// ── Icons ──────────────────────────────────────────────────────────────────

function IconText() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M2 3h11M2 7h11M2 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconMarkdown() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="1" y="3" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3.5 10V5.5L5.5 8l2-2.5V10M10 10l1.5-2.25L13 10M10 10V5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconJson() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M4 3C3 3 2 3.7 2 5v1.5c0 1-.5 1.5-1 1.5.5 0 1 .5 1 1.5V11c0 1.3 1 2 2 2M11 3c1 0 2 .7 2 2v1.5c0 1 .5 1.5 1 1.5-.5 0-1 .5-1 1.5V11c0 1.3-1 2-2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconImage() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="5" cy="6" r="1" fill="currentColor" />
      <path d="M1.5 10l3.5-3 2.5 2.5 2-1.5 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ animation: "spin 0.75s linear infinite" }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 010 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ── Format options ─────────────────────────────────────────────────────────

const FORMAT_OPTIONS: Array<{ format: ExportFormat; label: string; icon: React.ReactNode; description: string }> = [
  { format: "text", label: "Plain Text", icon: <IconText />, description: ".txt" },
  { format: "markdown", label: "Markdown", icon: <IconMarkdown />, description: ".md" },
  { format: "json", label: "JSON", icon: <IconJson />, description: ".json" },
  { format: "image", label: "Image", icon: <IconImage />, description: ".png" },
];

// ── Props ──────────────────────────────────────────────────────────────────

type ExportMenuProps =
  | { mode: "single"; idea: SaasIdea; subreddit: string; label?: string }
  | { mode: "bulk"; ideas: SaasIdea[]; subreddit: string; label?: string };

// ── Component ──────────────────────────────────────────────────────────────

export function ExportMenu(props: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const label = props.label ?? (props.mode === "bulk" ? "Export All" : "Export");

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open]);

  async function handleExport(format: ExportFormat) {
    setOpen(false);
    setBusy(format);
    try {
      if (props.mode === "single") {
        await exportIdea(props.idea, props.subreddit, format);
      } else {
        await exportAllIdeas(props.ideas, props.subreddit, format);
      }
    } finally {
      setBusy(null);
    }
  }

  const isBusy = busy !== null;

  return (
    <>
      {/* Keyframe for spinner — injected once */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div ref={menuRef} style={{ position: "relative", display: "inline-block" }}>
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={isBusy}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 disabled:cursor-wait disabled:opacity-60"
        >
          {isBusy ? (
            <>
              <IconSpinner />
              <span>Generating…</span>
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M6.5 1v8M3.5 6l3 3 3-3M1.5 10.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{label}</span>
              <IconChevron open={open} />
            </>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div
            role="listbox"
            aria-label="Export format"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              zIndex: 50,
              minWidth: 178,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(15,23,42,0.10), 0 1px 4px rgba(15,23,42,0.06)",
              padding: "6px",
              animation: "fadeIn 0.12s ease",
            }}
          >
            <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:translateY(0); } }`}</style>
            {FORMAT_OPTIONS.map(({ format, label: optLabel, icon, description }) => (
              <button
                key={format}
                type="button"
                role="option"
                onClick={() => handleExport(format)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
                  {icon}
                </span>
                <span className="flex-1 font-medium">{optLabel}</span>
                <span className="font-mono text-[0.68rem] text-slate-400">{description}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
