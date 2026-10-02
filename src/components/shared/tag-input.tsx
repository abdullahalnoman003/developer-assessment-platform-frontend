"use client";

import { XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * A controlled tag editor. It is intentionally not a hook: the parent already
 * owns the value through React Hook Form, and a second source of truth for the
 * list is how tag fields drift out of sync with the submitted payload.
 *
 * The hidden input is what actually reaches the server action — the visible
 * chips are decoration. It is kept in the DOM at all times so a form that
 * submits with JavaScript disabled still carries the tags.
 */
export function TagInput({
  id,
  value,
  onChange,
  max = 20,
  maxLength = 50,
  placeholder = "Add a tag and press Enter",
  disabled,
  className,
}: {
  id: string;
  value: string[];
  onChange: (tags: string[]) => void;
  max?: number;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    if (tag.length > maxLength) return;
    // Case-insensitive de-dupe so "React" and "react" cannot both be stored.
    if (
      value.some((existing) => existing.toLowerCase() === tag.toLowerCase())
    ) {
      setDraft("");
      return;
    }
    if (value.length >= max) return;
    onChange([...value, tag]);
    setDraft("");
  };

  const remove = (tag: string) => {
    onChange(value.filter((existing) => existing !== tag));
  };

  const atMax = value.length >= max;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 border border-input bg-background p-2 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50",
        className,
      )}
    >
      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <li
              key={tag}
              className="inline-flex h-6 items-center gap-1 border border-border bg-muted px-1.5 font-mono text-xs"
            >
              <span className="max-w-40 truncate">{tag}</span>
              <button
                aria-label={`Remove tag ${tag}`}
                className="rounded-sm text-muted-foreground hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                disabled={disabled}
                onClick={() => remove(tag)}
                type="button"
              >
                <XIcon className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex items-center gap-2">
        <Input
          aria-describedby={`${id}-hint`}
          className="h-8 flex-1 border-0 px-1 shadow-none focus-visible:ring-0"
          disabled={disabled || atMax}
          id={id}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              add(draft);
              return;
            }
            if (event.key === "Backspace" && draft === "" && value.length > 0) {
              remove(value[value.length - 1]);
            }
          }}
          placeholder={atMax ? `Tag limit of ${max} reached` : placeholder}
          type="text"
          value={draft}
        />
        <Button
          disabled={disabled || atMax || draft.trim() === ""}
          onClick={() => add(draft)}
          size="sm"
          type="button"
          variant="outline"
        >
          Add
        </Button>
      </div>

      <input name="tags" type="hidden" value={JSON.stringify(value)} />
      <p className="text-xs/relaxed text-muted-foreground" id={`${id}-hint`}>
        {value.length} of {max} tags. Press Enter or comma to add. Backspace
        removes the last one.
      </p>
    </div>
  );
}
