const socket = io.connect(document.location.origin);
const chatbox_init = document.getElementById('chat-init');
const username = document.getElementById('username');
const overlay = document.getElementById('chat-overlay');
const user_label = document.getElementById('user-label');
const message_form = document.getElementById('chat-form');
const message_box = document.getElementById('message-box')
const message = document.getElementById('message');
const warning = document.getElementById('warning');

// Init chat after submitting, grabbing username
function initChat(e) {
  if (is_static) {
    warning.textContent = 'Not available on github page, use fantasyanalytics.info';
  } else {
    if (username.value != '') {
      overlay.style.zIndex = -1;
      user_label.textContent = username.value;
      socket.emit('username', username.value);
    } else {
      warning.textContent = 'Enter a username';
    }
  }
}

chatbox_init.addEventListener('submit', initChat, {
  passive: true
});

// Add message to messages and to db/API
function addMessage(e) {
  if (message.value != '') {
    socket.emit('chat_message', message.value);
  }
  message.value = '';
}

socket.on('chat_message', (msg) => {
  message_box.append($('<li>').html(msg)[0]);
})

message_form.addEventListener('submit', addMessage, {
  passive: true
});