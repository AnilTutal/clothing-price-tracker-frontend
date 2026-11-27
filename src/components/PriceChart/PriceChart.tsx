import { PricePoint } from '../../services/api';
import './PriceChart.scss';

interface Props {
  points: PricePoint[];
}

const W = 600;
const H = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 64 };

const formatPrice = (p: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(p);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });

const PriceChart = ({ points }: Props) => {
  if (points.length === 0) return null;

  const times = points.map((p) => new Date(p.date).getTime());
  const prices = points.map((p) => p.price);
  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const rangeP = maxP - minP || 1;
  const rangeT = maxT - minT || 1;

  const x = (t: number) =>
    points.length === 1 ? W / 2 : PAD.left + ((t - minT) / rangeT) * (W - PAD.left - PAD.right);
  const y = (p: number) => PAD.top + (1 - (p - minP) / rangeP) * (H - PAD.top - PAD.bottom);

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(new Date(p.date).getTime()).toFixed(1)},${y(p.price).toFixed(1)}`)
    .join(' ');

  const yTicks = [minP, (minP + maxP) / 2, maxP];

  return (
    <svg className="price-chart" viewBox={`0 0 ${W} ${H}`} role="img">
      {yTicks.map((tick) => (
        <g key={tick}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} className="grid" />
          <text x={PAD.left - 8} y={y(tick) + 4} textAnchor="end" className="label">
            {formatPrice(tick)}
          </text>
        </g>
      ))}

      <text x={PAD.left} y={H - 8} className="label">{formatDate(points[0].date)}</text>
      <text x={W - PAD.right} y={H - 8} textAnchor="end" className="label">
        {formatDate(points[points.length - 1].date)}
      </text>

      <path d={path} className="line" />
      {points.map((p) => (
        <circle key={p.date} cx={x(new Date(p.date).getTime())} cy={y(p.price)} r={3.5} className="dot">
          <title>{`${formatDate(p.date)} — ${formatPrice(p.price)}`}</title>
        </circle>
      ))}
    </svg>
  );
};

export default PriceChart;
