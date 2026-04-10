export default function AppHomePage() {
  return (
    <main className="flex h-full flex-1 items-center justify-center bg-[var(--wa-bg-dark)]">
      <div className="max-w-md rounded-2xl border border-[#2A3942] bg-[#111B21] p-8 text-center">
        <h1 className="text-2xl font-semibold text-white">Aalap Web</h1>
        <p className="mt-2 text-sm text-[var(--wa-text-secondary)]">
          Select a conversation from the sidebar to start messaging.
        </p>
      </div>
    </main>
  );
}
