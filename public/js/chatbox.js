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
async function initChat(e) {
  if (username.value != '') {
    overlay.style.zIndex = -1;
    user_label.textContent = username.value;
    socket.emit('username', username.value);

    // Grabbing contents from db and appending items
    const res = await fetch('/comments/');
    const comments = await res.json();
    comments.data.forEach(comment => {
      const msg = `<strong>${comment.user}:</strong> ${comment.comment}`;
      message_box.append($('<li>').html(msg)[0]);
    })
  } else {
    warning.textContent = 'Enter a username';
  }
}

chatbox_init.addEventListener('submit', initChat, {passive: true});

// Add message to messages and to db/API
async function addMessage(e) {
  if (message.value != '') {
    socket.emit('chat_message', message.value);

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
}

socket.on('chat_message', (msg) => {
  message_box.append($('<li>').html(msg)[0]);
})

message_form.addEventListener('submit', addMessage, {passive: true});