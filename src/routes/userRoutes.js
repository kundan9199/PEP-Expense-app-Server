const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware')
const userController = require('../controllers/usersController');
const usersController = require('../controllers/usersController');

router.use(authMiddleware);

router.get('/get-user-info', usersController.getUserInfo);

