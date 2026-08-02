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
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-semibold sm:text-2xl">{format(month, "MMMM yyyy")}</h2>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onToday}>
          <RotateCcw className="h-4 w-4" />
          Today
        </Button>
        <div className="flex items-center rounded-md border">
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-r-none"
            onClick={onPreviousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-l-none"
            onClick={onNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
