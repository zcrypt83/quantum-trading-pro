<!-- src/trading-ui/Dashboard.jsx -->
import { useWebSocket } from 'react-use-websocket';
import { Chart } from 'react-tradingview-embed';

const InstitutionalDashboard = () => {
  const { lastMessage } = useWebSocket('wss://api.quantumtrading.pro/market-data', {
    shouldReconnect: () => true,
  });

  const executeAlgorithmicTrade = async (strategy) => {
    const response = await fetch('/api/v1/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.REACT_APP_TRADING_KEY
      },
      body: JSON.stringify({
        symbol: 'BTC-USDT',
        strategy: strategy.id,
        amount: strategy.size,
        leverage: 100
      })
    });
    return response.json();
  };

  return (
    <div className="institutional-grid">
      <Chart widgetConfig={{
        symbol: 'BINANCE:BTCUSDT',
        interval: '1',
        theme: 'dark',
        allow_symbol_change: false,
        details: true,
        hotlist: true
      }} />
      
      <OrderBookComponent data={lastMessage} />
      <RiskManagementPanel />
      <CollabVideoConference />
    </div>
  );
};