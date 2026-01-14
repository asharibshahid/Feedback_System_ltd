"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { Badge } from "@/components/ui/Badge";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Sheet } from "@/components/ui/shadcn/Sheet";
import { Input } from "@/components/ui/shadcn/Input";
import { Select } from "@/components/ui/shadcn/Select";
import { visitors, Visitor, VisitorStatus, purposeOptions } from "@/lib/mockVisitors";

const columnHelper = createColumnHelper<Visitor>();

const statusFilters = [
  { label: "All statuses", value: "all" },
  { label: "Allowed", value: "Allowed" },
  { label: "Blocked", value: "Blocked" },
  { label: "Pending", value: "Pending" },
];

const timeframeFilters = [
  { label: "All time", value: "all" },
  { label: "Last 7 days", value: "week" },
  { label: "Last 30 days", value: "month" },
];

const referenceTimestamp = Date.now();

const VisitorTable = ({ data, onView }: { data: Visitor[]; onView: (visitor: Visitor) => void }) => {
  const table = useReactTable({
    data,
    columns: [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <div className="text-sm font-semibold text-[#0F172A]">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("mobile", {
        header: "Mobile",
        cell: (info) => <span className="text-xs text-[#475569]">{info.getValue()}</span>,
      }),
      columnHelper.accessor("company", {
        header: "Company",
        cell: (info) => <span className="text-xs text-[#475569]">{info.getValue()}</span>,
      }),
      columnHelper.accessor("purpose", {
        header: "Purpose",
        cell: (info) => <span className="text-xs font-semibold text-[#2563EB]">{info.getValue()}</span>,
      }),
      columnHelper.accessor("meetingWith", {
        header: "Meeting with",
        cell: (info) => <span className="text-xs text-[#475569]">{info.getValue()}</span>,
      }),
      columnHelper.accessor("dateLabel", {
        header: "Date",
        cell: (info) => <span className="text-xs text-[#475569]">{info.getValue()}</span>,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <Badge variant={info.getValue() === "Allowed" ? "success" : info.getValue() === "Blocked" ? "danger" : "warning"}>
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <button
            type="button"
            onClick={() => onView(info.row.original)}
            className="rounded-[12px] border border-[#CBD5E1] px-4 py-1 text-xs font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:text-[#2563EB]"
          >
            View
          </button>
        ),
      }),
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left">
        <thead className="text-[0.7rem] uppercase tracking-[0.4em] text-[#94A3B8]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border-b border-[#E2E8F0] px-4 py-3">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <motion.tr
              key={row.id}
              className="cursor-pointer border-b border-[#F1F5F9] bg-white transition hover:bg-[#EFF6FF]"
              whileHover={{ translateX: 2 }}
              onClick={() => onView(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function AdminVisitorsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VisitorStatus | "all">("all");
  const [purposeFilter, setPurposeFilter] = useState<string>("all");
  const [timeframeFilter, setTimeframeFilter] = useState<"all" | "week" | "month">("all");
  const [pageIndex, setPageIndex] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detailVisitor, setDetailVisitor] = useState<Visitor | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const pageSize = 8;
  const filteredVisitors = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    return visitors.filter((visitor) => {
      const matchesSearch =
        visitor.name.toLowerCase().includes(normalizedSearch) ||
        visitor.mobile.includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || visitor.status === statusFilter;
      const matchesPurpose = purposeFilter === "all" || visitor.purpose === purposeFilter;
      const visitorDate = new Date(visitor.date);
      const diff = (referenceTimestamp - visitorDate.getTime()) / (1000 * 3600 * 24);
      const matchesTimeframe =
        timeframeFilter === "all" ||
        (timeframeFilter === "week" && diff <= 7) ||
        (timeframeFilter === "month" && diff <= 30);
      return matchesSearch && matchesStatus && matchesPurpose && matchesTimeframe;
    });
  }, [search, statusFilter, purposeFilter, timeframeFilter]);

  const filteredPageCount = Math.max(1, Math.ceil(filteredVisitors.length / pageSize));

  useEffect(() => {
    let timer: number | undefined;
    if (typeof window !== "undefined") {
      timer = window.setTimeout(() => {
        setPageIndex((prev) => Math.min(prev, filteredPageCount - 1));
      }, 0);
    }
    return () => {
      if (typeof window !== "undefined" && timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [filteredPageCount]);

  const pagedVisitors = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredVisitors.slice(start, start + pageSize);
  }, [filteredVisitors, pageIndex, pageSize]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Admin data</p>
            <h1 className="text-3xl font-semibold text-[#0F172A]">Visitor log</h1>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="rounded-[12px] border border-[#CBD5E1] px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-[#0F172A] transition hover:border-[#2563EB] hover:text-[#2563EB]"
            >
              Filters
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 rounded-[20px] border border-[#E2E8F0] bg-white/80 px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#475569] shadow-sm">
          <Link
            href="/admin"
            className="rounded-full border border-[#CBD5E1] px-4 py-2 text-[0.65rem] text-[#0F172A] transition hover:border-[#2563EB] hover:text-[#2563EB]"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/visitors"
            className="rounded-full border border-[#2563EB] px-4 py-2 text-[0.65rem] text-[#2563EB] transition hover:bg-[#EFF6FF]"
          >
            Visitors
          </Link>
          <Link
            href="/visitor/checkin"
            className="rounded-full border border-[#CBD5E1] px-4 py-2 text-[0.65rem] text-[#0F172A] transition hover:border-[#2563EB] hover:text-[#2563EB]"
          >
            New Check-in
          </Link>
        </div>

        <GlassPanel className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              label="Search by name or mobile"
              placeholder="Jordan Ellis / +1 555 012"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPageIndex(0);
              }}
              className="flex-1"
            />
            <div className="hidden flex-1 items-center gap-3 md:flex">
              <Select
                label="Status"
                options={statusFilters.map((entry) => ({ label: entry.label, value: entry.value }))}
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as VisitorStatus | "all");
                  setPageIndex(0);
                }}
              />
              <Select
                label="Purpose"
                options={[{ label: "All purposes", value: "all" }, ...purposeOptions.map((item) => ({ label: item, value: item }))]}
                value={purposeFilter}
                onChange={(event) => {
                  setPurposeFilter(event.target.value);
                  setPageIndex(0);
                }}
              />
              <Select
                label="Date range"
                options={timeframeFilters}
                value={timeframeFilter}
                onChange={(event) => {
                  setTimeframeFilter(event.target.value as "all" | "week" | "month");
                  setPageIndex(0);
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="hidden md:block">
              <VisitorTable
                data={pagedVisitors}
                onView={(visitor) => {
                  setDetailVisitor(visitor);
                  setDetailOpen(true);
                }}
              />
            </div>

            <div className="flex flex-col gap-4 md:hidden">
              {filteredVisitors.map((visitor) => (
                <motion.article
                  key={visitor.id}
                  className="rounded-[20px] border border-[#E2E8F0] bg-white/80 p-4 shadow-[0_20px_40px_rgba(15,23,42,0.1)]"
                  whileHover={{ y: -3 }}
                  onClick={() => {
                    setDetailVisitor(visitor);
                    setDetailOpen(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#0F172A]">{visitor.name}</p>
                    <Badge
                      variant={visitor.status === "Allowed" ? "success" : visitor.status === "Blocked" ? "danger" : "warning"}
                    >
                      {visitor.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#475569]">{visitor.purpose}</p>
                  <p className="text-xs text-[#475569]">{visitor.mobile}</p>
                </motion.article>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-[#94A3B8]">
            <span>
              Showing {Math.min(filteredVisitors.length, pageSize)} of {filteredVisitors.length} visitors
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
                disabled={pageIndex === 0}
                className="rounded-[12px] border border-[#CBD5E1] px-3 py-1 text-xs font-semibold text-[#0F172A] transition hover:border-[#2563EB] disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span>
                Page {pageIndex + 1} of {filteredPageCount}
              </span>
              <button
                type="button"
                onClick={() => setPageIndex((prev) => Math.min(prev + 1, filteredPageCount - 1))}
                disabled={pageIndex >= filteredPageCount - 1}
                className="rounded-[12px] border border-[#CBD5E1] px-3 py-1 text-xs font-semibold text-[#0F172A] transition hover:border-[#2563EB] disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </GlassPanel>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen} title="Filters" side="left" size="sm">
        <div className="space-y-4">
          <Input
            label="Search"
            placeholder="Name or mobile"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPageIndex(0);
            }}
          />
          <Select
            label="Status"
            options={statusFilters.map((entry) => ({ label: entry.label, value: entry.value }))}
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as VisitorStatus | "all");
              setPageIndex(0);
            }}
          />
          <Select
            label="Purpose"
            options={[{ label: "All purposes", value: "all" }, ...purposeOptions.map((item) => ({ label: item, value: item }))]}
            value={purposeFilter}
            onChange={(event) => {
              setPurposeFilter(event.target.value);
              setPageIndex(0);
            }}
          />
          <Select
            label="Date range"
            options={timeframeFilters}
            value={timeframeFilter}
            onChange={(event) => {
              setTimeframeFilter(event.target.value as "all" | "week" | "month");
              setPageIndex(0);
            }}
          />
        </div>
      </Sheet>

      <Sheet open={detailOpen} onOpenChange={setDetailOpen} title="Visitor details" size="lg">
        {detailVisitor && (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">{detailVisitor.meetingWith}</p>
              <h2 className="text-2xl font-semibold text-[#0F172A]">{detailVisitor.name}</h2>
              <p className="text-sm text-[#475569]">
                {detailVisitor.company} · {detailVisitor.purpose}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Contact</p>
                <p className="text-sm text-[#475569]">{detailVisitor.mobile}</p>
                <p className="text-xs text-[#475569]">{detailVisitor.dateLabel}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Status</p>
                <Badge variant={detailVisitor.status === "Allowed" ? "success" : detailVisitor.status === "Blocked" ? "danger" : "warning"}>
                  {detailVisitor.status}
                </Badge>
              </div>
            </div>
            <div className="space-y-1 rounded-[20px] border border-dashed border-[#CBD5E1] bg-[#EFF6FF] p-4">
              <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">Selfie preview</p>
              <div className="h-40 w-full rounded-[16px] bg-gradient-to-br from-[#E0ECFF] to-[#F8FAFC]" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button className="rounded-[12px] border border-[#CBD5E1] px-4 py-2 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:text-[#2563EB]">
                Secure gate
              </button>
              <button className="rounded-[12px] bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]">
                Export summary
              </button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
