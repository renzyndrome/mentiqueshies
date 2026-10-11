import { AppMark } from '../../components/AppMark';

/** Logo plus "Quest Respond", with the Live badge while the question is open. */
export function PhoneTopBar({ live }: { readonly live: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <AppMark />
      {live ? (
        <span className="chip-label inline-flex items-center gap-1.5 rounded-pill bg-red-100 px-3 py-[7px] tracking-[0.08em] text-red-700">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-red-500" />
          Live
        </span>
      ) : null}
    </div>
  );
}
