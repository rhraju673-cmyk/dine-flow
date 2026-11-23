import { useState } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { ApiError } from '../services/api';

/**
 * Handles form errors from the API:
 *   fieldErrors → shown under each input
 *   formError   → shown in an alert above the form
 */
export function useFormErrors() {
  const { t } = useI18n();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function handleError(err: unknown) {
    if (err instanceof ApiError) {
      setFieldErrors(err.fields);
      if (err.code === 'NETWORK_ERROR') setFormError(t('errors.network'));
      else if (Object.keys(err.fields).length > 0) setFormError(t('errors.fixFields'));
      else setFormError(err.message);
    } else {
      setFormError(t('errors.generic'));
    }
  }

  function clear() {
    setFieldErrors({});
    setFormError(null);
  }

  return { fieldErrors, formError, setFieldErrors, setFormError, handleError, clear };
}
