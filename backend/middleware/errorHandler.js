export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Route Not Found',
    path: req.originalUrl,
    method: req.method,
  });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  // Log error server-side for Render logs diagnostics
  console.error(`[SERVER ERROR] ${req.method} ${req.originalUrl} - Status: ${statusCode}`);
  console.error(err.stack || err.message || err);

  const isProduction = (process.env.NODE_ENV || 'production').toLowerCase() === 'production';

  res.status(statusCode).json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: isProduction && statusCode === 500 ? 'An unexpected internal server error occurred' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
