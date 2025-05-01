import * as tf from '@tensorflow/tfjs';
import { io } from '@tensorflow/tfjs-core';
import { MovingWindowBuffer } from '@lib/utils/data';

export class PricePredictor {
  private model: tf.LayersModel;
  private buffer: MovingWindowBuffer;
  private worker: Worker;

  constructor(modelPath: string, windowSize: number = 60) {
    this.buffer = new MovingWindowBuffer(windowSize);
    this.worker = new Worker(new URL('./prediction.worker.ts', import.meta.url));
  }

  async initialize() {
    this.model = await tf.loadLayersModel(io.browserHTTPRequest(modelPath));
    await this.model.save('indexeddb://price-prediction-model');
    this.warmup();
  }

  private warmup() {
    const dummyInput = tf.randomNormal([1, 60, 5]);
    this.model.predict(dummyInput);
    tf.dispose(dummyInput);
  }

  async predict(): Promise<number> {
    const input = this.buffer.getSnapshot();
    return new Promise((resolve) => {
      this.worker.onmessage = ({ data }) => resolve(data);
      this.worker.postMessage(input);
    });
  }
}