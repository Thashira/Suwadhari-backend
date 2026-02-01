// Validation Middleware
const validationMiddleware = (req, res, next) => {
  // This middleware can be used for input validation
  // Example: Validate request body, query params, etc.
  
  next();
};

module.exports = validationMiddleware;
