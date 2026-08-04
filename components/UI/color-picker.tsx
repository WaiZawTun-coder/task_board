"use client";

import { cn } from "@/lib/utils";
import { HexColorPicker } from "react-colorful";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface ColorPickerProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  error: boolean;
}

export function ColorPicker({
  id,
  value,
  onChange,
  className,
  error,
}: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "group/button px-3 py-2 cursor-pointer inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
          "w-55 justify-start text-left font-normal",
          className,
          "aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        )}
        id={id}
        aria-invalid={error}
      >
        <div className="flex w-full items-center gap-2">
          <div
            className="h-4 w-4 rounded-full border"
            style={{ backgroundColor: value }}
          />
          <span className="truncate">{value}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <HexColorPicker color={value} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
}
