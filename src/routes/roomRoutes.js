const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/', authMiddleware, roomController.createRoom);
router.get('/', authMiddleware, roomController.getAllRooms);
router.get('/:id', authMiddleware, roomController.getRoomById);
router.get('/:id/messages', authMiddleware, roomController.getRoomMessages);





module.exports = router;
