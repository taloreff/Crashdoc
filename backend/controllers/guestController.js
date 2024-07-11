const Guest = require('../models/guestModel');
const { generateToken } = require('../auth/tokenUtils.js');

const createGuest = async (req, res) => {
    try {
        const guest = new Guest({ cases: [] });

        const savedUser = await guest.save();
        const token = generateToken(savedUser);
        res.status(201).json({ message: 'Guest login successful!', user: savedUser, token });
    } catch (error) {
        console.error('Error creating guest:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const createGuestCase = async (req, res) => {
    try {
        const { thirdPartyId, phoneNumber, vehicleNumber, licenseNumber, vehicleModel, documents, damagePhotos } = req.body;

        const guest = await Guest.findById(req.params.id);
        if (!guest) {
            return res.status(404).json({ error: 'Guest not found' });
        }

        guest.cases.push({
            thirdPartyId,
            phoneNumber,
            vehicleNumber,
            licenseNumber,
            vehicleModel,
            documents,
            damagePhotos,
        });

        await guest.save();
        res.status(201).json(guest);
    } catch (error) {
        console.error('Error creating case for guest:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getGuestById = async (req, res) => {
    try {
        const guest = await Guest.findById(req.params.id);
        if (!guest) {
            return res.status(404).json({ error: 'Guest not found' });
        }
        res.json(guest);
    } catch (error) {
        console.error('Error fetching guest:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateGuestById = async (req, res) => {
    try {
        const guest = await Guest.findById(req.params.id);
        if (!guest) {
            return res.status(404).json({ error: 'Guest not found' });
        }

        const { cases } = req.body;
        guest.cases = cases;

        await guest.save();
        res.json(guest);
    } catch (error) {
        console.error('Error updating guest:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = {
    createGuest,
    createGuestCase,
    getGuestById,
    updateGuestById,
};
