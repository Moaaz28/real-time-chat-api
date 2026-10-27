const isUserMember = (room, userId) => {
    if (!room || !userId) {
        return false;
    }

    return room.members.some(
        memberId => memberId.toString() === userId.toString()
    );
};

module.exports = {
    isUserMember
};