const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Bot';

/* Run when client connects
  Socket function is used to emit and broadcast when a users connects
  this function send a welcome message to the user that connects to the server, and
  broadcast to other users that a user has connected
  
  Arguments
  socket.id *type:string* (value assigned by socket.io)
  (A unique identifier for the session)
  username  *type:string* (not default value)
  (is the name of the user)
  botname   *type:string* (Default value: Bot)
  (is the name of the bot)
  room      *type:string* (Default value: room1, room2, room3, room4)
  (that are the rooms available)
  */
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to the Ozone Chat!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined to the chat.`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });


  /* Listen for chatMessage 
  This functions catch message from main.js and emit it to the users in the room
  Arguments
  
  socket.id *type:string* (value assigned by socket.io)
  (A unique identifier for the session)
  username  *type:string* (not default value)
  (is the name of the user)
  message   *type:string* (not default value, required input)
  (that are the rooms available) */  
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });
  
  //Socket imagen
  socket.on('user image',function(image){
      const user = getCurrentUser(socket.id);
      io.to(user.room).emit('addimage', `Imagen compartida por ${user.username}: `, image);
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} ha abandonado el chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, console.log('servidor corriendo en el puerto 3000'));
