const mongoose = require('mongoose');
const Review = mongoose.model('Review');

const h = require('./helpers/index');

exports.addReview = async (req, res) => {
  req.body.author = req.user._id;
  req.body.store = req.params.id;
  
  let review = new Review(req.body);
  await review.save();
  req.flash('success', 'Review saved!');
  res.redirect('back');
}

exports.removeReview = async (req, res) => {

  let review = await Review.findById(req.params.id);
  if (!h.confirmAuthor(review, req.user, res.checkRights([77])))
    throw { message: 'FORBIDDEN', status: 403 };

  await review.remove();

  res.json({ message: 'Review was removed' });
}

exports.updateReview = async (req, res) => {

  let review = await Review.findById(req.params.id);
  if (!h.confirmAuthor(review, req.user, res.checkRights([77])))
    throw { message: 'FORBIDDEN', status: 403 };

  let { text } = req.body;
  await review.update({ $set: {text} });

  res.json({ message: 'Review was updated' });
}