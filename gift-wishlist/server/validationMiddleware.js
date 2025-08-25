const createValidator = (requiredFields = [], numericFields = []) => {
  return (req, res, next) => {
    const errors = [];

    requiredFields.forEach(field => {
      const value = req.body[field];
      if (value === undefined || value === '') {
        errors.push({ field, message: `${field} is required` });
      }
    });

    numericFields.forEach(field => {
      const value = req.body[field];
      if (value === undefined || typeof value !== 'number' || !Number.isFinite(value)) {
        errors.push({ field, message: `${field} must be a number` });
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  };
};

const validateGift = createValidator(
  ['name', 'description', 'link', 'imageUrl', 'recipient'],
  ['price']
);

const validateSuggestion = createValidator(
  ['name', 'description', 'link', 'imageUrl'],
  ['price']
);

const validateReservation = createValidator(['name']);

module.exports = {
  validateGift,
  validateSuggestion,
  validateReservation
};
