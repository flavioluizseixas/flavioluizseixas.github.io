import { matchesProject, resultCount } from '../lib/extension-projects';

const catalog = document.querySelector<HTMLElement>('[data-project-catalog]');
if (catalog) {
  const form = catalog.querySelector<HTMLFormElement>('form')!;
  const fields = ['q', 'status', 'modalidade', 'area'].map(
    (name) =>
      form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement
  );
  const cards = [
    ...catalog.querySelectorAll<HTMLElement>('[data-project]')
  ].map((element) => ({
    element,
    search: element.dataset.search!,
    status: element.dataset.status!,
    area: JSON.parse(element.dataset.area!) as string[],
    modalidade: JSON.parse(element.dataset.modalidade!) as string[]
  }));
  const count = catalog.querySelector<HTMLElement>('[data-result-count]')!;
  const empty = catalog.querySelector<HTMLElement>('[data-project-empty]')!;

  const applyFilters = (syncUrl = true) => {
    const [query, status, modalidade, area] = fields.map(
      (field) => field.value
    );
    let matches = 0;
    for (const card of cards) {
      const visible = matchesProject(card, { query, status, modalidade, area });
      card.element.hidden = !visible;
      if (visible) matches++;
    }
    count.textContent = resultCount(matches);
    empty.hidden = matches !== 0;
    if (syncUrl) {
      const url = new URL(window.location.href);
      for (const field of fields) {
        if (field.value.trim())
          url.searchParams.set(field.name, field.value.trim());
        else url.searchParams.delete(field.name);
      }
      window.history.replaceState(null, '', url);
    }
  };
  const readUrl = () => {
    const params = new URLSearchParams(window.location.search);
    for (const field of fields) {
      field.value = params.get(field.name) || '';
      if (field instanceof HTMLSelectElement && field.selectedIndex < 0)
        field.value = '';
    }
    applyFilters(false);
  };
  const clear = () => {
    fields.forEach((field) => {
      field.value = '';
    });
    applyFilters();
    fields[0].focus();
  };
  form.addEventListener('input', () => applyFilters());
  form.addEventListener('change', () => applyFilters());
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    applyFilters();
  });
  form.addEventListener('reset', (event) => {
    event.preventDefault();
    clear();
  });
  catalog
    .querySelector('[data-clear-projects]')!
    .addEventListener('click', clear);
  window.addEventListener('popstate', readUrl);
  readUrl();
  form.hidden = cards.length === 0;
}
