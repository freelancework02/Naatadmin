import React, { useEffect, useMemo, useRef, useState } from "react";
import "../Forms.css";

/** ------------------------------------------------------------------
 *  JsonEditor — exact HTML/CSS/class/id structure cloned from your
 *  vanilla "JsonDataViewer" (Table/Code tabs, Add/Save/Import/Export)
 *  - Table cells are contenteditable
 *  - Has Actions column with per-row Delete
 *  - "Add" generates a row with a random id
 * ------------------------------------------------------------------ */
function JsonEditor({ data = [], onSave }) {
  const [view, setView] = useState("table"); // "table" | "code"
  const [code, setCode] = useState(JSON.stringify(data, null, 2));
  const importRef = useRef(null);

  // keep code view in sync when incoming data changes
  useEffect(() => {
    setCode(JSON.stringify(data, null, 2));
  }, [data]);

  const headers = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    const merged = data.reduce((acc, row) => ({ ...acc, ...row }), {});
    return Object.keys(merged);
  }, [data]);

  const generateId = () => "_" + Math.random().toString(36).slice(2, 11);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kalaam.json";
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
        if (!Array.isArray(parsed)) throw new Error("Data must be a JSON array.");
        // mimic confirm modal UX with simple confirm()
        if (window.confirm("This will replace all data in 'cache.kalaam'. Continue?")) {
          onSave && onSave(parsed);
        }
      } catch (err) {
        alert(`Import Error: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const saveFromCode = () => {
    try {
      const parsed = JSON.parse(code);
      if (!Array.isArray(parsed)) throw new Error("Data must be a JSON array.");
      onSave && onSave(parsed);
      alert("Success! Data has been saved to the local cache.");
    } catch (e) {
      alert(`Invalid JSON: ${e.message}`);
    }
  };

  const saveFromTable = () => {
    if (!Array.isArray(data) || data.length === 0) {
      onSave && onSave([]);
      alert("Success! Data has been saved to the local cache.");
      return;
    }
    // Collect rows from the DOM to keep it an exact clone of your viewer
    const table = document.querySelector(".json-table tbody");
    const newData = [];
    const allHeaders =
      data.length > 0 ? Object.keys(data.reduce((a, r) => ({ ...a, ...r }), {})) : headers;

    table?.querySelectorAll("tr").forEach((tr, rowIdx) => {
      const idAttr = tr.getAttribute("data-id");
      // start with original row to preserve keys not shown in table
      const originalRow =
        (idAttr && data.find((r) => String(r.id) === String(idAttr))) ||
        data[rowIdx] ||
        {};
      const nextRow = { ...originalRow };

      tr.querySelectorAll("td[contenteditable]").forEach((td) => {
        const key = td.getAttribute("data-key");
        let val = td.textContent;
        // try parse JSON-ish values just like your viewer
        try {
          nextRow[key] = JSON.parse(val);
        } catch {
          nextRow[key] = val;
        }
      });

      // ensure all headers exist even if empty
      allHeaders.forEach((h) => {
        if (!(h in nextRow)) nextRow[h] = "";
      });

      newData.push(nextRow);
    });

    onSave && onSave(newData);
    alert("Success! Data has been saved to the local cache.");
  };

  const addRow = () => {
    const baseHeaders =
      data.length > 0 ? Object.keys(data.reduce((a, r) => ({ ...a, ...r }), {})) : ["id", "title"];
    const blank = baseHeaders.reduce((acc, k) => ({ ...acc, [k]: "" }), {});
    blank.id = generateId();
    onSave && onSave([...(data || []), blank]);
  };

  return (
    <div className="json-viewer-container">
      <div className="p-3 border-b border-slate-200">
        <h3 className="text-md font-bold text-slate-800">Live Data: cache.kalaam</h3>
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
            onClick={() => (view === "code" ? saveFromCode() : saveFromTable())}
          >
            <i className="bi bi-check-all" /> Save
          </button>
          <button
            className="import-btn text-xs font-bold px-2 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
            onClick={() => importRef.current?.click()}
          >
            <i className="bi bi-upload" /> Import
          </button>
          <input
            ref={importRef}
            type="file"
            className="import-file-input"
            accept=".json"
            style={{ display: "none" }}
            onChange={importJson}
          />
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
                      <tr
                        key={row.id || rowIndex}
                        data-row-index={rowIndex}
                        data-id={row.id ? String(row.id) : undefined}
                      >
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
                            onClick={() => {
                              const copy = [...data];
                              copy.splice(rowIndex, 1);
                              onSave && onSave(copy);
                            }}
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
            <textarea
              className="json-code-view"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** ---------------------------------------------------------------
 *  ViewPoetry — exact list HTML clone of your vanilla Management view
 *  + identical ids/classes for tabs, panels, table, buttons, etc.
 * --------------------------------------------------------------- */
export default function ViewPoetry({
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

  const poetMap = useMemo(
    () => Object.fromEntries((poets || []).map((p) => [p.id, p.name])),
    [poets]
  );
  const bookMap = useMemo(
    () => Object.fromEntries((books || []).map((b) => [b.id, b])),
    [books]
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return (items || []).filter((item) => {
      const title = String(item.title || "").toLowerCase();
      const poet = String(poetMap[item.poetId] || "").toLowerCase();
      const book = String(bookMap[item.bookId]?.title || "").toLowerCase();
      const bookType = String(bookMap[item.bookId]?.bookType || "").toLowerCase();
      return (
        title.includes(query) ||
        poet.includes(query) ||
        book.includes(query) ||
        bookType.includes(query)
      );
    });
  }, [items, q, poetMap, bookMap]);

  return (
    <div>
      {/* Header */}
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

      {/* Panels */}
      {tab === "management" ? (
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
                placeholder="Search poetry..."
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
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      Poet
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      Book
                    </th>
                    <th scope="col" className="relative px-4 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody id="mas-table-body" className="divide-y divide-slate-200">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-500">
                        No poetry found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => {
                      const poetName = poetMap[item.poetId] || "N/A";
                      const b = bookMap[item.bookId];
                      return (
                        <tr
                          key={item.id}
                          data-id={item.id}
                          className="hover:bg-slate-50 transition-colors duration-200"
                        >
                          <td
                            data-label="Title"
                            className="px-4 py-3 whitespace-nowrap text-sm text-slate-700"
                          >
                            <span className="font-bold">{item.title}</span>
                          </td>
                          <td
                            data-label="Poet"
                            className="px-4 py-3 whitespace-nowrap text-sm text-slate-700"
                          >
                            {poetName}
                          </td>
                          <td
                            data-label="Book"
                            className="px-4 py-3 whitespace-nowrap text-sm text-slate-700"
                          >
                            {b ? (
                              <>
                                {b.title}{" "}
                                <span className="text-xs text-slate-500">
                                  ({b.bookType || "Book"})
                                </span>
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
          {/* exact "JsonDataViewer" clone wrapper */}
          <div id="mas-json-viewer-kalaam">
            <JsonEditor data={items} onSave={onSaveAll} />
          </div>
        </div>
      )}
    </div>
  );
}
