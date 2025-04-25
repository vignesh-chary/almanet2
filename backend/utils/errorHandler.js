export const handleError = (res, error) => {
  console.error(error);

  // Handle Mongoose validation errors
  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      errors: Object.values(error.errors).map((err) => err.message),
    });
  }

  // Handle Mongoose duplicate key error
  if (error.code === 11000) {
    return res.status(400).json({
      message: "Duplicate key error",
      field: Object.keys(error.keyPattern)[0],
    });
  }

  // Handle JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Invalid token",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "Token expired",
    });
  }

  // Handle custom errors
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  // Default error
  return res.status(500).json({
    message: "Internal server error",
  });
}; 