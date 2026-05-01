const mongoose = require('mongoose');

const qaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
      maxlength: [2000, 'Question cannot exceed 2000 characters']
    },
    response: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    source: {
      type: String,
      enum: ['openai', 'huggingface', 'mock', 'claude'],
      default: 'mock'
    },
    tokens: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient querying
qaSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('QA', qaSchema);
