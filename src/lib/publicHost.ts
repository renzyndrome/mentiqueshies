/** "https://mentiqueshie.questlaguna.org" becomes "mentiqueshie.questlaguna.org". */
export function publicHost(publicUrl: string | undefined): string {
  if (publicUrl) {
    try {
      return new URL(publicUrl).host;
    } catch {
      // Fall through to the current host.
    }
  }
  return typeof window === 'undefined' ? '' : window.location.host;
}
