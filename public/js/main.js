const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', message => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
/* Obtain element values in the form
msg is a type text input in chat.html 

arguments
msg *type:string* (no default value) */
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
/* get the element and put it in the DOM */
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}

//private messages
socket.on('mensajePrivado', function(message){
  console.log('mensaje privado:', message);
});

//add image to the DOM
socket.on('addimage', function(msg,base64image,message){
  $('.chat-messages')
  .append(
      $('<p class="meta">', '<span>', "prueba", "</span></p>").append($('<b>').text(msg),'<p><a target="_blank" href="'+ base64image +'"><img src="'+ base64image +'"></a></p>'
      )
  );
});

/* function image send 

  arguments
  file *array* (no default value)*/
$(function(){
  //when the page loads completely
  $("#imagefile").on('change',function(e){
      var file = e.originalEvent.target.files[0];
      var reader = new FileReader();
      reader.onload = function(evt){
          //send the image
          socket.emit('user image', evt.target.result);
      };
      reader.readAsDataURL(file);
  });
});
