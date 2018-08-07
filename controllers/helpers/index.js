const promisify = require('es6-promisify');
const fs = require('fs');

exports.fsUnlink = promisify(fs.unlink.bind(fs));

exports.confirmAuthor = (item, user, superRights) => {

  if (superRights) return true;

  if (!item.author.equals(user._id)) return;
  return true;
}

exports.paginate = (req, limit = 6) => {
  let page = req.params.page || 1;
  let skip = (limit * page) - limit; // If this is page 1 skip === 0

  return { page, limit, skip };
}