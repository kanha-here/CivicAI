export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: 'Route not found', data: null });
}

export function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';
  const details = err.details || null;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({ success: false, message, data: details });
}
