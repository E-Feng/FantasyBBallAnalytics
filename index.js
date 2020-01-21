const path = require('path');
const aws = require('aws-sdk');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const router = express.Router();
const connectDB = require('./config/db');
require('dotenv').config({path: './config/.env'});

// Params
const useAWS = false;
const PORT = process.env.PORT || 3000;

// Routes
app.use(express.json());
app.use('/comments/', require('./routes/comments'));

// Socket.io for chatbox
io.sockets.on('connection', (socket) => {
  socket.on('username', (username) => {
    socket.username = username;
  })

  socket.on('chat_message', (message) => {
    io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
  })
})

// Connecting to db
connectDB();

// Getting data from AWS and setting routes, if not return default JSON
if (useAWS) {
  getAWSS3data()
} else {
  app.get('/api/*', (req, res) => {
    res.json(JSON.stringify({msg: 'For Testing'}));
  })
}

// Starting server with express
app.use(express.static('public'));
http.listen(PORT, () => console.log(`Running on port ${PORT}`));

// Connecting to AWS-S3
async function getAWSS3data() {
  console.log('Getting AWS S3 data...')
  try {
    aws.config.setPromisesDependency();
    aws.config.update({
      accessKeyId: process.env.AWS_ACCESS,
      secretAccessKey: process.env.AWS_SECRET,
      region: 'us-east-2',
    })

    const s3 = new aws.S3();
    const res = await s3.listObjectsV2({
      Bucket: 'fantasybballanalytics',
    }).promise();

    // Getting each file from bucket
    const files = res.Contents.forEach((file) => {
      if (file.Key.endsWith('.json')) {
        let params = {
          Bucket: res.Name,
          Key: file.Key,
        }
        s3.getObject(params, (err, data) => {
          if (err) {
            return err;
          }

          // Creating routes for frontend to access json files
          const json_name = path.basename(file.Key, '.json');
          const json_data = data.Body.toString('utf-8');

          app.get(`/api/${json_name}`, (req, res) => {
            res.json(json_data);
          })
        });
      }
    })
  } catch (err) {
    console.log('Error: ', err);
  }
  console.log('Retreived AWS S3 data...')
}