const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const Quiz = require('../models/Quiz');
const Category = require('../models/Category');

// @route   GET api/quizzes
// @desc    Get all user's quizzes
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user.id })
      .sort({ date: -1 })
      .populate('category', ['name', 'color', 'icon']);
    res.json(quizzes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/quizzes/:id
// @desc    Get quiz by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('category', ['name', 'color', 'icon']);

    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }

    // Make sure user owns quiz
    if (quiz.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/quizzes/category/:categoryId
// @desc    Get all quizzes from a specific category
// @access  Private
router.get('/category/:categoryId', auth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    // Check if user owns the category
    if (category.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    const quizzes = await Quiz.find({ 
      user: req.user.id,
      category: req.params.categoryId 
    }).sort({ date: -1 });
    
    res.json(quizzes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/quizzes
// @desc    Add new quiz
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('questions', 'At least one question is required').isArray({ min: 1 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, questions, timeLimit } = req.body;

    try {
      // Verify the category belongs to the user if provided
      if (category) {
        const categoryRecord = await Category.findById(category);
        if (!categoryRecord || categoryRecord.user.toString() !== req.user.id) {
          return res.status(401).json({ msg: 'Invalid category' });
        }
      }

      const newQuiz = new Quiz({
        title,
        description,
        category,
        questions,
        timeLimit,
        user: req.user.id
      });

      const quiz = await newQuiz.save();
      res.json(quiz);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/quizzes/:id
// @desc    Update quiz
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, description, category, questions, timeLimit } = req.body;

  // Build quiz object
  const quizFields = {};
  if (title) quizFields.title = title;
  if (description !== undefined) quizFields.description = description;
  if (category) quizFields.category = category;
  if (questions) quizFields.questions = questions;
  if (timeLimit !== undefined) quizFields.timeLimit = timeLimit;

  try {
    let quiz = await Quiz.findById(req.params.id);

    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

    // Make sure user owns quiz
    if (quiz.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // If category is changing, verify the new category belongs to the user
    if (category && category !== (quiz.category ? quiz.category.toString() : null)) {
      const categoryRecord = await Category.findById(category);
      if (!categoryRecord || categoryRecord.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Invalid category' });
      }
    }

    quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { $set: quizFields },
      { new: true }
    );

    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/quizzes/:id
// @desc    Delete quiz
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let quiz = await Quiz.findById(req.params.id);

    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

    // Make sure user owns quiz
    if (quiz.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Quiz.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Quiz removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 