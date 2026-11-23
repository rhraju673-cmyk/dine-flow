import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

/** Ring chart showing a real percentage (e.g. setup progress). */
export function SetupRadial({ percent, label }: { percent: number; label: string }) {
  return (
    <div className="relative size-36 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="78%" outerRadius="100%" data={[{ value: percent }]} startAngle={90} endAngle={-270}>
          <defs>
            <linearGradient id="setupGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFB15C" />
              <stop offset="100%" stopColor="#F28C38" />
            </linearGradient>
          </defs>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={20} fill="url(#setupGradient)" background={{ fill: '#1a2436' }} isAnimationActive />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-display text-3xl font-semibold text-fg">{percent}%</p>
          <p className="text-[11px] text-subtle">{label}</p>
        </div>
      </div>
    </div>
  );
}
