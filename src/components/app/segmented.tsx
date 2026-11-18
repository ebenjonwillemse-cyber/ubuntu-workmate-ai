import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function Segmented<T extends string>({
  id,
  value,
  options,
  onChange,
}: {
  id: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <ToggleGroup
      id={id}
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as T)}
      className="grid w-full gap-1 rounded-lg bg-muted p-1"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => (
        <ToggleGroupItem
          key={o}
          value={o}
          className="h-8 rounded-md text-xs font-medium text-muted-foreground data-[state=on]:bg-card data-[state=on]:text-primary data-[state=on]:shadow-card"
        >
          {o}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
