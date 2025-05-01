// src/application/core/store/tradingSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface TradingState {
  positions: Position[];
  orders: Order[];
  marketData: MarketSnapshot;
}

const initialState: TradingState = {
  positions: [],
  orders: [],
  marketData: {}
};

export const fetchInitialData = createAsyncThunk(
  'trading/initialize',
  async () => {
    const [positions, orders] = await Promise.all([
      api.getPositions(),
      api.getOpenOrders()
    ]);
    return { positions, orders };
  }
);

const tradingSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    updateMarketData(state, action) {
      state.marketData = mergeMarketData(state.marketData, action.payload);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchInitialData.fulfilled, (state, action) => {
      state.positions = action.payload.positions;
      state.orders = action.payload.orders;
    });
  }
});

// Selectores optimizados
export const selectPositions = createSelector(
  (state: RootState) => state.trading.positions,
  (positions) => calculateExposure(positions)
);