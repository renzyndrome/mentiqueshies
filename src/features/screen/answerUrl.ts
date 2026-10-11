/** Phone answer page address, built from the public site address. */
export function answerUrl(publicUrl: string): string {
  return `${publicUrl.replace(/\/+$/, '')}/answer`;
}
