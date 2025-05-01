// src/lib/charts/TradingChart.tsx
import { createChart } from 'lightweight-charts';

const TradingChart = ({ data }: { data: CandleData[] }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<ChartType | null>(null);

  useEffect(() => {
    if (chartRef.current && !chart) {
      const newChart = createChart(chartRef.current, {
        width: 1200,
        height: 600,
        layout: {
          background: { color: '#1a1a1a' },
          textColor: '#D9D9D9'
        },
        grid: {
          vertLines: { color: '#363636' },
          horzLines: { color: '#363636' }
        }
      });
      
      const candleSeries = newChart.addCandlestickSeries();
      candleSeries.setData(data);
      
      setChart(newChart);
    }

    return () => chart?.remove();
  }, []);

  return <div ref={chartRef} className="trading-chart" />;
};