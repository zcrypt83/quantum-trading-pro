// src/ml-models/tensorflow/PredictionEngine.ts
import * as tf from '@tensorflow/tfjs';
import { loadLayersModel } from '@tensorflow/tfjs-layers';

class PredictionEngine {
  private model: tf.LayersModel | null = null;
  
  async init() {
    this.model = await loadLayersModel('/models/hft-model.json');
    warmupModel(this.model);
  }

  async predict(data: MarketWindow): Promise<Prediction> {
    if (!this.model) throw new Error('Model not loaded');
    
    const tensor = preprocessData(data);
    const prediction = this.model.predict(tensor) as tf.Tensor;
    return postprocessPrediction(prediction);
  }
}

// Uso en componente
const PredictionPanel = () => {
  const [prediction, setPrediction] = useState<Prediction>();
  const engine = useRef(new PredictionEngine());

  useEffect(() => {
    engine.current.init();
    const interval = setInterval(async () => {
      const data = await fetchMarketWindow();
      const prediction = await engine.current.predict(data);
      setPrediction(prediction);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="prediction-card">
      <SignalStrength value={prediction?.strength} />
      <ProbabilityDistribution data={prediction?.probabilities} />
    </div>
  );
};