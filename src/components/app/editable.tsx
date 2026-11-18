import { Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function OutputSection({ title, children, tone }: { title: string; children: ReactNode; tone?: "warning" }) {
  return (
    <div className="space-y-2">
      <h3
        className={cn(
          "text-xs font-semibold uppercase tracking-wider",
          tone === "warning" ? "text-warning" : "text-primary",
        )}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

const editableBase =
  "field-sizing-content min-h-0 resize-none border-transparent bg-transparent px-2 py-1.5 text-sm leading-relaxed shadow-none hover:border-input focus-visible:border-input focus-visible:bg-background";

export function EditableText({
  value,
  onChange,
  label,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  className?: string;
}) {
  return (
    <Textarea aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={cn(editableBase, "-mx-2", className)} />
  );
}

/** One item per line; bullets are shown visually, not stored. */
export function EditableList({
  items,
  onChange,
  label,
  emptyText = "None",
}: {
  items: string[];
  onChange: (v: string[]) => void;
  label: string;
  emptyText?: string;
}) {
  return (
    <div>
      <Textarea
        aria-label={label}
        value={items.join("\n")}
        placeholder={emptyText}
        onChange={(e) => onChange(e.target.value.split("\n"))}
        className={cn(editableBase, "rounded-none border-l-2 border-l-primary/30 pl-3 hover:border-l-primary/30 focus-visible:border-l-primary")}
      />
    </div>
  );
}

export type Column<Row> = { key: keyof Row & string; label: string; className?: string };

export function EditableTable<Row extends Record<string, string>>({
  rows,
  columns,
  onChange,
  newRow,
  label,
}: {
  rows: Row[];
  columns: Column<Row>[];
  onChange: (rows: Row[]) => void;
  newRow: Row;
  label: string;
}) {
  const update = (i: number, key: keyof Row, v: string) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)));

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[520px] text-sm" aria-label={label}>
          <thead className="bg-muted/60">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={cn("px-3 py-2 text-left text-xs font-semibold text-muted-foreground", c.className)}>
                  {c.label}
                </th>
              ))}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-4 text-center text-muted-foreground">
                  No rows yet
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr key={i} className="border-t">
                {columns.map((c) => (
                  <td key={c.key} className="px-1.5 py-1">
                    <Input
                      aria-label={`${c.label} row ${i + 1}`}
                      value={row[c.key]}
                      onChange={(e) => update(i, c.key, e.target.value)}
                      className="h-8 border-transparent bg-transparent shadow-none hover:border-input focus-visible:bg-background"
                    />
                  </td>
                ))}
                <td className="px-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove row ${i + 1}`}
                    onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="text-muted-foreground" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={() => onChange([...rows, { ...newRow }])}>
        <Plus /> Add row
      </Button>
    </div>
  );
}

export function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
