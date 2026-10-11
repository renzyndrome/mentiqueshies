import { LogoMark } from '../../components/LogoMark';

const linkClass =
  'flex min-h-11 items-center rounded-pill px-3.5 text-sm font-semibold text-fg-muted transition-colors duration-200 hover:text-white';

export function AdminSidebar({ onSignOut }: { readonly onSignOut: () => void }) {
  return (
    <nav
      aria-label="Admin"
      data-theme="dark"
      className="flex w-full flex-col gap-6 bg-ink-800 px-5 py-6 text-white md:sticky md:top-0 md:h-dvh md:w-60 md:shrink-0 md:gap-7 md:py-7"
    >
      <div className="flex items-center gap-3">
        <LogoMark size={34} />
        <div className="flex flex-col gap-[3px]">
          <div className="font-wordmark text-[15px] leading-none font-semibold">Quest Respond</div>
          <div className="font-wordmark text-[9px] leading-none font-semibold tracking-[0.26em] text-red-300">ADMIN</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 md:flex-col">
        <span aria-current="page" className="flex min-h-11 items-center rounded-pill bg-red-500 px-3.5 text-sm font-semibold">
          Presenter
        </span>
        <a href="/screen" target="_blank" rel="noopener noreferrer" className={linkClass}>
          Open screen
        </a>
        <a href="/" target="_blank" rel="noopener noreferrer" className={linkClass}>
          Open join page
        </a>
      </div>
      <button type="button" onClick={onSignOut} className={`${linkClass} md:mt-auto`}>
        Sign out
      </button>
    </nav>
  );
}
