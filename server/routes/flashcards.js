const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const Flashcard = require('../models/Flashcard');
const Category = require('../models/Category');

// @route   GET api/flashcards
// @desc    Get all user's flashcards
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ user: req.user.id }).sort({ date: -1 });
    res.json(flashcards);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET api/flashcards/category/:categoryId
// @desc    Get flashcards for a specific category
// @access  Private
router.get('/category/:categoryId', auth, async (req, res) => {
  try {
    // First verify the category belongs to the user
    const category = await Category.findOne({
      _id: req.params.categoryId,
      user: req.user.id
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found or not authorized' });
    }

    const flashcards = await Flashcard.find({
      category: req.params.categoryId,
      user: req.user.id
    }).sort({ date: -1 });

    res.json(flashcards);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   POST api/flashcards
// @desc    Add new flashcard
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('question', 'Question is required').not().isEmpty(),
      check('answer', 'Answer is required').not().isEmpty(),
      check('category', 'Category is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation error', errors: errors.array() });
    }

    const { question, answer, category } = req.body;

    try {
      // Verify the category belongs to the user
      const categoryRecord = await Category.findOne({
        _id: category,
        user: req.user.id
      });

      if (!categoryRecord) {
        return res.status(404).json({ success: false, message: 'Category not found or not authorized' });
      }

      const newFlashcard = new Flashcard({
        question,
        answer,
        category,
        user: req.user.id
      });

      const flashcard = await newFlashcard.save();

      res.json(flashcard);
    } catch (err) {
      console.error('Flashcard creation error:', err.message);
      res.status(500).json({ success: false, message: 'Server Error: ' + err.message });
    }
  }
);

// @route   PUT api/flashcards/:id
// @desc    Update flashcard
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { question, answer } = req.body;

  // Build flashcard object
  const flashcardFields = {};
  if (question) flashcardFields.question = question;
  if (answer) flashcardFields.answer = answer;

  try {
    let flashcard = await Flashcard.findById(req.params.id);

    if (!flashcard) return res.status(404).json({ success: false, message: 'Flashcard not found' });

    // Make sure user owns flashcard
    if (flashcard.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    flashcard = await Flashcard.findByIdAndUpdate(
      req.params.id,
      { $set: flashcardFields },
      { new: true }
    );

    res.json(flashcard);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   DELETE api/flashcards/:id
// @desc    Delete flashcard
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let flashcard = await Flashcard.findById(req.params.id);

    if (!flashcard) return res.status(404).json({ success: false, message: 'Flashcard not found' });

    // Make sure user owns flashcard
    if (flashcard.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await Flashcard.findByIdAndRemove(req.params.id);

    res.json({ success: true, message: 'Flashcard removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router; 