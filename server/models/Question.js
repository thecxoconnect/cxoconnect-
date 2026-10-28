import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: 'Strategic Leadership'
    },
    options: [
      {
        text: { type: String, required: true },
        trait: { type: String, required: true }, // e.g. 'Visionary Strategist', 'Agile Disruptor', 'Empathetic Leader', 'Operational Maestro'
        points: { type: Number, default: 10 }
      }
    ],
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);
