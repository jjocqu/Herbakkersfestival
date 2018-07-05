const router = require('express').Router();
const requestHandler = require('./request-handler.js');

// bar user routes
router.get('/drinks', requestHandler.getDrinks);
router.post('/order/:userId', requestHandler.placeOrder);


// admin routes
// requests below return 404 if userId is admin (does not have stock)
router.get('/stock/:userId', requestHandler.getStock);
router.put('/stock/:userId/:drinkName', requestHandler.updateStock);
//TODO perhaps create bulk request for updating multiple drinks at once per user
router.get('/sales', requestHandler.getSales);


//routes for everybody
router.post('/login', requestHandler.login);


module.exports = router;


