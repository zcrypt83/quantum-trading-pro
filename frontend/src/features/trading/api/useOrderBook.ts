import { useWebSocket } from 'react-use-websocket';
import { OrderBookData, OrderBookUpdate } from '../types';
import { throttle } from '@lib/utils/performance';
import { processOrderBookUpdate } from '@lib/utils/trading';

export const useOrderBook = (symbol: string) => {
  const [orderBook, setOrderBook] = useState<OrderBookData>({ bids: [], asks: [] });
  const { lastMessage } = useWebSocket(
    `${config.api.websocket}/orderbook/${symbol}`, 
    { shouldReconnect: () => true }
  );

  const throttledUpdate = useMemo(() => throttle((update: OrderBookUpdate) => {
    setOrderBook(prev => processOrderBookUpdate(prev, update));
  }, config.optimization.throttleRates.orderBook), []);

  useEffect(() => {
    if (lastMessage) {
      const update = JSON.parse(lastMessage.data) as OrderBookUpdate;
      throttledUpdate(update);
    }
  }, [lastMessage]);

  const spread = useMemo(() => 
    calculateSpread(orderBook.bids[0]?.[0], orderBook.asks[0]?.[0]), 
    [orderBook]
  );

  return { bids: orderBook.bids, asks: orderBook.asks, spread };
};