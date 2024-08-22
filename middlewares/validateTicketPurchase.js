const { check, validationResult } = require('express-validator');

const validateTicketPurchase = [
  check('event')
    .isMongoId()
    .withMessage('Invalid event ID format'),

  check('ticketType')
    .isIn(['Standard', 'VIP'])
    .withMessage('Invalid ticket type. Allowed values are Standard or VIP'),

  check('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = validateTicketPurchase;
