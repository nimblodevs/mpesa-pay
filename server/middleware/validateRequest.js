function requireFields(fields) {
  return (req, res, next) => {
    const body = req.body || {};
    const missing = fields.filter((field) => body[field] === undefined || body[field] === null);

    if (missing.length) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    return next();
  };
}

module.exports = {
  requireFields,
};
