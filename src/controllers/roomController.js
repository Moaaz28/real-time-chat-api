const Room = require('../models/Room');
const Message = require('../models/Message');
const AppError = require('../utils/appError');


const createRoom = async (req, res, next) => {
    try {
        const {
            name,
            description,
            isPrivate
        } = req.body;


        const newRoom = new Room({
            name,
            description: description?.trim(),
            isPrivate: isPrivate === true,
            createdBy: req.user._id,
            members: [req.user._id]
        });


        await newRoom.save();


        const populatedRoom = await Room.findById(newRoom._id)
            .populate(
                'createdBy',
                'username displayName'
            )
            .lean();


        res.status(201).json({
            message: 'Room created successfully',
            room: populatedRoom
        });

    } catch (error) {
        next(error);
    }
};


const getAllRooms = async (req, res, next) => {
    try {

        const rooms = await Room.find()
            .populate(
                'createdBy',
                'username displayName'
            )
            .sort({ createdAt: -1 })
            .lean();


        res.status(200).json({
            rooms
        });

    } catch (error) {
        next(error);
    }
};


const getRoomById = async (req, res, next) => {
    try {

        const room = await Room.findById(req.params.id)
            .populate(
                'createdBy',
                'username displayName'
            )
            .lean();


        if (!room) {
            return next(
                new AppError(
                    'Room not found',
                    404
                )
            );
        }


        res.status(200).json({
            room
        });

    } catch (error) {
        next(error);
    }
};


const getRoomMessages = async (req, res, next) => {
    try {

        const roomId = req.params.id;

        const limit = Math.min(
            parseInt(req.query.limit) || 50,
            100
        );

        const skip =
            parseInt(req.query.skip) || 0;


        const room = await Room.findById(roomId);

        if (!room) {
            return next(
                new AppError(
                    'Room not found',
                    404
                )
            );
        }


        const messages = await Message.find({
            room: roomId
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate(
                'sender',
                'username displayName'
            )
            .lean();


        res.status(200).json({
            messages
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    createRoom,
    getAllRooms,
    getRoomById,
    getRoomMessages
};