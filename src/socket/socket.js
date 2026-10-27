const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Room = require('../models/Room');
const Message = require('../models/Message');

const {
    isUserMember
} = require('../utils/room.utils');


const onlineUsers = new Map();


const setupSocket = (server) => {

    const io = require('socket.io')(server, {
        cors: {
            origin: '*'
        }
    });


    io.on('connection', (socket) => {

        // =========================
        // Authentication
        // =========================

        const token =
            socket.handshake.query.token;


        if (!token) {

            socket.emit(
                'error',
                'Authentication token is required'
            );

            socket.disconnect();

            return;
        }


        try {

            const decoded =
                jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );


            User.findById(decoded.id)

                .then(user => {

                    if (!user) {

                        socket.emit(
                            'error',
                            'User not found'
                        );

                        socket.disconnect();

                        return;
                    }


                    socket.data.id =
                        user._id.toString();


                    socket.data.user =
                        user;


                    console.log(
                        `User connected: ${user.username} (${socket.id})`
                    );


                    // =========================
                    // Online Users
                    // =========================

                    onlineUsers.set(
                        socket.data.id,
                        socket.id
                    );


                    io.emit(
                        'online-users',
                        {
                            userId: socket.data.id,

                            onlineUsers:
                                Array.from(
                                    onlineUsers.keys()
                                )
                        }
                    );


                    // =========================
                    // Join Room
                    // =========================

                    socket.on(
                        'join-room',
                        async (data) => {

                            const {
                                roomId
                            } = data;


                            if (!roomId) {

                                socket.emit(
                                    'error',
                                    'Room ID is required to join a room'
                                );

                                return;
                            }


                            if (!socket.data.id) {

                                socket.emit(
                                    'error',
                                    'User not authenticated'
                                );

                                return;
                            }


                            try {

                                const room =
                                    await Room.findById(
                                        roomId
                                    );


                                if (!room) {

                                    socket.emit(
                                        'error',
                                        'Room not found'
                                    );

                                    return;
                                }


                                // Private room
                                if (room.isPrivate) {

                                    const isMember =
                                        isUserMember(
                                            room,
                                            socket.data.id
                                        );


                                    if (!isMember) {

                                        socket.emit(
                                            'error',
                                            'You are not a member of this private room'
                                        );

                                        return;
                                    }
                                }


                                await socket.join(
                                    roomId
                                );


                                socket.emit(
                                    'joined-room',
                                    {
                                        roomId,

                                        message:
                                            'Joined room successfully'
                                    }
                                );


                                console.log(
                                    `User ${socket.data.user.username} joined room ${roomId}`
                                );

                            } catch (err) {

                                socket.emit(
                                    'error',
                                    'Error joining room: ' +
                                    err.message
                                );
                            }
                        }
                    );


                    // =========================
                    // Send Message
                    // =========================

                    socket.on(
                        'send-message',
                        async (data) => {

                            const {
                                roomId,
                                content
                            } = data;


                            if (
                                !roomId ||
                                !content?.trim()
                            ) {

                                socket.emit(
                                    'error',
                                    'Room ID and message are required'
                                );

                                return;
                            }


                            if (!socket.data.id) {

                                socket.emit(
                                    'error',
                                    'User not authenticated'
                                );

                                return;
                            }


                            // Must join room first
                            if (
                                !socket.rooms.has(
                                    roomId
                                )
                            ) {

                                socket.emit(
                                    'error',
                                    'You must join the room before sending messages'
                                );

                                return;
                            }


                            try {

                                const room =
                                    await Room.findById(
                                        roomId
                                    );


                                if (!room) {

                                    socket.emit(
                                        'error',
                                        'Room not found'
                                    );

                                    return;
                                }


                                if (
                                    room.isPrivate &&
                                    !isUserMember(
                                        room,
                                        socket.data.id
                                    )
                                ) {

                                    socket.emit(
                                        'error',
                                        'You are not a member of this private room'
                                    );

                                    return;
                                }


                                const message =
                                    await Message.create({
                                        room: roomId,

                                        sender:
                                            socket.data.id,

                                        content:
                                            content.trim()
                                    });


                                const populatedMessage =
                                    await Message.findById(
                                        message._id
                                    )
                                        .populate(
                                            'sender',
                                            'username displayName'
                                        )
                                        .lean();


                                io.to(roomId).emit(
                                    'new-message',
                                    populatedMessage
                                );


                            } catch (err) {

                                socket.emit(
                                    'error',
                                    'Error sending message: ' +
                                    err.message
                                );
                            }
                        }
                    );


                    // =========================
                    // Typing Start
                    // =========================

                    socket.on(
                        'typing-start',
                        (data) => {

                            const {
                                roomId
                            } = data;


                            if (!roomId) {

                                socket.emit(
                                    'error',
                                    'Room ID is required'
                                );

                                return;
                            }


                            if (!socket.data.id) {

                                socket.emit(
                                    'error',
                                    'User not authenticated'
                                );

                                return;
                            }


                            if (
                                !socket.rooms.has(
                                    roomId
                                )
                            ) {

                                socket.emit(
                                    'error',
                                    'You must join the room first'
                                );

                                return;
                            }


                            socket.to(roomId).emit(
                                'user-typing',
                                {
                                    userId:
                                        socket.data.id
                                }
                            );
                        }
                    );


                    // =========================
                    // Typing Stop
                    // =========================

                    socket.on(
                        'typing-stop',
                        (data) => {

                            const {
                                roomId
                            } = data;


                            if (!roomId) {

                                socket.emit(
                                    'error',
                                    'Room ID is required'
                                );

                                return;
                            }


                            if (!socket.data.id) {

                                socket.emit(
                                    'error',
                                    'User not authenticated'
                                );

                                return;
                            }


                            if (
                                !socket.rooms.has(
                                    roomId
                                )
                            ) {

                                socket.emit(
                                    'error',
                                    'You must join the room first'
                                );

                                return;
                            }


                            socket.to(roomId).emit(
                                'user-stopped-typing',
                                {
                                    userId:
                                        socket.data.id
                                }
                            );
                        }
                    );


                    // =========================
                    // Direct Message
                    // =========================

                    socket.on(
                        'direct-message',
                        async (data) => {

                            const {
                                roomId,
                                receiverId,
                                content
                            } = data;


                            if (
                                !roomId ||
                                !receiverId ||
                                !content?.trim()
                            ) {

                                socket.emit(
                                    'error',
                                    'Room ID, receiver ID and message are required'
                                );

                                return;
                            }


                            if (!socket.data.id) {

                                socket.emit(
                                    'error',
                                    'User not authenticated'
                                );

                                return;
                            }


                            const receiverSocketId =
                                onlineUsers.get(
                                    receiverId
                                );


                            if (!receiverSocketId) {

                                socket.emit(
                                    'error',
                                    'Receiver is offline'
                                );

                                return;
                            }


                            // Sender must join room first
                            if (
                                !socket.rooms.has(
                                    roomId
                                )
                            ) {

                                socket.emit(
                                    'error',
                                    'You must join the room first'
                                );

                                return;
                            }


                            try {

                                const room =
                                    await Room.findById(
                                        roomId
                                    );


                                if (!room) {

                                    socket.emit(
                                        'error',
                                        'Room not found'
                                    );

                                    return;
                                }


                                if (room.isPrivate) {

                                    const isSenderMember =
                                        isUserMember(
                                            room,
                                            socket.data.id
                                        );


                                    const isReceiverMember =
                                        isUserMember(
                                            room,
                                            receiverId
                                        );


                                    if (
                                        !isSenderMember ||
                                        !isReceiverMember
                                    ) {

                                        socket.emit(
                                            'error',
                                            'Both users must be members of this private room'
                                        );

                                        return;
                                    }
                                }


                                const message =
                                    await Message.create({
                                        room: roomId,

                                        sender:
                                            socket.data.id,

                                        content:
                                            content.trim()
                                    });


                                const populatedMessage =
                                    await Message.findById(
                                        message._id
                                    )
                                        .populate(
                                            'sender',
                                            'username displayName'
                                        )
                                        .lean();


                                // Send ONLY to receiver
                                io.to(
                                    receiverSocketId
                                ).emit(
                                    'direct-message',
                                    populatedMessage
                                );


                                // Confirm to sender
                                socket.emit(
                                    'direct-message-sent',
                                    populatedMessage
                                );


                            } catch (err) {

                                socket.emit(
                                    'error',
                                    'Error sending direct message: ' +
                                    err.message
                                );
                            }
                        }
                    );

                })


                .catch(err => {

                    socket.emit(
                        'error',
                        'Authentication error: ' +
                        err.message
                    );


                    socket.disconnect();
                });


        } catch (err) {

            socket.emit(
                'error',
                'Authentication error: ' +
                err.message
            );


            socket.disconnect();
        }


        // =========================
        // Disconnect
        // =========================

        socket.on(
            'disconnect',
            () => {

                if (socket.data.id) {

                    if (
                        onlineUsers.get(
                            socket.data.id
                        ) === socket.id
                    ) {

                        onlineUsers.delete(
                            socket.data.id
                        );


                        io.emit(
                            'offline-users',
                            {
                                userId:
                                    socket.data.id,

                                onlineUsers:
                                    Array.from(
                                        onlineUsers.keys()
                                    )
                            }
                        );
                    }
                }


                console.log(
                    'A user disconnected:',
                    socket.id
                );
            }
        );

    });
};


module.exports = {
    setupSocket
};