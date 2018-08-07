const express = require('express');
const router = express.Router();

const { catchErrors } = require('../handlers/errorHandlers');
const storeCtrl = require('../controllers/storeController');
const userCtrl = require('../controllers/userController');
const authCtrl = require('../controllers/authController');
const reviewCtrl = require('../controllers/reviewController');
const complaintCtrl = require('../controllers/complaintContoller');


// Do work here
router.get('/', catchErrors(storeCtrl.getStores));
router.get('/stores/', catchErrors(storeCtrl.getStores));
router.get('/stores/page/:page', catchErrors(storeCtrl.getStores));


router.get('/add', authCtrl.isLoggedIn, storeCtrl.addStore);
router.post('/add',
  storeCtrl.upload,
  catchErrors(storeCtrl.resize),
  catchErrors(storeCtrl.createStore)
);

router.post('/add/:id', 
  storeCtrl.upload,
  catchErrors(storeCtrl.resize),
  catchErrors(storeCtrl.updateStore)
);

router.get('/stores/:id/edit', catchErrors(storeCtrl.editStore));

router.get('/store/:slug', catchErrors(storeCtrl.getStoreBySlug));



router.get('/tags', catchErrors(storeCtrl.getStoreByTag));
router.get('/tags/page/:page', catchErrors(storeCtrl.getStoreByTag));
router.get('/tags/:tag', catchErrors(storeCtrl.getStoreByTag));
router.get('/tags/:tag/page/:page', catchErrors(storeCtrl.getStoreByTag));


router.get('/login', userCtrl.loginForm);
router.post('/login', authCtrl.login);

router.get('/logout', authCtrl.logout);

router.get('/register', userCtrl.registerForm);
// 1. Validate user data
// 2. Register user
// 3. Log in
router.post('/register',
  userCtrl.validateRegister,
  catchErrors(userCtrl.register),
  authCtrl.login
);


router.get('/account', authCtrl.isLoggedIn, userCtrl.account);
router.post('/account', authCtrl.isLoggedIn, catchErrors(userCtrl.updateAccount));

router.post('/account/forgot', catchErrors(authCtrl.forgot));

router.get('/account/reset/:token', catchErrors(authCtrl.reset));
router.post('/account/reset/:token',
  catchErrors(authCtrl.confirmPassword),
  catchErrors(authCtrl.update)
);


router.get('/map', storeCtrl.mapPage);

router.get('/hearts', authCtrl.isLoggedIn, catchErrors(storeCtrl.getHearts));

router.post('/reviews/:id', 
  authCtrl.isLoggedIn,
  catchErrors(reviewCtrl.addReview)
);

router.get('/top', catchErrors(storeCtrl.getTopStores));


router.post('/stores/:storeId/complain', 
  authCtrl.isLoggedIn,
  catchErrors(complaintCtrl.createComplaint)
);

router.post('/stores/:storeId/:commentId/complain', 
  authCtrl.isLoggedIn,
  catchErrors(complaintCtrl.createComplaint)
);

router.get('/complaints',
  authCtrl.isLoggedIn,
  authCtrl.checkRights([77]),
  catchErrors(complaintCtrl.showComplaints)
);

/* API */

router.get('/api/v1/search', catchErrors(storeCtrl.searchStores));
router.get('/api/v1/near', catchErrors(storeCtrl.mapStores));
router.post('/api/v1/stores/:id/heart', catchErrors(storeCtrl.heartStore));
router.post('/api/v1/stores/:id/remove', catchErrors(storeCtrl.removeStore));
router.post('/api/v1/stores/:id/update', catchErrors(storeCtrl.updateStoreApi));
router.post('/api/v1/complaints/:id/remove', catchErrors(complaintCtrl.removeComplaint));
router.post('/api/v1/reviews/:id/remove', catchErrors(reviewCtrl.removeReview));
router.post('/api/v1/reviews/:id/update', catchErrors(reviewCtrl.updateReview));

module.exports = router;