import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaHistory,
  FaSearch,
  FaTimes,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaSync,
  FaFileCsv,
  FaFilePdf,
} from "react-icons/fa";

import AdminLayout from "../layouts/AdminLayout";
import { getAuditLogs } from "../services/auditLogService.jsx";

const PAGE_SIZE = 10;

// ─── Relative-time helper ──────────────────────────────────────────────────
function relativeTime(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  if (diffHr < 24 && isToday) return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;
  if (isToday)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fullTimestamp(timestamp) {
  const date = new Date(timestamp);
  return (
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    "  " +
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  );
}

// ─── Dropdown filter ───────────────────────────────────────────────────────
function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-150 ${
          value
            ? "border-blue-500 bg-blue-50 text-blue-700"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
        }`}
      >
        {label}
        {value && (
          <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-xs text-white leading-none">
            {value}
          </span>
        )}
        <FaChevronDown
          className={`text-xs transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <button
            onClick={() => { onChange(""); setOpen(false); }}
            className={`w-full px-4 py-2 text-left text-sm ${!value ? "bg-blue-50 font-semibold text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
          >
            All
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full px-4 py-2 text-left text-sm ${value === opt ? "bg-blue-50 font-semibold text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Date range filter ─────────────────────────────────────────────────────
const DATE_PRESETS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "All time", value: "" },
];

function datePresetFilter(log, preset) {
  if (!preset) return true;
  const now = new Date();
  const date = new Date(log.timestamp);
  const startOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (preset === "today") return date >= startOf(now);
  if (preset === "yesterday") {
    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    return date >= startOf(yest) && date < startOf(now);
  }
  if (preset === "7d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return date >= d;
  }
  if (preset === "30d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    return date >= d;
  }
  return true;
}

// ─── Action meta (icon dot + badge) ───────────────────────────────────────
function getActionMeta(action) {
  const a = (action || "").toLowerCase();
  if (a.includes("deactivate") || a.includes("delete") || a.includes("remove"))
    return { badge: "bg-red-100 text-red-700",    dot: "#ef4444" }; // 🔴
  if (a.includes("password") || a.includes("reset"))
    return { badge: "bg-orange-100 text-orange-700", dot: "#f97316" }; // 🟠
  if (a.includes("return") || a.includes("script"))
    return { badge: "bg-purple-100 text-purple-700", dot: "#a855f7" }; // 🟣
  if (a.includes("update") || a.includes("edit") || a.includes("modify"))
    return { badge: "bg-blue-100 text-blue-700",   dot: "#3b82f6" }; // 🔵
  if (a.includes("create") || a.includes("add") || a.includes("register"))
    return { badge: "bg-green-100 text-green-700",  dot: "#22c55e" }; // 🟢
  return { badge: "bg-gray-100 text-gray-600",     dot: "#9ca3af" }; // ⚪
}

// ─── Export helpers ────────────────────────────────────────────────────────
function exportCSV(rows) {
  const headers = ["Time", "Admin", "Action", "Target"];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        `"${fullTimestamp(r.timestamp)}"`,
        `"${r.admin_name || ""}"`,
        `"${r.action || ""}"`,
        `"${r.target || ""}"`,
      ].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-logs-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportPDF(rows) {
  const win = window.open("", "_blank");
  if (!win) return;
  const rows_html = rows
    .map(
      (r) => `
      <tr>
        <td>${fullTimestamp(r.timestamp)}</td>
        <td>${r.admin_name || ""}</td>
        <td>${r.action || ""}</td>
        <td>${r.target || ""}</td>
      </tr>`
    )
    .join("");
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Audit Logs</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 24px; }
        h1 { font-size: 18px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #1e40af; color: #fff; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
        td { padding: 7px 12px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) td { background: #f9fafb; }
      </style>
    </head>
    <body>
      <h1>Audit Logs — ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</h1>
      <table>
        <thead><tr><th>Time</th><th>Admin</th><th>Action</th><th>Target</th></tr></thead>
        <tbody>${rows_html}</tbody>
      </table>
    </body>
    </html>`);
  win.document.close();
  win.print();
}

