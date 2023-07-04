
const router = require('express').Router();

// Auth Router
router.use('/', require('./authRouter'));

// User Router
router.use('/users', require('./userRouter'));

// Group Router
router.use('/groups', require('./groupRouter'));

// CleanRoute Router
router.use('/routes', require('./cleanRouteRouter'));

// Vehicle Router
router.use('/vehicles', require('./vehicleRouter'));

//Websocket router
router.use('/ws', require('./wsRouter'));


module.exports = router;