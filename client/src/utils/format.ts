export function formatDate(value: string | Date, locale: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale, options ?? { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(value),
  );
}

export function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

/** Localised country name, e.g. "BD" → "Bangladesh" / "বাংলাদেশ". */
export function countryName(code: string, locale: string) {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** All real ISO country codes, sorted by localised name. */
export function countryOptions(locale: string) {
  const names = new Intl.DisplayNames([locale], { type: 'region', fallback: 'none' });
  const english = new Intl.DisplayNames(['en'], { type: 'region', fallback: 'none' });
  const out: { code: string; name: string }[] = [];
  for (let a = 65; a <= 90; a++) {
    for (let b = 65; b <= 90; b++) {
      const code = String.fromCharCode(a, b);
      if (code === 'ZZ' || code === 'AA' || code.startsWith('X') || code.startsWith('Q')) continue;
      const en = english.of(code);
      if (!en || en === code || /unknown/i.test(en)) continue;
      out.push({ code, name: names.of(code) ?? en });
    }
  }
  return out.sort((x, y) => x.name.localeCompare(y.name, locale));
}

export function currencyOptions(locale: string) {
  const names = new Intl.DisplayNames([locale], { type: 'currency' });
  return Intl.supportedValuesOf('currency').map((code) => ({ code, name: `${code} — ${names.of(code) ?? code}` }));
}

export function timezoneOptions() {
  return Intl.supportedValuesOf('timeZone');
}

/** Time of day greeting key. */
export function greetingKey(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
