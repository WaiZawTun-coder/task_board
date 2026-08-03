"use client";

import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/UI/button";

type CalendarToolbarProps = {
  month: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
};

export function CalendarToolbar({
  month,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: CalendarToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-lg font-semibold sm:text-xl">
        {format(month, "MMMM yyyy")}
      </h2>
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="xs" onClick={onToday}>
          <RotateCcw className="h-3.5 w-3.5" />
          Today
        </Button>
        <div className="flex items-center rounded-md border">
          <Button
            variant="ghost"
            size="icon-xs"
            className="rounded-r-none"
            onClick={onPreviousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="rounded-l-none"
            onClick={onNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
