const socketio = require('socket.io');
const express = require('express');
const http = require('http');
const path =require('path');

var key_128=[];
const app=express();
const server = http.createServer(app);
const io = socketio(server);
const formatMessage=require('./utils/messages')
//Set static folder 
app.use(express.static(path.join(__dirname,'extension')));
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
  } = require('./utils/users');
  const botName = 'OneTimeShare Bot';
// Run when client connects
io.on('connection', socket => {

    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
    
        socket.join(user.room);
    
        // Welcome current user
        socket.emit('welcoming', formatMessage(botName, 'Welcome to OneTimeShare!'));

        // Generate new key and send to all users
        io.to(user.room).emit('keySend', formatMessage(botName, generateKey()));

        // Broadcast when a user connects
        socket.broadcast
          .to(user.room)
          .emit(
            'welcoming',
            formatMessage(botName, `${user.username} has joined the chat`)
          );
      });



    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit(
                'welcoming',
                formatMessage(botName, `${user.username} has left the chat`)
                );
                // Send users and room info
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                });
            }
        });

    

    socket.on('sentPassword',(sentPass)=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, sentPass));
        });
    })

const PORT =3000|| process.env.PORT;
server.listen(PORT,()=> console.log(`Server running on port ${PORT}`));
function generateKey(){
    key_128=[];
    for (i = 0; i < 16; i++){
      key_128.push(Math.floor((Math.random() * 100) + 1))
    }
    return key_128;
  }