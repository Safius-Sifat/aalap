type AvatarProps = {
  src?: string | null;
  name?: string | null;
  size?: number;
  online?: boolean;
};

export function Avatar({ src, name, size = 40, online = false }: AvatarProps) {
  const initials =
    name
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? 'U';

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {src ? (
        <img
          src={src}
          alt={name ?? 'avatar'}
          className="h-full w-full rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--wa-green-dark)] text-sm font-semibold text-white">
          {initials}
        </div>
      )}
      {online ? (
        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-[var(--wa-panel-dark)] bg-[var(--wa-green)]" />
      ) : null}
    </div>
  );
}
