import { Link } from '@tanstack/react-router';
import { Lockup } from './Lockup';

export function NotFound() {
  return (
    <main className="phone-shell gap-6">
      <Lockup />
      <h1 className="mt-10 font-wordmark text-[28px] leading-[1.25] font-semibold">Page not found.</h1>
      <Link to="/" className="text-link">
        Back to start
      </Link>
    </main>
  );
}
