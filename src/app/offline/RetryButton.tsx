"use client";

export default function RetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="mt-6 rounded-lg bg-brand-gradient px-6 py-2 text-white hover:brightness-110"
    >
      Try again
    </button>
  );
}
