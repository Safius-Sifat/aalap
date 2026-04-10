type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search chats or people"
      className="w-full rounded-lg border border-[#2A3942] bg-[#111B21] px-3 py-2 text-sm text-white outline-none focus:border-[var(--wa-green)]"
    />
  );
}
