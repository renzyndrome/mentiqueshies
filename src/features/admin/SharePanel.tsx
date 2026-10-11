import { useState } from 'react';
import { copyText } from '../../lib/copyText';
import { buildShareLinks } from './shareLinks';
import type { ShareLink } from './shareLinks';

type CopyState = { readonly id: ShareLink['id']; readonly ok: boolean } | null;

/** Links to hand to the projector operator and to anyone sharing the phone page. */
export function SharePanel({ publicUrl }: { readonly publicUrl: string }) {
  const [copied, setCopied] = useState<CopyState>(null);
  const links = buildShareLinks(publicUrl);

  const copy = async (link: ShareLink) => {
    const ok = await copyText(link.url);
    setCopied({ id: link.id, ok });
  };

  return (
    <section aria-labelledby="share-heading" className="admin-card">
      <h2 id="share-heading" className="font-wordmark text-base leading-[1.3] font-semibold">
        Share links
      </h2>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.id} className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-fg-default">{link.label}</span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                readOnly
                aria-label={`${link.label} link`}
                value={link.url}
                onFocus={(event) => event.target.select()}
                className="field min-w-0 flex-1 text-sm"
              />
              <button
                type="button"
                className="btn-outline"
                aria-label={`Copy ${link.label} link`}
                onClick={() => void copy(link)}
              >
                Copy
              </button>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="btn-outline">
                Open
              </a>
            </div>
            {copied?.id === link.id ? (
              <span role="status" className="text-xs font-semibold text-fg-faint">
                {copied.ok ? 'Copied.' : 'Copy blocked. Select the link and copy it.'}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
