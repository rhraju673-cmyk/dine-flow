/**
 * Translation registry.
 * To add a language: create locales/<code>.json, import it here, add it to
 * `dictionaries`, and list it in src/config/app.ts → languages.
 */
import type { LanguageCode } from '../config/app';
import bn from './locales/bn.json';
import en from './locales/en.json';
import hi from './locales/hi.json';

type Dict = Record<string, unknown>;

export const dictionaries: Record<LanguageCode, Dict> = { en, bn, hi };

/** Locale used for number/date formatting per language. */
export const intlLocale: Record<LanguageCode, string> = { en: 'en-US', bn: 'bn-BD', hi: 'hi-IN' };

/** Reads "a.b.c" from a nested object. */
export function lookup(dict: Dict, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object') return (node as Dict)[part];
    return undefined;
  }, dict);
}

/** Replaces {name} placeholders with values. */
export function interpolate(text: string, vars?: Record<string, string | number>) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}
