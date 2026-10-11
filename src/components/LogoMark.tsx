export function LogoMark({ size, className = '' }: { readonly size: number; readonly className?: string }) {
  return (
    <img
      src="/logo-mark.png"
      alt="Quest Laguna"
      width={size}
      height={size}
      className={`shrink-0 rounded-full ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
