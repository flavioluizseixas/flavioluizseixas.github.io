export type RegistrationResult =
  { ok: true; protocol: string } | { ok: false; code: string };

export function isGoogleScriptOrigin(origin: string) {
  try {
    const url = new URL(origin);
    return (
      url.protocol === 'https:' &&
      !url.port &&
      (url.hostname === 'script.google.com' ||
        url.hostname === 'script.googleusercontent.com' ||
        url.hostname.endsWith('-script.googleusercontent.com') ||
        url.hostname.endsWith('.script.googleusercontent.com'))
    );
  } catch {
    return false;
  }
}

// A conexão usa o HtmlService para obter uma resposta legível entre origens.
// Não usamos fetch no-cors, que não permite confirmar a gravação.
export function submitToGoogle(
  endpoint: string,
  title: string,
  payload: unknown,
  timeoutMs = 90000
): Promise<RegistrationResult> {
  return new Promise((resolve, reject) => {
    const channel = crypto.randomUUID();
    const id = crypto.randomUUID();
    const iframe = document.createElement('iframe');
    iframe.hidden = true;
    iframe.title = title;
    iframe.referrerPolicy = 'no-referrer';
    const url = new URL(endpoint);
    url.searchParams.set('origin', location.origin);
    url.searchParams.set('channel', channel);
    let source: MessageEventSource | null = null;
    let pinnedOrigin = '';
    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener('message', receive);
      iframe.remove();
    };
    const receive = (event: MessageEvent) => {
      const message = event.data;
      if (
        !isGoogleScriptOrigin(event.origin) ||
        !event.source ||
        !message ||
        message.channel !== channel
      )
        return;
      if (message.type === 'registration:ready' && !source) {
        source = event.source;
        pinnedOrigin = event.origin;
        (source as Window).postMessage(
          { type: 'registration:submit', channel, id, payload },
          pinnedOrigin
        );
        return;
      }
      if (
        event.source !== source ||
        event.origin !== pinnedOrigin ||
        message.type !== 'registration:result' ||
        message.id !== id
      )
        return;
      const result = message.result;
      if (
        !result ||
        (result.ok !== true && result.ok !== false) ||
        (result.ok &&
          (typeof result.protocol !== 'string' ||
            !/^EXT-[a-f0-9-]{36}$/.test(result.protocol))) ||
        (!result.ok && typeof result.code !== 'string')
      )
        return;
      cleanup();
      resolve(result);
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('retry'));
    }, timeoutMs);
    window.addEventListener('message', receive);
    iframe.src = url.toString();
    document.body.append(iframe);
  });
}
