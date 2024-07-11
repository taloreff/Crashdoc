const express = require('express');
const router = express.Router();
const { createGuestCase, getGuestById, createGuest, updateGuestById } = require('../controllers/guestController');

router.post('/user', createGuest);

router.post('/case', createGuestCase);

router.get('/user/:id', getGuestById);

router.put('/user/:id', updateGuestById)

module.exports = router;
