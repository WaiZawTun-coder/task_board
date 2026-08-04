"use client";

import { useEffect } from "react";

type ShortcutOptions = {
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  escapeKey?: boolean;
};

type keyboardShortcutParams = {
  key: string;
  callback: () => void;
  options?: ShortcutOptions;
};

export function useKeyboardShortcut({
  key,
  callback,
  options = {},
}: keyboardShortcutParams) {
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      if (
        event.key !== "Escape" &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const matchKey =
        event.key.toLocaleLowerCase() === key.toLocaleLowerCase();
      const matchCtrl = options.ctrlKey ? event.ctrlKey : !event.ctrlKey;
      const matchMeta = options.metaKey ? event.metaKey : !event.metaKey;
      const matchShift = options.shiftKey ? event.shiftKey : !event.shiftKey;
      const matchAlt = options.altKey ? event.altKey : !event.altKey;

      if (
        event.key === "Escape" ||
        (matchKey && matchCtrl && matchMeta && matchShift && matchAlt)
      ) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeydown);

    return () => window.removeEventListener("keydown", handleKeydown);
  }, [key, callback, options]);
}
