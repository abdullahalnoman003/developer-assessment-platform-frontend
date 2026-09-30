"use client";

export default function RootError({ reset }: { reset: () => void }) {
  return (
    <main>
      <h1>Something went wrong</h1>
      <p>TODO: surface the API message and a retry button.</p>
      <button type="button" onClick={() => reset()}>
        Retry
      </button>
    </main>
  );
}
