import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowUpDown, Download, Filter, X } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SLAPill } from "./SLAPill";
import { cn } from "@/lib/utils";

export interface QueueColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface QueueFilter {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface Props<T extends { id: string }> {
  title: string;
  description?: string;
  columns: QueueColumn<T>[];
  data: T[];
  filters?: QueueFilter[];
  onRowClick?: (row: T) => void;
  pageSizes?: number[];
}

export function QueueComponent<T extends { id: string }>({
  title,
  description,
  columns,
  data,
  filters = [],
  onRowClick,
  pageSizes = [25, 50, 100],
}: Props<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState(pageSizes[0]);
  const [page, setPage] = useState(0);

  // Active filters from URL
  const activeFilters = useMemo(() => {
    const result: Record<string, string> = {};
    filters.forEach((f) => {
      const val = searchParams.get(f.key);
      if (val) result[f.key] = val;
    });
    return result;
  }, [searchParams, filters]);

  const setFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params, { replace: true });
  };

  const filteredData = useMemo(() => {
    let result = [...data];
    // Text search (simple: stringify and match)
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        JSON.stringify(row).toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, search]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = (a as any)[sortKey];
      const bVal = (b as any)[sortKey];
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDir]);

  const paginatedData = sortedData.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(sortedData.length / pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleAll = () => {
    if (selected.size === paginatedData.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginatedData.map((r) => r.id)));
    }
  };

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const exportCSV = () => {
    const headers = columns.map((c) => c.header).join(",");
    const rows = sortedData.map((row) =>
      columns.map((c) => JSON.stringify((row as any)[c.key] ?? "")).join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg border bg-card">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="h-8 w-48 text-sm"
            />
          </div>
          {filters.map((f) => (
            <Select
              key={f.key}
              value={activeFilters[f.key] || "all"}
              onValueChange={(v) => setFilter(f.key, v === "all" ? null : v)}
            >
              <SelectTrigger className="h-8 w-[130px] text-sm">
                <SelectValue placeholder={f.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {f.label}</SelectItem>
                {f.options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          <Button variant="outline" size="sm" className="h-8" onClick={exportCSV}>
            <Download className="h-3 w-3 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* Active filter chips */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="px-4 py-2 border-b flex items-center gap-2 flex-wrap">
          <Filter className="h-3 w-3 text-muted-foreground" />
          {Object.entries(activeFilters).map(([key, value]) => (
            <Badge key={key} variant="secondary" className="text-xs gap-1">
              {key}: {value}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilter(key, null)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={selected.size === paginatedData.length && paginatedData.length > 0}
                onCheckedChange={toggleAll}
              />
            </TableHead>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(col.className, col.sortable && "cursor-pointer select-none")}
                onClick={() => col.sortable && toggleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && <ArrowUpDown className="h-3 w-3" />}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">
                No items found
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row) => (
              <TableRow
                key={row.id}
                className={cn(onRowClick && "cursor-pointer", "hover:bg-muted/50")}
                onClick={() => onRowClick?.(row)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(row.id)}
                    onCheckedChange={() => toggleRow(row.id)}
                  />
                </TableCell>
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Footer */}
      <div className="p-3 border-t flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <span className="text-primary font-medium">{selected.size} selected</span>
          )}
          <span>
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sortedData.length)} of {sortedData.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(0); }}>
            <SelectTrigger className="h-7 w-[70px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizes.map((s) => (
                <SelectItem key={s} value={String(s)}>{s}/page</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-7" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Prev
          </Button>
          <span className="text-xs">
            {page + 1} / {totalPages || 1}
          </span>
          <Button variant="outline" size="sm" className="h-7" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
