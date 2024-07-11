const express = require('express');
const router = express.Router();
const { createGuestCase, getGuestById, createGuest } = require('../controllers/guestController');

router.post('/user', createGuest);

router.post('/case', createGuestCase);

router.get('/:id', getGuestById);

module.exports = router;