// ─── Main Component ────────────────────────────────────────────────────────
function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // pagination
  const [page, setPage] = useState(1);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAuditLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading audit logs:", err);
      setError(err.message || "Unable to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  // unique values for dropdowns
  const uniqueActions = useMemo(
    () => [...new Set(logs.map((l) => l.action).filter(Boolean))].sort(),
    [logs]
  );
  // filtered set
  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (
        q &&
        !(
          (log.admin_name && log.admin_name.toLowerCase().includes(q)) ||
          (log.action && log.action.toLowerCase().includes(q)) ||
          (log.target && log.target.toLowerCase().includes(q))
        )
      )
        return false;
      if (actionFilter && log.action !== actionFilter) return false;
      if (!datePresetFilter(log, dateFilter)) return false;
      return true;
    });
  }, [logs, search, actionFilter, dateFilter]);

  // reset to page 1 when filters change
  useEffect(() => setPage(1), [search, actionFilter, dateFilter]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedLogs = filteredLogs.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const pageNumbers = useMemo(() => {
    const nums = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= safePage - 1 && i <= safePage + 1)
      )
        nums.push(i);
    }
    const result = [];
    let prev = 0;
    for (const n of nums) {
      if (prev && n - prev > 1) result.push("…");
      result.push(n);
      prev = n;
    }
    return result;
  }, [totalPages, safePage]);

  const hasFilters = search || actionFilter || dateFilter;

  return (
    <AdminLayout
      title="Audit Logs"
      subtitle="Track all important administrative actions."
    >
      <div className="space-y-5">
        {loading && (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-700"></div>
              <p className="text-gray-600">Loading audit logs...</p>
            </div>
          </div>
        )}

        {!loading && (
          <>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            {/* ── Filter Bar ── */}
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                  <FaSearch className="shrink-0 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search admin / action / target…"
                    className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="shrink-0 text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>

                {/* Action filter */}
                <FilterDropdown
                  label="Action"
                  options={uniqueActions}
                  value={actionFilter}
                  onChange={setActionFilter}
                />


                {/* Date filter */}
                <FilterDropdown
                  label="Date"
                  options={DATE_PRESETS.filter((p) => p.value).map((p) => p.label)}
                  value={
                    dateFilter
                      ? DATE_PRESETS.find((p) => p.value === dateFilter)?.label || ""
                      : ""
                  }
                  onChange={(label) => {
                    const found = DATE_PRESETS.find((p) => p.label === label);
                    setDateFilter(found ? found.value : "");
                  }}
                />

                {/* Refresh */}
                <button
                  onClick={loadAuditLogs}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95"
                  title="Refresh"
                >
                  <FaSync className="text-xs" />
                  Refresh
                </button>

                {/* spacer + Export buttons */}
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => exportCSV(filteredLogs)}
                    className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition-all hover:bg-green-100 active:scale-95"
                    title="Export CSV"
                  >
                    <FaFileCsv />
                    Export CSV
                  </button>
                  <button
                    onClick={() => exportPDF(filteredLogs)}
                    className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-all hover:bg-red-100 active:scale-95"
                    title="Export PDF"
                  >
                    <FaFilePdf />
                    Export PDF
                  </button>
                </div>
              </div>

              {/* active filter chips */}
              {hasFilters && (
                <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-400">Active filters:</span>
                  {search && (
                    <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      "{search}"
                      <button onClick={() => setSearch("")}><FaTimes className="text-[10px]" /></button>
                    </span>
                  )}
                  {actionFilter && (
                    <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      Action: {actionFilter}
                      <button onClick={() => setActionFilter("")}><FaTimes className="text-[10px]" /></button>
                    </span>
                  )}

                  {dateFilter && (
                    <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      {DATE_PRESETS.find((p) => p.value === dateFilter)?.label}
                      <button onClick={() => setDateFilter("")}><FaTimes className="text-[10px]" /></button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSearch("");
                      setActionFilter("");
                      setDateFilter("");
                    }}
                    className="ml-1 text-xs text-gray-400 underline hover:text-gray-600"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* ── Table Card ── */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* header */}
              <div className="flex items-center gap-3 border-b border-gray-200 px-8 py-5">
                <FaHistory className="text-2xl text-blue-700" />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Recent Activity
                  </h2>
                  <p className="text-sm text-gray-500">
                    Latest administrative actions performed in the system.
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {filteredLogs.length} result{filteredLogs.length !== 1 ? "s" : ""}
                </span>
              </div>

              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <FaHistory className="mb-4 text-6xl text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-700">
                    {hasFilters ? "No matching results" : "No Audit Activity"}
                  </h3>
                  <p className="mt-2 text-gray-500">
                    {hasFilters
                      ? "Try adjusting or clearing your filters."
                      : "Administrative actions will appear here."}
                  </p>
                  {hasFilters && (
                    <button
                      onClick={() => {
                        setSearch("");
                        setActionFilter("");
                        setDateFilter("");
                      }}
                      className="mt-4 text-sm text-blue-600 hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full table-fixed">
                      <colgroup>
                        <col className="w-1/3" />
                        <col className="w-1/3" />
                        <col className="w-1/3" />
                      </colgroup>
                      <thead className="border-b bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Time
                          </th>

                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Action
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Target
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {pagedLogs.map((log) => (
                          <tr
                            key={log.id}
                            className="transition-colors duration-200 hover:bg-blue-50"
                          >
                            {/* Time — relative with full-timestamp tooltip */}
                            <td className="px-6 py-5">
                              <span title={fullTimestamp(log.timestamp)} className="cursor-default">
                                <span className="block text-sm font-medium text-gray-800">
                                  {relativeTime(log.timestamp)}
                                </span>
                                {(() => {
                                  const d = new Date(log.timestamp);
                                  const now = new Date();
                                  const isToday =
                                    d.getFullYear() === now.getFullYear() &&
                                    d.getMonth() === now.getMonth() &&
                                    d.getDate() === now.getDate();
                                  return isToday ? (
                                    <span className="block text-xs text-gray-400">
                                      {d.toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}
                                    </span>
                                  ) : (
                                    <span className="block text-xs text-gray-400">
                                      {d.toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </span>
                                  );
                                })()}
                              </span>
                            </td>


                            <td className="px-6 py-5">
                              {(() => {
                                const { badge, dot } = getActionMeta(log.action);
                                return (
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge}`}
                                  >
                                    {/* colored dot */}
                                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                                      <circle cx="4" cy="4" r="4" fill={dot} />
                                    </svg>
                                    {log.action}
                                  </span>
                                );
                              })()}
                            </td>

                            <td className="px-6 py-5">
                              <span className="font-mono text-sm font-semibold text-blue-700">
                                {log.target}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ── Pagination ── */}
                  <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                    <p className="text-sm text-gray-500">
                      Showing{" "}
                      <span className="font-semibold text-gray-700">
                        {(safePage - 1) * PAGE_SIZE + 1}
                      </span>
                      –
                      <span className="font-semibold text-gray-700">
                        {Math.min(safePage * PAGE_SIZE, filteredLogs.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-gray-700">
                        {filteredLogs.length}
                      </span>
                    </p>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <FaChevronLeft className="text-xs" />
                        Previous
                      </button>

                      {pageNumbers.map((n, i) =>
                        n === "…" ? (
                          <span key={`ellipsis-${i}`} className="px-2 text-sm text-gray-400">
                            …
                          </span>
                        ) : (
                          <button
                            key={n}
                            onClick={() => setPage(n)}
                            className={`min-w-[36px] rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                              n === safePage
                                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {n}
                          </button>
                        )
                      )}

                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                        <FaChevronRight className="text-xs" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default AuditLogs;