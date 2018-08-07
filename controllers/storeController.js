const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
const Review = mongoose.model('Review');

const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

let h = require('./helpers/index');



exports.getStores = async (req, res) => {
  let page = req.params.page || 1;
  let limit = 6;
  let skip = (limit * page) - limit; 

  let storesPromise = Store
    .find()
    .sort('-created')
    .skip(skip)
    .limit(limit);
    
  let countPromise = Store.countDocuments();

  let [stores, count] = await Promise.all([storesPromise, countPromise]);

  let pages = Math.ceil(count / limit);

  if (!stores.length && skip) {
    req.flash('info', `Page ${page} is not available..`);
    return res.redirect(`/stores/page/${pages}`);
  }

  res.render('stores', { title: 'Stores', stores, page, pages, count });
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add STORE!' });
};


const multerOpts = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) next(null, true)
    else {
      next({ message: 'That type of file is not allowed!' }, false);
    }
  }
};
exports.upload = multer(multerOpts).single('photo');

exports.resize = async (req, res, next) => {
  if (!req.file) return next();
  const ext = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${ext}`;
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  res.savePhoto = () => {
    photo.write(`./public/uploads/${req.body.photo}`);
  }
  next();
}

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await (new Store(req.body)).save();
  if (res.savePhoto) await res.savePhoto();
  req.flash('success', `Store "${store.name}" created. Thank you`);
  res.redirect(`/store/${store.slug}`);
}


exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id });
  if (!h.confirmAuthor(store, req.user, res.checkRights([77]))) throw { _message: 'You must own a store in order to edit it', status: 403 };
  res.render('editStore', { title: `Edit "${store.name}"`, store });
}

exports.updateStore = async (req, res) => {
  // 1. find store
  // 2. confirm user rights
  // 3. render


  let store = await Store.findOne({ _id: req.params.id });
  if (!h.confirmAuthor(store, req.user, res.checkRights([77]))) throw { _message: 'You must own a store in order to edit it', status: 403 }
  req.body.location.type = 'Point';

  store.set(req.body);
  store = await store.save();
  if (res.savePhoto) await res.savePhoto();
  
  req.flash('success', `Store "${store.name}" successfully updated. Thank you!<br><a href="/store/${store.slug}">View store →</a>`);
  res.redirect(`/stores/${store._id}/edit`);
}

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store
    .findOne({slug: req.params.slug});

  // Redirect to not found page
  if (!store) return next();

  res.render('store', {title: store.name, store});
}

exports.getStoreByTag = async (req, res) => {
  let page = req.params.page || 1;
  let limit = 6;
  let skip = (limit * page) - limit; // If this is page 1 skip === 0

  let tag = req.params.tag;
  let tagQuery = tag || { $exists: true };

  let tagsPromise = Store.getTagsList();
  let storesPromise = Store
    .find({ tags: tagQuery })
    .sort('-created')
    .skip(skip)
    .limit(limit);
  
  let storesCount = Store.find({tags: tagQuery}).countDocuments();
  
  let [tags, stores, count] = await Promise.all([tagsPromise, storesPromise, storesCount]);

  let pages = Math.ceil(count / limit);

  let path = '/tags';
  if (tag) path = `/tags/${tag}`;

  if (!stores.length && skip) {
    req.flash('info', `Page ${page} is not available..`);
    return res.redirect(`${path}/page/${pages}`);
  }

  res.render('tags', { tags, title: 'Tags', tag, stores, page, pages, count, path });
}

exports.mapPage = (req, res) => {
  res.render('map', {title: 'Map'});
}

exports.getHearts = async (req, res) => {

  let stores = await Store
  .find({ _id: {$in: req.user.hearts.stores} })
  .populate('hearts.stores');

  res.render('hearts', { title: 'Stores I like', stores });
}

exports.getTopStores = async (req, res) => {
  let stores = await Store.getTopStores();
  res.render('topStores', { title: '🌟 Top stores!', stores });
}










/* API */

exports.searchStores = async (req, res) => {
  let stores = await Store.find(
    // Find stores
    {
      $text: {
        $search: req.query.q
      }
    },
    {
      score: { $meta: 'textScore' }
    }
  )
  // Sort them
  .sort({ score: { $meta: 'textScore' } })
  // Limit
  .limit(5);

  res.json(stores);
}

exports.mapStores = async (req, res) => {
  let coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  let q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: 10000
      }
    }
  };
  
  let stores = await Store.find(q)
  .select('name slug description location -_id')
  .limit(10);

  res.json(stores);
}

exports.heartStore = async (req, res) => {
  let hearts = req.user.hearts.stores.map(obj => obj.toString());
  let operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';

  let user = await User
  .findByIdAndUpdate(req.user._id,
    {
      [operator]: { 'hearts.stores': req.params.id }
    }, 
    { new: true }
  );

  res.json(user.hearts.stores);

}

exports.removeStore = async (req, res, next) => {

  let store = await Store
    .findById(req.params.id);

  if (!h.confirmAuthor(store, req.user, res.checkRights([77])))
    throw { _message: `You don't have enough rights`, status: 403 }

  let userReq = User
    .update({},
      {
        '$pull': { 'hearts.stores': req.params.id }
      }
    );

  let reviewReq = Review
    .remove({store: req.params.id});


  let photoReq = h.fsUnlink(`../public/uploads/${store.photo}`)
    .catch(err => {
      if(err && err.code == 'ENOENT') {} else if (err) {
        // other errors, e.g. maybe we don't have enough permission
        throw new Error('Can not remove the file. [storeController]');
      }
    });

  let storeReq =  store.remove();

  await Promise.all([userReq, reviewReq, photoReq, storeReq]);

  res.json({ message: 'Store was deleted' });

}

exports.updateStoreApi = async (req, res) => {

  let store = await Store.findOne({ _id: req.params.id });
  if (!h.confirmAuthor(store, req.user, res.checkRights([77]))) throw { _message: 'You must own a store in order to edit it', status: 403 };
  
  let { name, description } = req.body;
  await store.update({ $set: {name, description} }, { runValidators: true });
 
  return res.json({message: 'Store updated'});
}