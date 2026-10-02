"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { saveAnswersAction } from "@/app/(candidateSection)/_actions/candidate";
import type { ActionState, JsonValue } from "@/lib/types";
import { IDLE_ACTION_STATE } from "@/lib/types";

const DEFAULT_INTERVAL_MS = 20_000;

export interface UseAutoSaveResult {
  /** True when there are unsaved changes in the local state. */
  dirty: boolean;
  /** True while a save request is in flight. */
  saving: boolean;
  /** ISO timestamp of the last successful save, for the "Saved Xs ago" label. */
  lastSaved: Date | null;
  /** Flushes immediately. Returns the action result. */
  saveNow: () => Promise<ActionState>;
  /** Marks the current state as clean (e.g. after a successful submit). */
  markClean: () => void;
}

function isBlank(value: JsonValue): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

function toFormData(
  attemptId: string,
  map: Record<string, JsonValue>,
): FormData {
  const formData = new FormData();
  formData.set("attemptId", attemptId);
  formData.set(
    "answers",
    JSON.stringify(
      Object.entries(map)
        .filter(([, response]) => !isBlank(response))
        .map(([questionId, response]) => ({ questionId, response })),
    ),
  );
  return formData;
}

/**
 * Debounced autosave for the attempt runner. Every 20 s and on every question
 * change, the local answer map is pushed to the server via
 * `saveAnswersAction`. A `beforeunload` banner fires when there is pending
 * work so the browser asks before the tab closes.
 *
 * Only answered questions are sent — a blank `response` is stripped before the
 * request, because the backend schema requires `answers.length >= 1` and an
 * empty array would 400. An unanswered question is simply absent from the
 * payload, which leaves any previously-saved answer untouched (the backend
 * upserts by `questionId`).
 */
export function useAutoSave({
  attemptId,
  answers,
  intervalMs = DEFAULT_INTERVAL_MS,
}: {
  attemptId: string;
  answers: Record<string, JsonValue>;
  intervalMs?: number;
}): UseAutoSaveResult {
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const answersRef = useRef(answers);
  const snapshotRef = useRef<Record<string, JsonValue>>({});

  useEffect(() => {
    answersRef.current = answers;
    setDirty(true);
  }, [answers]);

  const saveNow = useCallback(async (): Promise<ActionState> => {
    const current = answersRef.current;
    const hasAnswers = Object.entries(current).some(
      ([, response]) => !isBlank(response),
    );
    if (!hasAnswers) {
      setDirty(false);
      return IDLE_ACTION_STATE;
    }

    // Snapshot of what we'd send, for dirty comparison
    const payloadMap: Record<string, JsonValue> = Object.fromEntries(
      Object.entries(current).filter(([, response]) => !isBlank(response)),
    );
    if (JSON.stringify(payloadMap) === JSON.stringify(snapshotRef.current)) {
      return IDLE_ACTION_STATE;
    }

    setSaving(true);
    try {
      const result = await saveAnswersAction(
        IDLE_ACTION_STATE,
        toFormData(attemptId, current),
      );
      if (result.status === "success") {
        snapshotRef.current = { ...payloadMap };
        setLastSaved(new Date());
        setDirty(false);
      } else {
        toast.error(result.message || "Could not save your progress.");
      }
      return result;
    } catch {
      toast.error("Could not save your progress.");
      return IDLE_ACTION_STATE;
    } finally {
      setSaving(false);
    }
  }, [attemptId]);

  useEffect(() => {
    if (!dirty) return;
    const handle = setInterval(() => void saveNow(), intervalMs);
    return () => clearInterval(handle);
  }, [dirty, saveNow, intervalMs]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const markClean = useCallback(() => {
    setDirty(false);
    const current = answersRef.current;
    snapshotRef.current = Object.fromEntries(
      Object.entries(current).filter(([, response]) => !isBlank(response)),
    );
  }, []);

  return { dirty, saving, lastSaved, saveNow, markClean };
}
