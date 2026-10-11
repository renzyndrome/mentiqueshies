import { AppMark } from '../../components/AppMark';

export function LoadingView() {
  return (
    <main className="phone-shell bg-white" aria-busy="true">
      <AppMark />
      <p className="mt-12 text-[15px] text-fg-faint">Loading.</p>
    </main>
  );
}
