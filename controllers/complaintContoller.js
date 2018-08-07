const mongoose = require('mongoose');
const Complaint = mongoose.model('Complaint');

exports.createComplaint = async (req, res) => {
  req.body.author = {
    name: req.user.name,
    link: req.user._id
  };

  req.body.store = req.params.storeId;
  req.body.kind = 'store';

  if (req.params.commentId) {
    req.body.review = req.params.commentId;
    req.body.kind = 'review';
  }
  let complaint = new Complaint(req.body);
  await complaint.save();

  req.flash('success', 'We will consider your complaint as soon as possible');
  res.redirect('back');
}

exports.showComplaints = async (req, res) => {
  let complaints = await Complaint
    .find()
    .populate('review')
    .populate('store')
    .sort({created: -1});

  res.render('complaints', { title: 'Complaints', complaints });
}


/* API */

exports.removeComplaint = async (req, res) => {
  if (!res.checkRights([77])) throw { status: 403, _message: 'FORBIDDEN' };
  await Complaint.findByIdAndRemove(req.params.id);
  res.json({ message: 'Complaint was removed' });
}