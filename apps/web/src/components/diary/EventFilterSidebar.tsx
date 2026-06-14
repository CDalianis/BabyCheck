import type { EventType } from "@babycheck/shared";
import { useEffect, useState } from "react";
import { EVENT_STYLES } from "../../constants/eventStyles";
import StickySidebar, { StickySidebarPanel } from "../layout/StickySidebarPanel";
import type {
  EventFilterId,
  FilterCategory,
} from "../../utils/eventFilters";
import {
  categoryHasSubFilters,
  getFilterLabel,
} from "../../utils/eventFilters";

interface EventFilterSidebarProps {
  value: EventFilterId;
  onChange: (value: EventFilterId) => void;
  counts: Record<string, number>;
  categories: FilterCategory[];
  mobileOpen: boolean;
  onMobileClose: () => void;
  onMobileOpen: () => void;
}

function FilterButton({
  id,
  label,
  active,
  count,
  type,
  nested,
  onSelect,
}: {
  id: EventFilterId;
  label: string;
  active: boolean;
  count: number;
  type?: EventType;
  nested?: boolean;
  onSelect: (id: EventFilterId) => void;
}) {
  const styles = type ? EVENT_STYLES[type] : null;

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`flex w-full items-center justify-between gap-2 rounded-xl text-left text-sm font-medium transition ${
        nested ? "px-3 py-2" : "px-3 py-2.5"
      } ${
        active
          ? "bg-theme-brand text-white shadow-sm"
          : styles && !nested
            ? `${styles.bg} ${styles.text} hover:brightness-95`
            : nested
              ? "text-theme-body hover:bg-theme-surface-hover"
              : "bg-theme-surface-95 text-theme-body hover:bg-theme-surface-hover"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2">
        {type && !nested && (
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${EVENT_STYLES[type].dot}`}
          />
        )}
        {nested && (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-theme-muted/50" />
        )}
        <span className="truncate">{label}</span>
      </span>
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-xs tabular-nums ${
          active ? "bg-white/20" : "bg-theme-surface-elevated text-theme-muted"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function FilterPanel({
  value,
  onChange,
  counts,
  categories,
  onSelect,
}: {
  value: EventFilterId;
  onChange: (value: EventFilterId) => void;
  counts: Record<string, number>;
  categories: FilterCategory[];
  onSelect?: () => void;
}) {
  const [expanded, setExpanded] = useState<Record<EventType, boolean>>(() => {
    const initial = {} as Record<EventType, boolean>;
    for (const category of categories) {
      initial[category.type] = true;
    }
    return initial;
  });

  useEffect(() => {
    if (value === "all") return;
    const type = value.includes(":")
      ? (value.split(":")[0] as EventType)
      : (value as EventType);
    setExpanded((prev) => ({ ...prev, [type]: true }));
  }, [value]);

  function handleSelect(id: EventFilterId) {
    onChange(id);
    onSelect?.();
  }

  function toggleCategory(type: EventType) {
    setExpanded((prev) => ({ ...prev, [type]: !prev[type] }));
  }

  return (
    <div className="space-y-2">
      <FilterButton
        id="all"
        label="All events"
        active={value === "all"}
        count={counts.all ?? 0}
        onSelect={handleSelect}
      />

      {categories.map((category) => {
        const hasSubOptions = categoryHasSubFilters(category);
        const categoryActive =
          value === category.type ||
          (value.startsWith(`${category.type}:`) && value !== category.type);
        const isOpen = expanded[category.type] ?? true;

        if (!hasSubOptions) {
          return (
            <FilterButton
              key={category.type}
              id={category.type}
              label={category.label}
              active={value === category.type}
              count={counts[category.type] ?? 0}
              type={category.type}
              onSelect={handleSelect}
            />
          );
        }

        return (
          <div
            key={category.type}
            className={`overflow-hidden rounded-xl border ${
              categoryActive
                ? "border-theme-brand/40 bg-theme-surface-95"
                : "border-theme bg-theme-surface-95"
            }`}
          >
            <div className="flex items-stretch">
              <button
                type="button"
                onClick={() => handleSelect(category.type)}
                className={`flex min-w-0 flex-1 items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-semibold transition ${
                  value === category.type
                    ? "bg-theme-brand text-white"
                    : `${EVENT_STYLES[category.type].bg} ${EVENT_STYLES[category.type].text} hover:brightness-95`
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${EVENT_STYLES[category.type].dot}`}
                  />
                  <span className="truncate">{category.label}</span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs tabular-nums ${
                    value === category.type
                      ? "bg-white/20"
                      : "bg-theme-surface-elevated text-theme-muted"
                  }`}
                >
                  {counts[category.type] ?? 0}
                </span>
              </button>
              <button
                type="button"
                onClick={() => toggleCategory(category.type)}
                className={`shrink-0 border-l px-2.5 text-theme-muted transition hover:bg-theme-surface-hover ${
                  value === category.type
                    ? "border-white/20 text-white hover:bg-white/10"
                    : "border-theme"
                }`}
                aria-expanded={isOpen}
                aria-label={`${isOpen ? "Collapse" : "Expand"} ${category.label}`}
              >
                <span
                  className={`inline-block text-xs transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
            </div>

            {isOpen && (
              <ul className="space-y-0.5 border-t border-theme p-1.5">
                {category.options.map((option) => (
                  <li key={option.id}>
                    <FilterButton
                      id={option.id}
                      label={option.label}
                      active={value === option.id}
                      count={counts[option.id] ?? 0}
                      type={category.type}
                      nested
                      onSelect={handleSelect}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function EventFilterSidebar({
  value,
  onChange,
  counts,
  categories,
  mobileOpen,
  onMobileClose,
  onMobileOpen,
}: EventFilterSidebarProps) {
  const activeLabel = getFilterLabel(value, categories);

  return (
    <div className="lg:flex lg:h-full lg:flex-col">
      <button
        type="button"
        onClick={onMobileOpen}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-theme bg-theme-surface-95 px-4 py-2.5 text-sm font-medium text-theme-body lg:hidden"
      >
        <span>☰</span>
        Filter events
        {value !== "all" && (
          <span className="max-w-[10rem] truncate rounded-full bg-theme-brand px-2 py-0.5 text-xs text-white">
            {activeLabel}
          </span>
        )}
      </button>

      <StickySidebar title="Filter events">
        <FilterPanel
          value={value}
          onChange={onChange}
          counts={counts}
          categories={categories}
        />
      </StickySidebar>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-label="Close filters"
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(88vw,18rem)] flex-col border-r border-theme bg-theme-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-theme px-4 py-3">
              <h2 className="text-sm font-bold text-theme-body">Filter events</h2>
              <button
                type="button"
                onClick={onMobileClose}
                className="rounded-lg px-2 py-1 text-xl text-theme-muted hover:bg-theme-surface-hover"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <StickySidebarPanel title="Filter events" sticky={false}>
                <FilterPanel
                  value={value}
                  onChange={onChange}
                  counts={counts}
                  categories={categories}
                  onSelect={onMobileClose}
                />
              </StickySidebarPanel>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
