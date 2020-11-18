//Import all dependencies.
const socketio = require("socket.io");
const express = require("express");
const http = require("http");
const path = require("path");
//Delare blank key
var key_128 = [];
//Start express application
const app = express();
const server = http.createServer(app);
//Start Socket.io at default port 3000
const io = socketio(server);
//Import functions related to message formating.
const formatMessage = require("./utils/messages");
//Import funcitons related to users and rooms joining.
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");
const botName = "OneTimeShare Bot";
//Set static folder to redirect client to launch wesite in client directory.
app.use(express.static(path.join(__dirname, "client")));

// Run when client connects to server
io.on("connection", (socket) => {
  //On joinRoom socket receive,
  socket.on("joinRoom", ({ username, room }) => {
    //Get user with after joining to room.
    const user = userJoin(socket.id, username, room);
    //Join particular room in Socket.io
    socket.join(user.room);

    // Welcome current user
    socket.emit(
      "welcoming",
      formatMessage(botName, "Welcome to OneTimeShare!")
    );

    // Generate new key and send to all users
    io.to(user.room).emit("keySend", generateKey());

    // Broadcast when a user connects to all except recently connected user.
    socket.broadcast
      .to(user.room)
      .emit(
        "welcoming",
        formatMessage(botName, `${user.username} has joined the room`)
      );
  });

  //On client disconnect
  socket.on("disconnect", () => {
    //Leave particular room .
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "welcoming",
        formatMessage(botName, `${user.username} has left the room`)
      );
    }
  });

  //On reciving a encrypted password sent by user.
  socket.on("sentPassword", (sentPass) => {
    const user = getCurrentUser(socket.id);
    //Send the encrypted password to all other users in the room.
    io.to(user.room).emit("message", formatMessage(user.username, sentPass));
  });
});
//Define port number.
const PORT = 3000 || process.env.PORT;
//Make server listen at PORT
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//function that returns a newly generated key
function generateKey() {
  key_128 = [];
  //append 16 randomoly generated numbers to key array.
  for (i = 0; i < 16; i++) {
    key_128.push(Math.floor(Math.random() * 100 + 1));
  }
  //return 128 bit key.
  return key_128;
}
