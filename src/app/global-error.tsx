"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <h1>Something went wrong</h1>
        <p>TODO: last-resort error screen.</p>
        <button type="button" onClick={() => reset()}>
          Try again
        </button>
      </body>
    </html>
  );
}
