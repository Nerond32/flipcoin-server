const handleRoomNotExists = (room, roomName) => {
  let response = null;
  if (!room) {
    response = {
      error: `Room ${roomName} does not exist`,
      status: 404
    };
  }
  return response;
};

const handleUserConflicts = (room, userToken, userName) => {
  let response = null;
  let userWithToken;
  let userWithName;
  if (userToken) {
    userWithToken = room.users.find(user => {
      return user.userToken === userToken;
    });
  }
  if (userName) {
    userWithName = room.users.find(user => {
      return user.userName === userName;
    });
  }
  if (
    userWithName &&
    userWithToken &&
    userWithName.userToken !== userWithToken.userToken
  ) {
    response = {
      error: 'Mismatch between provided token and username!',
      status: 409
    };
  } else if (userWithName && !userWithToken) {
    response = {
      error: `User ${userName} already exists!`,
      status: 409
    };
  }
  return response;
};

module.exports = {
  handleRoomNotExists,
  handleUserConflicts
};
