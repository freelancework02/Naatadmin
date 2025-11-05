import React, { useState } from "react";

const sidebarLinks = [
  { title: "Dashboard", view: "dashboard", icon: "grid-1x2-fill", color: "text-sky-400" },
  { type: "header", title: "Content" },
  { title: "Poetry", view: "kalaam", icon: "journal-richtext", color: "text-emerald-400" },
  { title: "Articles", view: "articles", icon: "file-text-fill", color: "text-cyan-400" },
  { title: "Books", view: "books", icon: "book-fill", color: "text-violet-400" },
  { title: "Writers", view: "poets", icon: "people-fill", color: "text-rose-400" },
  { title: "Tunes", view: "tunes", icon: "music-note-beamed", color: "text-orange-400" },
  { type: "header", title: "Organization" },
  { title: "Book Folders", view: "bookFolders", icon: "folder2-open", color: "text-yellow-400" },
  { title: "Section Pages", view: "sectionPages", icon: "file-earmark-break", color: "text-indigo-400" },
  { title: "Groups", view: "groups", icon: "collection-fill", color: "text-amber-400" },
  { title: "Categories", view: "categories", icon: "folder-fill", color: "text-pink-400" },
  { title: "Topics", view: "topics", icon: "hash", color: "text-lime-400" },
  { title: "Languages", view: "languages", icon: "translate", color: "text-teal-400" },
  { type: "header", title: "System" },
  { title: "Users", view: "users", icon: "person-gear", color: "text-slate-400" },
];

export default function Sidebar({ currentView, onNavigate, isOpen, onClose }) {
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const handleLinkClick = (view, hasChildren = false) => {
    if (hasChildren) {
      setOpenSubmenu(openSubmenu === view ? null : view);
    } else {
      onNavigate(view);
      if (window.innerWidth < 1024) onClose();
    }
  };

  return (
    <aside
      className={[
        "fixed lg:static w-64 h-full bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-50",
        "transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      ].join(" ")}
    >
      <div className="p-4 border-b border-slate-700/50 flex items-center gap-3">
        <i className="bi bi-moon-stars-fill text-indigo-400" />
        <span className="text-white font-semibold">Naat Academy</span>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link, index) => {
          if (link.type === "header") {
            return (
              <p
                key={`h-${index}`}
                className="px-3 pt-3 pb-1 text-xs text-slate-500 uppercase tracking-wider"
              >
                {link.title}
              </p>
            );
          }

          if (link.children) {
            const open = openSubmenu === link.view;
            return (
              <div key={`p-${index}`}>
                <button
                  onClick={() => handleLinkClick(link.view, true)}
                  className={[
                    "w-full sidebar-link flex items-center justify-between gap-3 px-3 py-2.5 rounded-md",
                    "hover:bg-slate-800 hover:text-white transition-all text-sm",
                    currentView === link.view ? "bg-indigo-600 text-white" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <i className={`bi bi-${link.icon} ${link.color}`} />
                    <span>{link.title}</span>
                  </div>
                  <i
                    className={[
                      "bi bi-chevron-right transition-transform duration-300",
                      open ? "rotate-90" : "",
                    ].join(" ")}
                  />
                </button>

                <div
                  className={[
                    "overflow-hidden transition-all duration-300",
                    open ? "max-h-96" : "max-h-0",
                  ].join(" ")}
                >
                  <div className="pl-6">
                    {link.children.map((child, ci) => (
                      <button
                        key={`c-${index}-${ci}`}
                        onClick={() => handleLinkClick(child.view)}
                        className={[
                          "w-full sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-md",
                          "hover:bg-slate-800 hover:text-white transition-all text-sm",
                          currentView === child.view ? "bg-indigo-600 text-white" : "",
                        ].join(" ")}
                      >
                        <i className={`bi bi-${child.icon} text-xs`} />
                        <span>{child.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          }
  
          return (
            <button
              key={`l-${index}`}
              onClick={() => handleLinkClick(link.view)}
              className={[
                "w-full sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-md",
                "hover:bg-slate-800 hover:text-white transition-all text-sm",
                currentView === link.view ? "bg-indigo-600 text-white" : "",
              ].join(" ")}
            >
              <i
                className={`bi bi-${link.icon} ${
                  currentView === link.view ? "text-white" : link.color
                }`}
              />
              <span>{link.title}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
