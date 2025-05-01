// src/ml-models/HFTModel.js
import * as tf from '@tensorflow/tfjs-node-gpu';

class AlphaSignalGenerator {
  constructor() {
    this.model = tf.sequential({
      layers: [
        tf.layers.lstm({units: 512, inputShape: [60, 10]}),
        tf.layers.dense({units: 3, activation: 'softmax'})
      ]
    });
  }

  async train(dataset) {
    const optimizer = tf.train.adam(0.0001);
    this.model.compile({
      optimizer: optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    await this.model.fit(dataset.x, dataset.y, {
      epochs: 100,
      batchSize: 2048,
      callbacks: tf.callbacks.earlyStopping({patience: 3})
    });
  }

  predict(marketState) {
    const tensor = tf.tensor3d([marketState]);
    const prediction = this.model.predict(tensor);
    return prediction.dataSync();
  }
}