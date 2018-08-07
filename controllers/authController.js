const passport = require('passport');
const mongoose = require('mongoose');
const crypto = require('crypto');
const mail = require('../handlers/mail');

const User = mongoose.model('User');


exports.checkRights = (accessList) => {
  return (req, res, next) => {
    let valid = res.checkRights(accessList);
    if (valid) return next();
    req.flash('error', 'You don\'t have enough rights');
    res.redirect('/');
  }
}

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed login',
  successRedirect: '/',
  successFlash: 'Now you are logged in!'
})

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'You should be logged in!');
  res.redirect('/login');
}

exports.forgot = async (req, res) => {
  // 1. See if that user exists
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'No account with that email exists');
    return res.redirect('back');
  }

  // 2. Set reset token
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + (60 * 60 * 1000);

  await user.save();
  // 3. Send email with token
  let resetURL = `${req.protocol}://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  await mail.send({
    filename: 'password-reset',
    user,
    subject: 'Password reset',
    resetURL
  });
  req.flash('success', `You have been emailed a password reset link`);
  res.redirect('/login');
}

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }

  res.render('reset', { title: 'Reset your password' });
}

exports.confirmPassword = (req, res, next) => {  
  req.checkBody('password', 'Password can not be blank!').notEmpty();
  req.checkBody('confirm-password', 'Password confirmation input can not be blank!').notEmpty();
  req.checkBody('confirm-password', 'Ops. Passwords do not match!').equals(req.body.password);

  let errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map( (err) => err.msg ));
    return res.redirect('back');
  }

  // If everything is ok
  next();
}

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    return res.redirect('/login');
  }
}