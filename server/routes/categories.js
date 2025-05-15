const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const Category = require('../models/Category');

// @route   GET api/categories
// @desc    Get all user's categories
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.id }).sort({ date: -1 });
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/categories
// @desc    Add new category
// @access  Private
router.post(
  '/',
  [auth, [check('name', 'Name is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, color, icon } = req.body;

    try {
      const newCategory = new Category({
        name,
        description,
        color,
        icon,
        user: req.user.id
      });

      const category = await newCategory.save();
      res.json(category);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/categories/:id
// @desc    Update category
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, description, color, icon } = req.body;

  // Build category object
  const categoryFields = {};
  if (name) categoryFields.name = name;
  if (description !== undefined) categoryFields.description = description;
  if (color) categoryFields.color = color;
  if (icon) categoryFields.icon = icon;

  try {
    let category = await Category.findById(req.params.id);

    if (!category) return res.status(404).json({ msg: 'Category not found' });

    // Make sure user owns category
    if (category.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: categoryFields },
      { new: true }
    );

    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/categories/:id
// @desc    Delete category and all associated flashcards
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) return res.status(404).json({ msg: 'Category not found' });

    // Make sure user owns category
    if (category.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Delete all flashcards in this category
    const Flashcard = require('../models/Flashcard');
    await Flashcard.deleteMany({ category: req.params.id });

    // Delete the category
    await Category.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Category and all associated flashcards removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 