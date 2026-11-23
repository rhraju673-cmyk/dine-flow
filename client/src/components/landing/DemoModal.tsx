import { PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

/**
 * "Explore Demo" dialog.
 * In development it opens the seeded Zaika demo account.
 * In production (no demo account) it scrolls to the product preview instead.
 */
export function DemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const isDev = import.meta.env.DEV;

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<PlayCircle className="size-5" />}
      title={t('demo.title')}
      description={isDev ? t('demo.body') : t('demo.prodBody')}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          {isDev ? (
            <Button onClick={() => navigate('/login?demo=1')}>{t('demo.devCta')}</Button>
          ) : (
            <Button
              onClick={() => {
                onClose();
                document.getElementById('product-preview')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t('demo.prodCta')}
            </Button>
          )}
        </>
      }
    >
      {isDev && <p className="rounded-lg border border-line bg-bg-2 px-3 py-2 text-xs text-subtle">{t('demo.devNote')}</p>}
    </Modal>
  );
}
