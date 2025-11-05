import React, { useEffect, useMemo, useRef, useState } from "react";
import '../Forms.css'
/** ------------------------------------------------------------------
 * Minimal SearchableDropdown (pure client-side)
 * Matches your admin’s structure & classes exactly.
 * props: id, options [{value,text}], value, onChange(value), placeholder
 * ------------------------------------------------------------------ */
function SearchableDropdown({ id, options = [], value, onChange, placeholder = "Select an option..." }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const boxRef = useRef(null);

  const selected = useMemo(
    () => options.find((o) => String(o.value) === String(value)),
    [options, value]
  );
  const filtered = useMemo(
    () => options.filter((o) => o.text.toLowerCase().includes(q.trim().toLowerCase())),
    [options, q]
  );

  useEffect(() => {
    const onDoc = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div ref={boxRef} className="searchable-dropdown">
      <input type="hidden" id={id} value={value ?? ""} readOnly />
      <div
        className="form-input searchable-dropdown-input flex justify-between items-center"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate">{selected ? selected.text : placeholder}</span>
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
          {filtered.map((opt) => (
            <div
              key={opt.value}
              className="searchable-dropdown-item"
              data-value={opt.value}
              onClick={() => {
                onChange && onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.text}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-xs text-slate-500">No matches</div>
          )}
        </div>
      </div>
    </div>
  );
}

/** ---------------------------------------------------------------
 * AddPoetry — exact clone of your HTML form
 * props:
 *  poets, books, groups, sectionPages
 *  initial (optional), onSubmit(payload), onCancel()
 * --------------------------------------------------------------- */
export function AddPoetry({
  poets = [],
  books = [],
  groups = [],
  sectionPages = [],
  initial = null,
  onSubmit,
  onCancel,
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const [poetId, setPoetId] = useState(initial?.poetId || "");
  const [bookId, setBookId] = useState(initial?.bookId || "");
  const [lineLayout, setLineLayout] = useState(initial?.lyricsLineLayout || 2);

  const [lyricsUrdu, setLyricsUrdu] = useState(initial?.lyricsUrdu || "");
  const [lyricsRoman, setLyricsRoman] = useState(initial?.lyricsRoman || "");
  const [lyricsEnglish, setLyricsEnglish] = useState(initial?.lyricsEnglish || "");
  const [lyricsArabic, setLyricsArabic] = useState(initial?.lyricsArabic || "");
  const [lyricsHindi, setLyricsHindi] = useState(initial?.lyricsHindi || "");
  const [kalamTextDictionary, setKalamTextDictionary] = useState(initial?.kalamTextDictionary || "");

  const [groupId, setGroupId] = useState(initial?.groupId || "");
  const [sectionId, setSectionId] = useState(initial?.sectionId || "");

  // SEO
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription || "");
  const [aeoSchema, setAeoSchema] = useState(
    initial?.aeoSchema ? JSON.stringify(initial.aeoSchema, null, 2) : ""
  );

  // Dropdown options
  const poetOptions = useMemo(() => poets.map((p) => ({ value: p.id, text: p.name })), [poets]);
  const bookOptions = useMemo(
    () => books.map((b) => ({ value: b.id, text: b.bookType ? `${b.title} (${b.bookType})` : b.title })),
    [books]
  );
  const groupOptions = useMemo(() => groups.map((g) => ({ value: g.id, text: g.name })), [groups]);
  const sectionOptions = useMemo(
    () => sectionPages.map((s) => ({ value: s.id, text: s.name })),
    [sectionPages]
  );

  useEffect(() => {
    // slug auto (same transform as admin)
    setSlug(
      (title || "")
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
    );
  }, [title]);

  const onThumbChange = (file) => {
    setThumbnail(file || null);
    if (!file) {
      setThumbnailUrl("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setThumbnailUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const generateDictionary = () => {
    const bag = [lyricsUrdu, lyricsRoman, lyricsEnglish, lyricsArabic, lyricsHindi].join(" ");
    const words = bag.split(/[\s\n,.،!?"'():;]+/).filter(Boolean);
    const uniq = [...new Set(words.map((w) => w.toLowerCase()))].sort();
    setKalamTextDictionary(uniq.join(", "));
  };

  const handleGenerateSEO = () => {
    const _seoTitle = `${title} | Naat Academy`.slice(0, 60);
    const _seoDesc = (lyricsEnglish || lyricsRoman || lyricsUrdu || "").slice(0, 160);
    const schema = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: title,
      description: _seoDesc,
    };
    setSeoTitle(_seoTitle);
    setSeoDescription(_seoDesc);
    setAeoSchema(JSON.stringify(schema, null, 2));
  };

  const handleSave = () => {
    let parsedSchema = {};
    try {
      parsedSchema = aeoSchema ? JSON.parse(aeoSchema) : {};
    } catch {
      parsedSchema = {};
    }
    const payload = {
      id: initial?.id || undefined,
      createdAt: initial?.createdAt || new Date().toISOString(),
      title,
      slug,
      poetId,
      bookId,
      lyricsLineLayout: Number(lineLayout),
      lyricsUrdu,
      lyricsRoman,
      lyricsEnglish,
      lyricsArabic,
      lyricsHindi,
      kalamTextDictionary,
      groupId,
      sectionId,
      seoTitle,
      seoDescription,
      aeoSchema: parsedSchema,
      // UI-only: keep name; backend can accept file if you wire it
      thumbnailName: thumbnail?.name || initial?.thumbnailName || "",
    };
    onSubmit && onSubmit(payload);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
      <h2 className="text-lg font-bold text-slate-800 mb-4">
        {initial ? "Edit Poetry" : "Add New Poetry"}
      </h2>

      <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <p className="logic-note">The first line or title of the poetry.</p>
        </div>

        {/* Slug */}
        <div id="field-wrapper-slug" className="field-wrapper">
          <label htmlFor="form-slug" className="font-semibold text-slate-700 text-sm">
            Slug
          </label>
          <div className="mt-1">
            <input id="form-slug" type="text" className="form-input" value={slug} readOnly />
          </div>
          <p className="logic-note">Auto-generated for the URL.</p>
        </div>

        {/* Thumbnail */}
        <div id="field-wrapper-thumbnail" className="field-wrapper">
          <label className="font-semibold text-slate-700 text-sm">Thumbnail</label>
          <div className="mt-1 flex items-center gap-4">
            <div
              id="thumbnail-preview-thumbnail"
              className={`w-20 h-20 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 relative ${
                thumbnailUrl ? "" : "hidden"
              }`}
            >
              {thumbnailUrl && (
                <img src={thumbnailUrl} alt="thumb" className="w-full h-full object-cover rounded-md" />
              )}
              <button
                type="button"
                className="delete-thumbnail-btn absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-red-500 hover:text-red-700"
                onClick={() => onThumbChange(null)}
              >
                <i className="bi bi-x-circle-fill" />
              </button>
            </div>

            <label
              htmlFor="form-thumbnail"
              id="thumbnail-upload-label-thumbnail"
              className={`flex flex-col items-center justify-center w-full h-20 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 ${
                thumbnailUrl ? "hidden" : ""
              }`}
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
          </div>
          <p className="logic-note">Upload a thumbnail image.</p>
        </div>

        {/* Poet */}
        <div id="field-wrapper-poetId" className="field-wrapper">
          <label className="font-semibold text-slate-700 text-sm">Poet</label>
          <div className="mt-1">
            <SearchableDropdown
              id="form-poetId"
              options={poetOptions}
              value={poetId}
              onChange={setPoetId}
              placeholder="Choose poet..."
            />
          </div>
          <p className="logic-note">Link to an existing writer.</p>
        </div>

        {/* Book */}
        <div id="field-wrapper-bookId" className="field-wrapper">
          <label className="font-semibold text-slate-700 text-sm">Book</label>
          <div className="mt-1">
            <SearchableDropdown
              id="form-bookId"
              options={bookOptions}
              value={bookId}
              onChange={setBookId}
              placeholder="Assign to a book..."
            />
          </div>
          <p className="logic-note">Assign to a book.</p>
        </div>

        {/* Line Layout */}
        <div id="field-wrapper-lyricsLineLayout" className="field-wrapper">
          <label className="font-semibold text-slate-700 text-sm">Lyrics Line Layout</label>
          <div id="form-lyricsLineLayout" className="line-layout-selector mt-1">
            {[2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className={`line-layout-option ${String(lineLayout) === String(n) ? "selected" : ""}`}
                data-value={n}
                onClick={() => setLineLayout(n)}
              >
                <i className="bi bi-text-left" /> {n} Lines
              </div>
            ))}
          </div>
          <p className="logic-note">Select number of lines before a break.</p>
        </div>

        {/* Lyrics Group */}
        <div id="field-wrapper-lyrics" className="col-span-full field-wrapper">
          <fieldset className="border p-4 rounded-md">
            <legend className="px-2 font-bold text-slate-800">Lyrics</legend>

            <div className="space-y-4">
              <div>
                <label className="font-semibold text-slate-700 text-sm">Urdu</label>
                <textarea
                  id="form-lyricsUrdu"
                  className="form-input mt-1"
                  rows={3}
                  value={lyricsUrdu}
                  onChange={(e) => setLyricsUrdu(e.target.value)}
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 text-sm">Roman</label>
                <textarea
                  id="form-lyricsRoman"
                  className="form-input mt-1"
                  rows={3}
                  value={lyricsRoman}
                  onChange={(e) => setLyricsRoman(e.target.value)}
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 text-sm">English</label>
                <textarea
                  id="form-lyricsEnglish"
                  className="form-input mt-1"
                  rows={3}
                  value={lyricsEnglish}
                  onChange={(e) => setLyricsEnglish(e.target.value)}
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 text-sm">Arabic</label>
                <textarea
                  id="form-lyricsArabic"
                  className="form-input mt-1"
                  rows={3}
                  value={lyricsArabic}
                  onChange={(e) => setLyricsArabic(e.target.value)}
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 text-sm">Hindi</label>
                <textarea
                  id="form-lyricsHindi"
                  className="form-input mt-1"
                  rows={3}
                  value={lyricsHindi}
                  onChange={(e) => setLyricsHindi(e.target.value)}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 text-sm">Kalam Text Dictionary</label>
                <textarea
                  id="form-kalamTextDictionary"
                  className="form-input mt-1"
                  rows={4}
                  value={kalamTextDictionary}
                  onChange={(e) => setKalamTextDictionary(e.target.value)}
                />
                <button
                  type="button"
                  id="generate-dictionary-btn"
                  className="mt-2 text-xs font-bold px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition"
                  onClick={generateDictionary}
                >
                  Auto Generate
                </button>
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
              onChange={setGroupId}
              placeholder="Pick a group..."
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
              onChange={setSectionId}
              placeholder="Pick a section..."
            />
          </div>
          <p className="logic-note">Assign this to a section page.</p>
        </div>

        {/* SEO */}
        <div className="col-span-full border-t pt-5 mt-5">
          <h3 className="text-md font-bold text-slate-800 mb-2">SEO &amp; AEO Optimization</h3>
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
              onClick={handleGenerateSEO}
            >
              Auto-Generate
            </button>
          </div>
        </div>
      </form>

      <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-slate-200 mt-5">
        <button
          id="form-submit-btn"
          className="w-full sm:w-auto px-5 py-2 font-bold text-white text-sm bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
          onClick={handleSave}
        >
          Save Poetry
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
    </div>
  );
}

/** ---------------------------------------------------------------
 * ViewPoetry — clones your Management list (table/search/actions)
 * props:
 *  items: [{ id,title,poetId,bookId,createdAt,... }]
 *  poets: [{ id,name }]
 *  books: [{ id,title,bookType }]
 *  onAdd(), onEdit(id), onDelete(id)
 * --------------------------------------------------------------- */
export function ViewPoetry({ items = [], poets = [], books = [], onAdd, onEdit, onDelete }) {
  const [q, setQ] = useState("");

  const poetName = (pid) => poets.find((p) => p.id === pid)?.name || "N/A";
  const bookText = (bid) => {
    const b = books.find((x) => x.id === bid);
    return b ? (
      <>
        {b.title}{" "}
        <span className="text-xs text-slate-500">({b.bookType || "N/A"})</span>
      </>
    ) : (
      "N/A"
    );
  };

  const cols = [
    { header: "Title", render: (it) => <span className="font-bold">{it.title}</span> },
    { header: "Poet", render: (it) => poetName(it.poetId) },
    { header: "Book", render: (it) => bookText(it.bookId) },
  ];

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((it) => {
      const cells = [
        it.title || "",
        poetName(it.poetId) || "",
        (books.find((b) => b.id === it.bookId)?.title || "") +
          " " +
          (books.find((b) => b.id === it.bookId)?.bookType || ""),
      ]
        .join(" ")
        .toLowerCase();
      return cells.includes(needle);
    });
  }, [q, items, poets, books]);

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Poetry Management</h1>
          <p className="text-slate-500 mt-1">Create, view, and manage all poetry.</p>
        </div>
        <button
          id="mas-add-new-btn"
          className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 font-bold text-white text-sm bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-indigo-600/40 transition-all duration-300"
          onClick={() => onAdd && onAdd()}
        >
          <i className="bi bi-plus-circle-fill" /> Add New Poetry
        </button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="tab-nav -mb-px flex space-x-4" aria-label="Tabs">
          <button data-tab="management" className="aws-tab-btn active">
            Management
          </button>
          {/* Keeping a second tab placeholder to mirror UI; wire if needed */}
          <button data-tab="live-data" className="aws-tab-btn">
            Live Data
          </button>
        </nav>
      </div>

      {/* Management Panel */}
      <div id="mas-management-panel" className="tab-panel active mt-6">
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="bi bi-search text-slate-400" />
            </div>
            <input
              type="text"
              id="mas-search-input"
              className="form-input pl-10"
              placeholder="Search Poetry..."
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
                  {cols.map((c) => (
                    <th
                      key={c.header}
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      {c.header}
                    </th>
                  ))}
                  <th scope="col" className="relative px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody id="mas-table-body" className="divide-y divide-slate-200">
                {filtered.length === 0 && (
                  <tr>
                    <td
                      className="text-center py-10 text-slate-500"
                      colSpan={cols.length + 1}
                    >
                      No Poetry found.
                    </td>
                  </tr>
                )}

                {filtered.map((it) => (
                  <tr key={it.id} data-id={it.id} className="hover:bg-slate-50 transition-colors duration-200">
                    {cols.map((c) => (
                      <td
                        key={c.header}
                        data-label={c.header}
                        className="px-4 py-3 whitespace-nowrap text-sm text-slate-700"
                      >
                        {c.render(it)}
                      </td>
                    ))}
                    <td
                      data-label="Actions"
                      className="actions-cell px-4 py-3 whitespace-nowrap text-right text-sm font-medium"
                    >
                      <button
                        className="aws-edit-btn text-indigo-600 hover:text-indigo-900 font-semibold"
                        onClick={() => onEdit && onEdit(it.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="aws-delete-btn text-red-600 hover:text-red-900 ml-4 font-semibold"
                        onClick={() => onDelete && onDelete(it.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Live Data Panel (placeholder to mirror layout) */}
      <div id="mas-live-data-panel" className="tab-panel mt-6">
        {/* You can mount your JSON viewer here if needed */}
        <div id="mas-json-viewer-kalaam"></div>
      </div>
    </div>
  );
}

/** Default export if you prefer importing a single thing */
export default AddPoetry;
