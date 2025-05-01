import { useOrderBook } from '../api/useOrderBook';
import { OrderRow, SpreadIndicator } from './OrderBookComponents';
import { VirtualizedList } from '@lib/performance';

const OrderBook: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { bids, asks, spread } = useOrderBook(symbol);
  const theme = useTheme();
  
  return (
    <div className="order-book-grid">
      <VirtualizedList
        data={bids}
        renderItem={(bid) => (
          <OrderRow 
            {...bid}
            type="bid"
            theme={theme}
          />
        )}
        itemHeight={24}
        overscan={20}
      />
      
      <SpreadIndicator value={spread} />
      
      <VirtualizedList
        data={asks}
        renderItem={(ask) => (
          <OrderRow
            {...ask}
            type="ask"
            theme={theme}
          />
        )}
        itemHeight={24}
        overscan={20}
      />
    </div>
  );
};