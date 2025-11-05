import React, { useEffect, useMemo, useRef, useState } from "react";
import "../Forms.css";

/* ============================================================
   JsonEditor — matches the HTML viewer: Tabs (Table/Code), Add,
   Save, Import, Export. Table cells are contenteditable + row delete.
   ============================================================ */
function JsonEditor({ data = [], title = "Live Data", downloadName = "articles.json", onSave }) {
  const [view, setView] = useState("table"); // table | code
  const [code, setCode] = useState(JSON.stringify(data, null, 2));
  const fileRef = useRef(null);

  useEffect(() => {
    setCode(JSON.stringify(data, null, 2));
  }, [data]);

  const headers = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    const merged = data.reduce((acc, row) => ({ ...acc, ...row }), {});
    return Object.keys(merged);
  }, [data]);

  const genId = () => "_" + Math.random().toString(36).slice(2, 11);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName || "data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(String(ev.target?.result || "[]"));
        if (!Array.isArray(parsed)) throw new Error("Data must be an array");
        if (window.confirm(`This will replace all data in '${downloadName}'. Continue?`)) {
          onSave && onSave(parsed);
        }
      } catch (err) {
        alert(`Import Error: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const addRow = () => {
    const baseHeaders = headers.length ? headers : ["id", "title", "writerId", "bookId"];
    const blank = baseHeaders.reduce((o, k) => ({ ...o, [k]: "" }), {});
    blank.id = genId();
    onSave && onSave([...(Array.isArray(data) ? data : []), blank]);
  };

  const save = () => {
    if (view === "code") {
      try {
        const parsed = JSON.parse(code);
        if (!Array.isArray(parsed)) throw new Error("Data must be an array");
        onSave && onSave(parsed);
        alert("Success! Data has been saved to the local cache.");
      } catch (e) {
        alert(`Invalid JSON: ${e.message}`);
      }
      return;
    }

    // from table
    const tbody = document.querySelector(".json-table tbody");
    if (!tbody) return;
    const original = Array.isArray(data) ? data : [];
    const next = [];
    tbody.querySelectorAll("tr").forEach((tr, idx) => {
      const idAttr = tr.getAttribute("data-id");
      const originalRow = (idAttr && original.find((r) => String(r.id) === String(idAttr))) || original[idx] || {};
      const obj = { ...originalRow };
      tr.querySelectorAll("td[contenteditable]").forEach((td) => {
        const key = td.getAttribute("data-key");
        const txt = td.textContent ?? "";
        try {
          obj[key] = JSON.parse(txt);
        } catch {
          obj[key] = txt;
        }
      });
      next.push(obj);
    });
    onSave && onSave(next);
    alert("Success! Data has been saved to the local cache.");
  };

  const deleteRow = (rowIndex) => {
    const copy = [...data];
    copy.splice(rowIndex, 1);
    onSave && onSave(copy);
  };

  return (
    <div className="json-viewer-container">
      <div className="p-3 border-b border-slate-200">
        <h3 className="text-md font-bold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500">Manage raw data for this section.</p>
      </div>

      <div className="p-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50">
        <div className="json-viewer-tabs flex">
          <button
            data-view="table"
            className={`tab-btn ${view === "table" ? "active" : ""}`}
            onClick={() => setView("table")}
          >
            <i className="bi bi-table mr-2" />
            Table
          </button>
          <button
            data-view="code"
            className={`tab-btn ${view === "code" ? "active" : ""}`}
            onClick={() => setView("code")}
          >
            <i className="bi bi-code-slash mr-2" />
            Code
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="add-row-btn text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            onClick={addRow}
          >
            <i className="bi bi-plus-lg" /> Add
          </button>
          <button
            className="save-all-btn text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
            onClick={save}
          >
            <i className="bi bi-check-all" /> Save
          </button>
          <button
            className="import-btn text-xs font-bold px-2 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
            onClick={() => fileRef.current?.click()}
          >
            <i className="bi bi-upload" /> Import
          </button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: "none" }} onChange={importJson} />
          <button
            className="export-btn text-xs font-bold px-2 py-1 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200"
            onClick={exportJson}
          >
            <i className="bi bi-download" /> Export
          </button>
        </div>
      </div>

      <div className="json-viewer-content">
        {view === "table" ? (
          <div className="view-panel table-view-panel active">
            {!data || data.length === 0 ? (
              <p className="text-center text-slate-500 py-4 text-sm">No data to display.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="json-table">
                  <thead>
                    <tr>
                      {headers.map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, rowIndex) => (
                      <tr key={row.id || rowIndex} data-id={row.id ? String(row.id) : undefined}>
                        {headers.map((h) => (
                          <td key={h} contentEditable data-key={h}>
                            {row[h] === undefined || row[h] === null
                              ? ""
                              : typeof row[h] === "object"
                              ? JSON.stringify(row[h])
                              : String(row[h])}
                          </td>
                        ))}
                        <td>
                          <button
                            className="delete-row-btn p-1 text-red-500 hover:text-red-700"
                            onClick={() => deleteRow(rowIndex)}
                          >
                            <i className="bi bi-trash" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="view-panel code-view-panel active">
            <textarea className="json-code-view" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   SearchableDropdown — visually matches your vanilla component.
   ============================================================ */
function SearchableDropdown({ id, options = [], value, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));
  const shown = options.filter((o) => o.text.toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div id={`s-dropdown-${id}`} className="searchable-dropdown" ref={ref}>
      <input type="hidden" id={id} value={selected?.value ?? ""} readOnly />
      <div className="form-input searchable-dropdown-input flex justify-between items-center" onClick={() => setOpen((v) => !v)}>
        <span className="truncate">{selected ? selected.text : "Select an option..."}</span>
        <i className="bi bi-chevron-down" />
      </div>
      <div className={`searchable-dropdown-list ${open ? "open" : ""}`}>
        <input
          type="text"
          className="search-input w-full"
          placeholder="Search..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="searchable-options-list">
          {shown.map((opt) => (
            <div
              key={opt.value}
              className="searchable-dropdown-item"
              data-value={opt.value}
              onClick={() => {
                onChange && onChange(opt.value);
                setOpen(false);
                setQ("");
              }}
            >
              {opt.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ViewArticles — EXACT clone of the HTML list for Articles
   Tabs: Management / Live Data
   Columns: Title | Writer | Book (title + type)
   Actions: Edit / Delete
   ============================================================ */
export function ViewArticles({
  items = [],
  poets = [],
  books = [],
  onAdd,
  onEdit,
  onDelete,
  onSaveAll,
}) {
  const [tab, setTab] = useState("management");
  const [q, setQ] = useState("");

  const poetMap = useMemo(() => Object.fromEntries((poets || []).map((p) => [p.id, p.name])), [poets]);
  const bookMap = useMemo(() => Object.fromEntries((books || []).map((b) => [b.id, b])), [books]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return (items || []).filter((item) => {
      const t = String(item.title || "").toLowerCase();
      const w = String(poetMap[item.writerId] || "").toLowerCase();
      const b = String(bookMap[item.bookId]?.title || "").toLowerCase();
      const bt = String(bookMap[item.bookId]?.bookType || "").toLowerCase();
      return t.includes(query) || w.includes(query) || b.includes(query) || bt.includes(query);
    });
  }, [items, q, poetMap, bookMap]);

  return (
    <div id="articles-view" className="view active">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Articles Management</h1>
          <p className="text-slate-500 mt-1">Create, view, and manage all articles.</p>
        </div>
        <button
          id="mas-add-new-btn"
          className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 font-bold text-white text-sm bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-indigo-600/40 transition-all duration-300"
          onClick={() => onAdd && onAdd()}
        >
          <i className="bi bi-plus-circle-fill" /> Add New Article
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="tab-nav -mb-px flex space-x-4" aria-label="Tabs">
          <button
            data-tab="management"
            className={`aws-tab-btn ${tab === "management" ? "active" : ""}`}
            onClick={() => setTab("management")}
          >
            Management
          </button>
          <button
            data-tab="live-data"
            className={`aws-tab-btn ${tab === "live-data" ? "active" : ""}`}
            onClick={() => setTab("live-data")}
          >
            Live Data
          </button>
        </nav>
      </div>

      {tab === "management" ? (
        <div id="mas-management-panel" className="tab-panel active mt-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="bi bi-search text-slate-400" />
              </div>
              <input
                id="mas-search-input"
                type="text"
                className="form-input pl-10"
                placeholder="Search Articles..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto responsive-table-container">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Writer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Book
                    </th>
                    <th className="relative px-4 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody id="mas-table-body" className="divide-y divide-slate-200">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-500">
                        No articles found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => {
                      const writerName = poetMap[item.writerId] || "N/A";
                      const b = bookMap[item.bookId];
                      return (
                        <tr
                          key={item.id}
                          data-id={item.id}
                          className="hover:bg-slate-50 transition-colors duration-200"
                        >
                          <td data-label="Title" className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                            <span className="font-bold">{item.title}</span>
                          </td>
                          <td data-label="Writer" className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                            {writerName}
                          </td>
                          <td data-label="Book" className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                            {b ? (
                              <>
                                {b.title}{" "}
                                <span className="text-xs text-slate-500">({b.bookType || "Book"})</span>
                              </>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="actions-cell px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="aws-edit-btn text-indigo-600 hover:text-indigo-900 font-semibold"
                              onClick={() => onEdit && onEdit(item.id)}
                            >
                              Edit
                            </button>
                            <button
                              className="aws-delete-btn text-red-600 hover:text-red-900 ml-4 font-semibold"
                              onClick={() => onDelete && onDelete(item.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div id="mas-live-data-panel" className="tab-panel mt-6">
          <JsonEditor
            data={items}
            title="Live Data: cache.articles"
            downloadName="articles.json"
            onSave={onSaveAll}
          />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ArticleForm — EXACT clone of the HTML "Add/Edit Article" form:
   Fields:
     - Title (text, required)
     - Slug (readonly, auto from title)
     - Thumbnail (image upload with preview)
     - Writer (searchable dropdown from poets)
     - Book (searchable dropdown from books)
     - Content group: Urdu/Roman/English/Arabic/Hindi (textarea rows=6)
     - Group (searchable dropdown)  [optional list]
     - Section (searchable dropdown)[optional list]
     - SEO block (title, description, AEO JSON-LD) with Auto-Generate
   Buttons: Save, Cancel. Back link on top.
   ============================================================ */
export function ArticleForm({
  item = null,
  poets = [],
  books = [],
  groups = [],
  sectionPages = [],
  onCancel,
  onSubmit,
}) {
  const [title, setTitle] = useState(item?.title || "");
  const [slug, setSlug] = useState(item?.slug || "");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);

  const [writerId, setWriterId] = useState(item?.writerId || "");
  const [bookId, setBookId] = useState(item?.bookId || "");
  const [groupId, setGroupId] = useState(item?.groupId || "");
  const [sectionId, setSectionId] = useState(item?.sectionId || "");

  const [contentUrdu, setContentUrdu] = useState(item?.contentUrdu || "");
  const [contentRoman, setContentRoman] = useState(item?.contentRoman || "");
  const [contentEnglish, setContentEnglish] = useState(item?.contentEnglish || "");
  const [contentArabic, setContentArabic] = useState(item?.contentArabic || "");
  const [contentHindi, setContentHindi] = useState(item?.contentHindi || "");

  const [seoTitle, setSeoTitle] = useState(item?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(item?.seoDescription || "");
  const [aeoSchema, setAeoSchema] = useState(
    item?.aeoSchema ? JSON.stringify(item.aeoSchema, null, 2) : ""
  );

  useEffect(() => {
    // auto slug
    const s = String(title || "")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(s);
  }, [title]);

  const poetOptions = (poets || []).map((p) => ({ value: p.id, text: p.name }));
  const bookOptions = (books || []).map((b) => ({
    value: b.id,
    text: b.title + (b.bookType ? ` (${b.bookType})` : ""),
  }));
  const groupOptions = (groups || []).map((g) => ({ value: g.id, text: g.name }));
  const sectionOptions = (sectionPages || []).map((s) => ({ value: s.id, text: s.name }));

  const onThumbChange = (file) => {
    if (!file) {
      setThumbnailFile(null);
      setThumbPreview(null);
      return;
    }
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setThumbPreview(String(e.target?.result || ""));
    reader.readAsDataURL(file);
  };

  const genSEO = () => {
    const t = title || "";
    const descr =
      contentEnglish?.replace(/<[^>]+>/g, "").slice(0, 160) ||
      contentRoman?.slice(0, 160) ||
      contentUrdu?.slice(0, 160) ||
      "";
    const st = `${t} | Naat Academy`.slice(0, 60);
    const sd = descr;
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      name: t,
      description: sd,
    };
    setSeoTitle(st);
    setSeoDescription(sd);
    setAeoSchema(JSON.stringify(schema, null, 2));
  };

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      id: item?.id || undefined,
      title,
      slug,
      thumbnail: thumbnailFile ? thumbnailFile.name : item?.thumbnail || "",
      writerId,
      bookId,
      groupId,
      sectionId,
      contentUrdu,
      contentRoman,
      contentEnglish,
      contentArabic,
      contentHindi,
      seoTitle,
      seoDescription,
    };
    try {
      payload.aeoSchema = aeoSchema ? JSON.parse(aeoSchema) : {};
    } catch {
      payload.aeoSchema = {};
    }
    onSubmit && onSubmit(payload);
  };

  return (
    <div id="articles-view" className="view active">
      <div className="mb-6">
        <button
          id="mas-back-btn"
          className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
          onClick={() => onCancel && onCancel()}
        >
          <i className="bi bi-arrow-left-circle-fill" /> Back to Articles
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
        <h2 id="mas-form-header" className="text-lg font-bold text-slate-800 mb-4">
          {item?.id ? "Edit Article" : "Add New Article"}
        </h2>

        <form id="mas-section-form" className="form-grid" onSubmit={submit}>
          {/* Title */}
          <div id="field-wrapper-title" className="field-wrapper">
            <label htmlFor="form-title" className="font-semibold text-slate-700 text-sm">
              Title
            </label>
            <div className="mt-1">
              <input
                id="form-title"
                type="text"
                className="form-input"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <p className="logic-note">The main title of the article.</p>
          </div>

          {/* Slug */}
          <div id="field-wrapper-slug" className="field-wrapper">
            <label htmlFor="form-slug" className="font-semibold text-slate-700 text-sm">
              Slug
            </label>
            <div className="mt-1">
              <input id="form-slug" type="text" className="form-input" readOnly value={slug} />
            </div>
            <p className="logic-note">Auto-generated for the URL.</p>
          </div>

          {/* Thumbnail */}
          <div id="field-wrapper-thumbnail" className="field-wrapper">
            <label className="font-semibold text-slate-700 text-sm">Thumbnail</label>
            <div className="mt-1">
              <div className="flex items-center gap-4">
                {thumbPreview ? (
                  <div
                    id="thumbnail-preview-thumbnail"
                    className="w-20 h-20 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 relative"
                  >
                    {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                    <img alt="thumbnail preview" src={thumbPreview} className="w-full h-full object-cover rounded-md" />
                    <button
                      type="button"
                      className="delete-thumbnail-btn absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-red-500 hover:text-red-700"
                      onClick={() => onThumbChange(null)}
                    >
                      <i className="bi bi-x-circle-fill" />
                    </button>
                  </div>
                ) : null}

                {!thumbPreview && (
                  <label
                    htmlFor="form-thumbnail"
                    id="thumbnail-upload-label-thumbnail"
                    className="flex flex-col items-center justify-center w-full h-20 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <i className="bi bi-cloud-arrow-up-fill text-3xl text-slate-400" />
                      <p className="text-xs text-slate-500">
                        <span className="font-semibold">Click to upload</span>
                      </p>
                    </div>
                    <input
                      id="form-thumbnail"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => onThumbChange(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
            </div>
            <p className="logic-note">Upload a thumbnail image.</p>
          </div>

          {/* Writer */}
          <div id="field-wrapper-writerId" className="field-wrapper">
            <label className="font-semibold text-slate-700 text-sm">Writer</label>
            <div className="mt-1">
              <SearchableDropdown
                id="form-writerId"
                options={poetOptions}
                value={writerId}
                onChange={(v) => setWriterId(v)}
              />
            </div>
            <p className="logic-note">Assign an author.</p>
          </div>

          {/* Book */}
          <div id="field-wrapper-bookId" className="field-wrapper">
            <label className="font-semibold text-slate-700 text-sm">Book</label>
            <div className="mt-1">
              <SearchableDropdown
                id="form-bookId"
                options={bookOptions}
                value={bookId}
                onChange={(v) => setBookId(v)}
              />
            </div>
            <p className="logic-note">Assign to a book.</p>
          </div>

          {/* CONTENT GROUP */}
          <div id="field-wrapper-content-group" className="col-span-full field-wrapper">
            <fieldset className="border p-4 rounded-md">
              <legend className="px-2 font-bold text-slate-800">Content</legend>
              <div className="space-y-4">
                <div>
                  <label htmlFor="form-contentUrdu" className="font-semibold text-slate-700 text-sm">
                    Urdu
                  </label>
                  <textarea
                    id="form-contentUrdu"
                    className="form-input mt-1"
                    rows={6}
                    value={contentUrdu}
                    onChange={(e) => setContentUrdu(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="form-contentRoman" className="font-semibold text-slate-700 text-sm">
                    Roman
                  </label>
                  <textarea
                    id="form-contentRoman"
                    className="form-input mt-1"
                    rows={6}
                    value={contentRoman}
                    onChange={(e) => setContentRoman(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="form-contentEnglish" className="font-semibold text-slate-700 text-sm">
                    English
                  </label>
                  <textarea
                    id="form-contentEnglish"
                    className="form-input mt-1"
                    rows={6}
                    value={contentEnglish}
                    onChange={(e) => setContentEnglish(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="form-contentArabic" className="font-semibold text-slate-700 text-sm">
                    Arabic
                  </label>
                  <textarea
                    id="form-contentArabic"
                    className="form-input mt-1"
                    rows={6}
                    value={contentArabic}
                    onChange={(e) => setContentArabic(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="form-contentHindi" className="font-semibold text-slate-700 text-sm">
                    Hindi
                  </label>
                  <textarea
                    id="form-contentHindi"
                    className="form-input mt-1"
                    rows={6}
                    value={contentHindi}
                    onChange={(e) => setContentHindi(e.target.value)}
                  />
                </div>
              </div>
            </fieldset>
          </div>

          {/* Group */}
          <div id="field-wrapper-groupId" className="field-wrapper">
            <label className="font-semibold text-slate-700 text-sm">Assign to Group</label>
            <div className="mt-1">
              <SearchableDropdown
                id="form-groupId"
                options={groupOptions}
                value={groupId}
                onChange={(v) => setGroupId(v)}
              />
            </div>
            <p className="logic-note">Assign this to a group.</p>
          </div>

          {/* Section */}
          <div id="field-wrapper-sectionId" className="field-wrapper">
            <label className="font-semibold text-slate-700 text-sm">Assign to Section</label>
            <div className="mt-1">
              <SearchableDropdown
                id="form-sectionId"
                options={sectionOptions}
                value={sectionId}
                onChange={(v) => setSectionId(v)}
              />
            </div>
            <p className="logic-note">Assign this to a section page.</p>
          </div>

          {/* SEO & AEO */}
          <div className="col-span-full border-t pt-5 mt-5">
            <h3 className="text-md font-bold text-slate-800 mb-2">SEO & AEO Optimization</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="form-seoTitle" className="font-semibold text-slate-700 text-sm">
                  SEO Title
                </label>
                <input
                  id="form-seoTitle"
                  type="text"
                  className="form-input mt-1"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="form-seoDescription" className="font-semibold text-slate-700 text-sm">
                  SEO Description
                </label>
                <textarea
                  id="form-seoDescription"
                  className="form-input mt-1"
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="form-aeoSchema" className="font-semibold text-slate-700 text-sm">
                  AEO (JSON-LD Schema)
                </label>
                <textarea
                  id="form-aeoSchema"
                  className="form-input mt-1 font-mono text-xs"
                  rows={4}
                  value={aeoSchema}
                  onChange={(e) => setAeoSchema(e.target.value)}
                />
              </div>
              <button
                type="button"
                id="generate-seo-btn"
                className="text-xs font-bold px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition"
                onClick={genSEO}
              >
                Auto-Generate
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-slate-200 mt-5">
            <button id="form-submit-btn" className="w-full sm:w-auto px-5 py-2 font-bold text-white text-sm bg-indigo-600 rounded-md hover:bg-indigo-700 transition">
              Save Article
            </button>
            <button
              type="button"
              id="mas-cancel-form-btn"
              className="w-full sm:w-auto px-5 py-2 font-bold text-slate-700 text-sm bg-slate-100 rounded-md hover:bg-slate-200 transition"
              onClick={() => onCancel && onCancel()}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   Wrapper (optional): combine list+form with local state.
   Use this if you want a drop-in page that switches views.
   ============================================================ */
export default function ArticlesPage({
  initialItems = [],
  poets = [],
  books = [],
  groups = [],
  sectionPages = [],
  onPersistAll, // (newArray) => void  -- for Live Data Save
}) {
  const [items, setItems] = useState(initialItems);
  const [mode, setMode] = useState("list"); // list | form
  const [editingId, setEditingId] = useState(null);

  const startAdd = () => {
    setEditingId(null);
    setMode("form");
  };
  const startEdit = (id) => {
    setEditingId(id);
    setMode("form");
  };
  const remove = (id) => {
    if (!window.confirm("Delete Article? This action cannot be undone.")) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
  };
  const saveAll = (arr) => {
    setItems(arr);
    onPersistAll && onPersistAll(arr);
  };

  const nowIso = () => new Date().toISOString();

  const submit = (payload) => {
    if (editingId) {
      setItems((prev) =>
        prev.map((x) => (String(x.id) === String(editingId) ? { ...x, ...payload, id: editingId, modifiedAt: nowIso() } : x))
      );
    } else {
      setItems((prev) => [
        ...prev,
        { ...payload, id: "_" + Math.random().toString(36).slice(2, 10), createdAt: nowIso() },
      ]);
    }
    setMode("list");
    setEditingId(null);
  };

  if (mode === "form") {
    const current = editingId ? items.find((x) => String(x.id) === String(editingId)) : null;
    return (
      <ArticleForm
        item={current || null}
        poets={poets}
        books={books}
        groups={groups}
        sectionPages={sectionPages}
        onCancel={() => {
          setMode("list");
          setEditingId(null);
        }}
        onSubmit={submit}
      />
    );
  }


}
