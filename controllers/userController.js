const promisify = require('es6-promisify');

const mongoose = require('mongoose');
const User = mongoose.model('User');


exports.checkUniqueness = async (req, res, next) => {

  let user = await User.findOne({ email: req.body.email });
  if (!user) return next();

  req.flash('error', 'User already exists');
  res.redirect('back');

}

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
}

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
}

exports.validateRegister = async (req, res, next) => {
  
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'That email is not valid!').isEmail();
  req.checkBody('password', 'Password can not be blank!').notEmpty();
  req.checkBody('confirm-password', 'Password confirmation input can not be blank!').notEmpty();
  req.checkBody('confirm-password', 'Ops. Passwords do not match!').equals(req.body.password);

  let errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map( (err) => err.msg ));
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
    return;
  }
  
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    req.flash('error', 'Choose another email please');
    return res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
  }

  next();
}

exports.register = async (req, res, next) => {
  let user = new User({
    email: req.body.email, 
    name: req.body.name
  });

  let registerPromise = promisify(User.register.bind(User));
  await registerPromise(user, req.body.password);
  
  next();
}

exports.account = (req, res) => {
  res.render('editAccount', { title: 'Edit your account' });
}

exports.updateAccount = async (req, res) => {
  let {email, name} = req.body;
  const updates = {email, name};

  const user = await User.findOneAndUpdate(
    { _id: req.user._id }, 
    { $set: updates }, 
    { new: true, runValidators: true, context: 'query' }
  );

  res.redirect('back');
}