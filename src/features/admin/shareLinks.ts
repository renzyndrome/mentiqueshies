export interface ShareLink {
  readonly id: 'screen' | 'answer';
  readonly label: string;
  readonly url: string;
}

/** Links the media team hands to others. Built from the public site address. */
export function buildShareLinks(publicUrl: string): readonly ShareLink[] {
  const base = publicUrl.replace(/\/+$/, '');
  return [
    { id: 'screen', label: 'Big screen', url: `${base}/screen` },
    { id: 'answer', label: 'Phone answer page', url: `${base}/answer` },
  ];
}
