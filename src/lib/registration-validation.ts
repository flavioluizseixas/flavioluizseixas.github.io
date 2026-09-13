export function validInstitutionalEmail(value: string) {
  return (
    value.length <= 254 &&
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@id\.uff\.br$/i.test(
      value.trim()
    )
  );
}

export async function readTranscript(file: File | undefined, maxBytes: number) {
  if (
    !file ||
    file.size < 20 ||
    file.size > maxBytes ||
    !/\.pdf$/i.test(file.name) ||
    (file.type && file.type !== 'application/pdf')
  )
    throw new Error('pdf');
  const header = await file.slice(0, 8).text();
  const tail = await file.slice(Math.max(0, file.size - 1024)).text();
  if (!/^%PDF-(1\.[0-7]|2\.0)/.test(header) || !/%%EOF\s*$/.test(tail))
    throw new Error('pdf');
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('pdf'));
    reader.readAsDataURL(file);
  });
  return { name: file.name, type: file.type, base64 };
}
