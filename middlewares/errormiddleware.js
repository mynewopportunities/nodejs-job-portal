const errorMiddleware = (err, req, res, next) => {
  console.log(err); // Keep logging for server-side debugging

  // Default error structure
  const defaultErrors = {
    statusCode: 500,
    message: "Something went wrong",
  };

  // Handle missing field (Validation error)
  if (err.name === "ValidationError") {
    defaultErrors.statusCode = 400;
    defaultErrors.message = Object.values(err.errors)
      .map((item) => item.message)
      .join(",");
  }

  // Handle duplicate key error (e.g., for unique fields)
  if (err.code && err.code === 11000) {
    defaultErrors.statusCode = 400;
    defaultErrors.message = `${Object.keys(
      err.keyValue
    )} field has to be unique`;
  }

  // Send the response without exposing internal error details
  res.status(defaultErrors.statusCode).json({
    success: false,
    message: defaultErrors.message,
  });
};

export default errorMiddleware;
