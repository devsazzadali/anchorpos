/**
 * Universal CSV Exporter & Print Helper for Enterprise POS
 * Supports both:
 *  exportToCsv(filename, rows)
 *  exportToCsv(filename, columns, rows)
 */

export function exportToCsv(
  filename: string,
  columnsOrData: { header: string; key: string }[] | Record<string, any>[],
  maybeData?: Record<string, any>[]
) {
  let columns: { header: string; key: string }[];
  let data: Record<string, any>[];

  if (Array.isArray(maybeData)) {
    columns = columnsOrData as { header: string; key: string }[];
    data = maybeData;
  } else {
    data = columnsOrData as Record<string, any>[];
    if (!data || !data.length) return;
    const keys = Object.keys(data[0] || {});
    columns = keys.map((k) => ({ header: k, key: k }));
  }

  if (!data || !data.length) return;

  const cleanFilename = filename.endsWith(".csv") ? filename.slice(0, -4) : filename;
  const headerRow = columns.map((col) => `"${String(col.header).replace(/"/g, '""')}"`).join(",");
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const val = item[col.key] !== undefined && item[col.key] !== null ? String(item[col.key]) : "";
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  const csvContent = "\uFEFF" + [headerRow, ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${cleanFilename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printCurrentWindow() {
  if (typeof window !== "undefined") {
    window.print();
  }
}
