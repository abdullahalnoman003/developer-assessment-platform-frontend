"use client";

export default function PublicError({ reset }: { reset: () => void }) {
  return (
    <main>
      <h1>Public page failed to load</h1>
      <p>TODO: surface the API message and a retry button.</p>
      <button type="button" onClick={() => reset()}>
        Retry
      </button>
    </main>
  );
}
