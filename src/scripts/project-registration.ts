import type copyType from '../../data/registration-copy.json';
import {
  readTranscript,
  validInstitutionalEmail
} from '../lib/registration-validation';
import { submitToGoogle } from '../lib/registration-transport';

type Config = {
  endpoint: string;
  project: string;
  term: string;
  maxPdfBytes: number;
  privacyVersion: string;
  copy: typeof copyType;
};

for (const form of document.querySelectorAll<HTMLFormElement>(
  '[data-registration-form]'
)) {
  const config: Config = JSON.parse(form.dataset.config!);
  const name = form.elements.namedItem('name') as HTMLInputElement;
  const email = form.elements.namedItem('email') as HTMLInputElement;
  const transcript = form.elements.namedItem('transcript') as HTMLInputElement;
  const interest = form.elements.namedItem('interest') as HTMLTextAreaElement;
  const acknowledgment = form.elements.namedItem(
    'acknowledgment'
  ) as HTMLInputElement;
  const website = form.elements.namedItem('website') as HTMLInputElement;
  const fieldset = form.querySelector('fieldset')!;
  const status = form.querySelector<HTMLElement>('[data-registration-status]')!;
  let requestId = crypto.randomUUID();
  let busy = false;
  let submitted = false;
  const validateFields = () => {
    name.setCustomValidity(
      /^\S+\s+\S/.test(name.value.trim()) ? '' : config.copy.errors.name
    );
    email.setCustomValidity(
      validInstitutionalEmail(email.value) ? '' : config.copy.errors.email
    );
    interest.setCustomValidity(
      interest.value.trim().length >= 20 ? '' : config.copy.errors.interest
    );
  };
  form.addEventListener('input', () => {
    validateFields();
    transcript.setCustomValidity('');
    // Um envio idêntico mantém o protocolo; dados editados iniciam outra inscrição.
    requestId = crypto.randomUUID();
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy || submitted) return;
    validateFields();
    if (!form.reportValidity()) return;
    busy = true;
    fieldset.disabled = true;
    status.textContent = config.copy.sending;
    status.dataset.state = 'pending';
    form.setAttribute('aria-busy', 'true');
    try {
      const file = await readTranscript(
        transcript.files?.[0],
        config.maxPdfBytes
      );
      const result = await submitToGoogle(
        config.endpoint,
        config.copy.bridgeTitle,
        {
          requestId,
          project: config.project,
          term: config.term,
          name: name.value.trim(),
          email: email.value.trim().toLowerCase(),
          interest: interest.value.trim(),
          acknowledgment: acknowledgment.checked,
          privacyVersion: config.privacyVersion,
          website: website.value,
          file
        }
      );
      if (!result.ok) throw new Error(result.code);
      submitted = true;
      form.reset();
      status.dataset.state = 'success';
      status.textContent = config.copy.success.replace(
        '{protocol}',
        result.protocol
      );
    } catch (error) {
      const key = error instanceof Error ? error.message : 'retry';
      status.dataset.state = 'error';
      status.textContent = Object.hasOwn(config.copy.errors, key)
        ? config.copy.errors[key as keyof typeof config.copy.errors]
        : config.copy.errors.retry;
    } finally {
      busy = false;
      fieldset.disabled = submitted;
      form.removeAttribute('aria-busy');
      status.focus();
    }
  });
  // Só liberar depois de instalar o envio: sem JavaScript, dados não vão para a URL.
  fieldset.disabled = false;
  form.querySelector<HTMLElement>('[data-registration-offline]')!.hidden = true;
}
