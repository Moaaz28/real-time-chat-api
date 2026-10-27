const express = require('express');

const {
    createRoom,
    getAllRooms,
    getRoomById,
    getRoomMessages
} = require('../controllers/roomController');

const authMiddleware = require('../middlewares/authMiddleware');

const validate = require('../middlewares/validateMiddleware');

const {
    createRoomValidator,
    roomIdValidator,
    messagesValidator
} = require('../validators/roomValidator');


const router = express.Router();


router.post(
    '/',
    authMiddleware,
    createRoomValidator,
    validate,
    createRoom
);


router.get(
    '/',
    authMiddleware,
    getAllRooms
);

router.get(
    '/:id/messages',
    authMiddleware,
    messagesValidator,
    validate,
    getRoomMessages
);

router.get(
    '/:id',
    authMiddleware,
    roomIdValidator,
    validate,
    getRoomById
);




module.exports = router;