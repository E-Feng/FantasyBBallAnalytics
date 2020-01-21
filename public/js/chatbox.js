const socket = io.connect(document.location.origin);
const chatbox_init = document.getElementById('chat-init');
const username = document.getElementById('username');
const overlay = document.getElementById('chat-overlay');
const user_label = document.getElementById('user-label');
const message_form = document.getElementById('chat-form');
const message_box = document.getElementById('message-box')
const message = document.getElementById('message');
const warning = document.getElementById('warning');

getChatLog();

// Grabbing contents from db and appending items
async function getChatLog() {
  const res = await fetch('/comments/');
  const comments = await res.json();
  comments.data.forEach(comment => {
    const msg = `<strong>${comment.user}:</strong> ${comment.comment}`;
    message_box.append($('<li>').html(msg)[0]);
  })
  
  // Adjusting scroll to bottom
  message_box.scrollTop = message_box.scrollHeight;
}

// Init chat after submitting, grabbing username
async function initChat(e) {
  e.preventDefault();
  if (username.value != '') {
    overlay.style.zIndex = -1;
    user_label.textContent = username.value;
    socket.emit('username', username.value);
  } else {
    warning.textContent = 'Enter a username';
  }
}

chatbox_init.addEventListener('submit', initChat);

// Add message to messages and to db/API
async function sendMessage(e) {
  e.preventDefault();
  if (message.value != '') {
    socket.emit('chat_message', message.value);
    message_box.scrollTop = message_box.scrollHeight; 

    // Sending data to db/API
    const send_body = {
      user: username.value,
      comment: message.value
    }

    try {
      const res = await fetch('/comments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(send_body)
      });
    } catch(err) {
      console.log(err);
      return;
    }
  }
  message.value = '';
  message.focus();
}

socket.on('chat_message', (msg) => {
  message_box.append($('<li>').html(msg)[0]);
})

message_form.addEventListener('submit', sendMessage);