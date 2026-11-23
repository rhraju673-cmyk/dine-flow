import { Armchair, ClipboardList, Clock, Info, LayoutDashboard, QrCode, Settings, Star, UtensilsCrossed } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useI18n } from '../../contexts/I18nContext';
import { SectionHeading } from '../ui/SectionHeading';

/**
 * Marketing preview of the dashboard. Everything here is ILLUSTRATIVE
 * SAMPLE DATA and is clearly labelled as such — it is never shown inside
 * a real restaurant's dashboard.
 */
const sampleHourly = [
  { h: '11', v: 6 }, { h: '12', v: 18 }, { h: '13', v: 27 }, { h: '14', v: 19 }, { h: '15', v: 9 },
  { h: '16', v: 8 }, { h: '17', v: 14 }, { h: '18', v: 24 }, { h: '19', v: 38 }, { h: '20', v: 44 },
  { h: '21', v: 35 }, { h: '22', v: 17 },
];

const sampleOrders = [
  { id: '#1042', table: 7, dish: 'biryani', status: 'cooking' },
  { id: '#1041', table: 3, dish: 'curry', status: 'ready' },
  { id: '#1040', table: 12, dish: 'bowl', status: 'new' },
  { id: '#1039', table: 5, dish: 'biryani', status: 'served' },
] as const;

const statusStyle: Record<string, string> = {
  new: 'bg-info/12 text-info',
  cooking: 'bg-warning/12 text-warning',
  ready: 'bg-success/12 text-success',
  served: 'bg-white/5 text-muted',
};

export function ProductPreview() {
  const { t } = useI18n();
  const kpis = [
    { label: t('preview.kpi.orders'), value: '128', icon: ClipboardList },
    { label: t('preview.kpi.tables'), value: '14 / 22', icon: Armchair },
    { label: t('preview.kpi.prep'), value: '12m', icon: Clock },
    { label: t('preview.kpi.rating'), value: '4.8', icon: Star },
  ];

  return (
    <section id="product-preview" className="relative scroll-mt-24 overflow-x-clip py-24">
      <div className="container-page">
        <SectionHeading eyebrow={t('preview.eyebrow')} title={t('preview.title')} description={t('preview.description')} />

        <div className="relative mx-auto mt-14 max-w-6xl">
          <div className="absolute -inset-x-10 -top-10 -bottom-10 -z-10 rounded-[3rem] bg-[radial-gradient(ellipse_at_top,rgba(242,140,56,0.16),transparent_60%)]" />

          {/* Browser frame */}
          <div className="overflow-hidden rounded-2xl border border-line bg-bg-2 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <div className="flex gap-1.5">
                <span className="size-3 rounded-full bg-[#ff5f57]/80" />
                <span className="size-3 rounded-full bg-[#febc2e]/80" />
                <span className="size-3 rounded-full bg-[#28c840]/80" />
              </div>
              <div className="mx-auto hidden rounded-md bg-card px-24 py-1 text-xs text-subtle sm:block">app.dineflow · Zaika Restaurant</div>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-[11px] font-medium text-warning">
                <Info className="size-3" />
                {t('common.sampleData')}
              </span>
            </div>

            <div className="grid md:grid-cols-[200px_1fr]">
              <aside className="hidden border-r border-line p-4 md:block" aria-hidden>
                {[LayoutDashboard, ClipboardList, UtensilsCrossed, QrCode, Settings].map((Icon, i) => (
                  <div
                    key={i}
                    className={`mb-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs ${i === 0 ? 'bg-brand/12 text-brand-2' : 'text-subtle'}`}
                  >
                    <Icon className="size-4" />
                    <span className="h-2 rounded-full bg-current opacity-40" style={{ width: `${60 - i * 6}%` }} />
                  </div>
                ))}
              </aside>

              <div className="space-y-4 p-4 sm:p-6">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {kpis.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-xl border border-line bg-card p-4">
                      <div className="flex items-center justify-between text-xs text-muted">
                        {label}
                        <Icon className="size-4 text-brand-2/80" />
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-fg">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                  <div className="rounded-xl border border-line bg-card p-4">
                    <p className="text-sm font-medium text-fg">{t('preview.chart')}</p>
                    <div className="mt-3 h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sampleHourly} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="previewFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#F28C38" stopOpacity={0.45} />
                              <stop offset="100%" stopColor="#F28C38" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="#263247" strokeDasharray="3 6" vertical={false} />
                          <XAxis dataKey="h" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(h) => `${h}:00`} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip
                            cursor={{ stroke: '#33415a' }}
                            contentStyle={{ background: '#151D2D', border: '1px solid #263247', borderRadius: 12, fontSize: 12 }}
                            labelStyle={{ color: '#94A3B8' }}
                            labelFormatter={(h) => `${h}:00`}
                          />
                          <Area type="monotone" dataKey="v" name={t('preview.kpi.orders')} stroke="#FFB15C" strokeWidth={2.5} fill="url(#previewFill)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-xl border border-line bg-card p-4">
                    <p className="text-sm font-medium text-fg">{t('preview.live')}</p>
                    <ul className="mt-3 divide-y divide-line">
                      {sampleOrders.map((o) => (
                        <li key={o.id} className="flex items-center gap-3 py-2.5 text-sm">
                          <span className="w-12 font-mono text-xs text-subtle">{o.id}</span>
                          <span className="flex-1 truncate text-fg">{t(`qr.phone.dishes.${o.dish}`)}</span>
                          <span className="text-xs text-muted">T{o.table}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyle[o.status]}`}>
                            {t(`preview.status.${o.status}`)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-subtle">{t('preview.label')}</p>
        </div>
      </div>
    </section>
  );
}
