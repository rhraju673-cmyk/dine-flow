import { useEffect } from 'react';
import { brand } from '../config/brand';

/** Sets the browser tab title: "Overview · DineFlow". */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${brand.name}` : `${brand.name}`;
  }, [title]);
}
