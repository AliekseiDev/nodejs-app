
exports.catchErrors = (fn) => {
  return function(req, res, next) {
    return fn(req, res, next).catch((err) => {
      next(err);
    });
  };
};


exports.notFound = (req, res, next) => {
  const err = { _message: 'Not Found', status: 404 };
  next(err);
};



// MongoDB Validation Error Handler
exports.flashValidationErrors = (err, req, res, next) => {
  if (!err.errors) return next(err);
  const errorKeys = Object.keys(err.errors);
  errorKeys.forEach(key => req.flash('error', err.errors[key].message));
  res.redirect('back');
};



// Development Error Hanlder
exports.developmentErrors = (err, req, res, next) => {
  console.log(err);

  let error = {
    message: err._message || 'Check the console', 
    error: true, 
    status: err.status || 'Status not specified',
    stack: err.stack || ''
  }
  error.stackHighlighted = error.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>');

  res.status(error.status || 500);
  res.format({
    'text/html': () => res.render('error', error),
    'application/json': () => res.json(error)
  });
};



// Production Error Handler
exports.productionErrors = (err, req, res, next) => {
  console.log(err);

  let error = {
    message: err._message || 'Internal Server Error', 
    error: true, 
    status: err.status || 500
  }
  res.status(error.status || 500);
  res.format({
    'text/html': () => res.render('error', error),
    'application/json': () => res.json(error)
  });
};
