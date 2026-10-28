import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: 'Strategic Leadership'
    },
    options: {
      type: [mongoose.Schema.Types.Mixed],
      required: true,
      default: []
    },
    correctAnswerIndex: {
      type: Number,
      default: 0
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);
