// //paymentRoutes

// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middlewares/authMiddleware');
// const authorizeMiddleware = require('../middlewares/authorizeMiddleware')
// const paymentsController = require('../controllers/paymentsController');

// router.use(authMiddleware);

// router.post('/create-order', authorizeMiddleware('payment:create'),
// paymentsController.createOrder);

// router.post('/verify-order', authorizeMiddleware('payment:create'),
// paymentsController.verifyOrder);


// module.exports = router;


 const express = require('express');
 const router = express.Router();
 const authMiddleware = require('../middlewares/authMiddleware');
 const authorizeMiddleware = require('../middlewares/authorizeMiddleware');
 const paymentsController = require('../controllers/paymentsController');

 router.use(authMiddleware.protect);

router.post('/create-order', authorizeMiddleware('payment:create'),
paymentsController.createOrder);

router.post('/verify-order', authorizeMiddleware('payment:create'),
paymentsController.verifyOrder);


module.exports = router;