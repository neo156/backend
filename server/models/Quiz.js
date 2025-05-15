const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category'
  },
  questions: [
    {
      question: {
        type: String,
        required: true
      },
      options: [
        {
          text: {
            type: String,
            required: true
          },
          isCorrect: {
            type: Boolean,
            default: false
          }
        }
      ],
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
      }
    }
  ],
  timeLimit: {
    type: Number,
    default: 0 // 0 means no time limit
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('quiz', QuizSchema); 