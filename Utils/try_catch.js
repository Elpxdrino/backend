const tryCatch = (func) => {
  return async (req, res, next) => {
    await func(req, res, next).catch((err) => {
      console.log(err);
      next(err);
    });
  };
};

module.exports = {
  tryCatch,
};
