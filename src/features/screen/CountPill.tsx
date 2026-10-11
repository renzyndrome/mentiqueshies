/** Outlined pill with a gold dot, a number and a label (ScreenCloud.dc.html, top right). */
export function CountPill({ count, label }: { readonly count: number; readonly label: string }) {
  return (
    <div className="flex shrink-0 items-center gap-3.5 rounded-pill border border-white/[0.18] px-[26px] py-4">
      <span aria-hidden="true" className="size-3 rounded-full bg-gold-500" />
      <span className="font-wordmark text-[28px] leading-none font-semibold text-white">{count}</span>
      <span className="text-[20px] leading-none font-medium text-fg-muted">{label}</span>
    </div>
  );
}
