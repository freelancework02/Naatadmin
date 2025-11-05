import React from "react";

export default function Topbar({ onMenuClick, title }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="flex items-center gap-3 p-3">
        <button
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-slate-700 text-white cursor-pointer hover:bg-slate-800"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <i className="bi bi-list text-xl" />
        </button>
        <h1 className="text-lg font-semibold capitalize text-slate-100">
          {title}
        </h1>
      </div>
    </header>
  );
}
