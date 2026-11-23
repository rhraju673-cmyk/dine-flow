import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { brand } from '../../config/brand';
import { useI18n } from '../../contexts/I18nContext';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Feedback';
import { Input, Textarea } from '../ui/Field';
import { SectionHeading } from '../ui/SectionHeading';

/**
 * Contact section. The form opens the visitor's email app with a
 * pre-filled message to brand.contact.email (no backend needed).
 * A server-side contact endpoint can be added in a later phase.
 */
export function Contact() {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: '', email: '', restaurant: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = t('errors.required');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = t('errors.invalid');
    if (form.message.trim().length < 5) next.message = t('errors.required');
    setErrors(next);
    if (Object.keys(next).length) return;

    const subject = t('contact.form.subject', { name: form.name.trim() });
    const body = `${form.message.trim()}\n\n— ${form.name.trim()}\n${form.email.trim()}${form.restaurant ? `\n${form.restaurant.trim()}` : ''}`;
    window.location.href = `mailto:${brand.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const update = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const details = [
    { icon: Mail, label: t('contact.details.email'), value: brand.contact.email, href: `mailto:${brand.contact.email}` },
    { icon: Phone, label: t('contact.details.phone'), value: brand.contact.phone, href: `tel:${brand.contact.phone.replace(/[^+\d]/g, '')}` },
    { icon: MapPin, label: t('contact.details.address'), value: brand.contact.address },
    { icon: Clock, label: t('contact.details.hours'), value: t('contact.details.hoursValue') },
  ];

  return (
    <section id="contact" className="scroll-mt-24 py-24">
      <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionHeading align="left" eyebrow={t('contact.eyebrow')} title={t('contact.title')} description={t('contact.description')} />
          <dl className="mt-10 space-y-5">
            {details.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-card text-brand-2">
                  <Icon className="size-5" />
                </span>
                <div>
                  <dt className="text-xs tracking-wide text-subtle uppercase">{label}</dt>
                  <dd className="mt-0.5 text-fg">
                    {href ? (
                      <a href={href} className="hover:text-brand-2">
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <form onSubmit={submit} noValidate className="card space-y-5 p-6 sm:p-8">
          {Object.keys(errors).length > 0 && <Alert>{t('errors.fixFields')}</Alert>}
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label={t('contact.form.name')} value={form.name} onChange={update('name')} error={errors.name} autoComplete="name" required />
            <Input label={t('contact.form.email')} type="email" value={form.email} onChange={update('email')} error={errors.email} autoComplete="email" required />
          </div>
          <Input label={t('contact.form.restaurant')} value={form.restaurant} onChange={update('restaurant')} optional autoComplete="organization" />
          <Textarea label={t('contact.form.message')} value={form.message} onChange={update('message')} error={errors.message} rows={5} required />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-subtle">{t('contact.form.note')}</p>
            <Button type="submit" icon={<Send className="size-4" />}>
              {t('contact.form.submit')}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
