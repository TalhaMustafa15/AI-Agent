const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { askQuestion, getHistory, deleteHistory } = require('../controllers/qaController');
const { protect } = require('../middleware/authMiddleware');

const askValidation = [
  body('question')
    .trim()
    .notEmpty().withMessage('Question cannot be empty')
    .isLength({ min: 3 }).withMessage('Question must be at least 3 characters')
    .isLength({ max: 2000 }).withMessage('Question cannot exceed 2000 characters')
];

router.post('/ask', protect, askValidation, askQuestion);
router.get('/history', protect, getHistory);
router.delete('/history/:id', protect, deleteHistory);

module.exports = router;


