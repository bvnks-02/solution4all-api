export const globalErrorHandling = (err, req, res, next) => {
  const statusCode = err.statuscode || 500;
  const message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV === "development") {
    res.status(statusCode).json({ success: false, message, stack: err.stack });
  } else {
    res.status(statusCode).json({ success: false, message });
  }
};
