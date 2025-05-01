import { Portfolio } from '@shared/types';
import { influx } from '@shared/libs/db';
import { TechnicalAnalysis } from '@shared/libs/quant';

export class ValueAtRiskCalculator {
  private readonly CONFIDENCE_LEVEL = 0.95;
  private readonly LOOKBACK_PERIOD = 252; // 1 trading year

  async calculateHistoricalVaR(portfolio: Portfolio): Promise<number> {
    const query = `
      SELECT stddev(returns) as volatility 
      FROM market_returns 
      WHERE time > now() - ${this.LOOKBACK_PERIOD}d 
      AND symbol IN (${portfolio.positions.map(p => `'${p.symbol}'`).join(',')})
    `;

    const result = await influx.query(query);
    const volatilities = result.map(r => r.volatility);
    
    return TechnicalAnalysis.montecarloVaR(
      portfolio,
      volatilities,
      this.CONFIDENCE_LEVEL
    );
  }

  realTimeVaR(positions: Position[]): Observable<number> {
    return marketDataStream.pipe(
      bufferTime(500), // 500ms window
      scan((prev, returns) => 
        TechnicalAnalysis.exponentialWeighting(prev, returns)
      ),
      map(weightedReturns => 
        this.calculateVaR(positions, weightedReturns)
      )
    );
  }
}