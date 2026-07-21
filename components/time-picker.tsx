"use client";

import * as React from "react";
import { ClockIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/UI/popover";
import { ScrollArea } from "@/components/UI/scroll-area";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i); // change step below if needed
const MINUTE_STEP = 1;

const pad2 = (n: number) => n.toString().padStart(2, "0");

type TimePickerProps = {
  hour?: number;
  minute?: number;
  onChange: (value: { hour: number; minute: number }) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

function TimePicker({
  hour,
  minute,
  onChange,
  placeholder = "Pick a time",
  disabled,
  className,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const hasValue = hour !== undefined && minute !== undefined;
  const minuteOptions = MINUTES.filter((m) => m % MINUTE_STEP === 0);

  const selectHour = (h: number) => {
    onChange({ hour: h, minute: minute ?? 0 });
  };

  const selectMinute = (m: number) => {
    onChange({ hour: hour ?? 0, minute: m });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
          "h-8 gap-1.5 px-2.5",
          "flex items-center justify-start rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
          !hasValue && "text-muted-foreground",
          className,
        )}
      >
        <ClockIcon className="mr-1.5 h-4 w-4 shrink-0" />
        {hasValue ? `${pad2(hour!)}:${pad2(minute!)}` : placeholder}
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex divide-x">
          {/* Hours column */}
          <ScrollArea className="h-56 w-16">
            <div className="flex flex-col p-1">
              {HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => selectHour(h)}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-center text-sm hover:bg-muted",
                    hour === h &&
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  {pad2(h)}
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* Minutes column */}
          <ScrollArea className="h-56 w-16">
            <div className="flex flex-col p-1">
              {minuteOptions.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => selectMinute(m)}
                  className={cn(
                    "rounded-md px-2 py-1.5 text-center text-sm hover:bg-muted",
                    minute === m &&
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  {pad2(m)}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { TimePicker };
