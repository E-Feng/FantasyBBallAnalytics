const path = require('path');
const aws = require('aws-sdk');
const express = require('express');
const router = express.Router();
const connectDB = require('./config/db');
require('dotenv').config({path: './config/.env'});

// Params
const useAWS = false;

// Starting server with express
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.listen(PORT, () => console.log(`Running on port ${PORT}`));

// Routes
app.use(express.json());
app.use('/comments/', require('./routes/comments'));

connectDB();

// Getting data from AWS and setting routes, if not return default JSON
if (useAWS) {
  getAWSS3data()
} else {
  app.get('/api/*', (req, res) => {
    res.json(JSON.stringify({msg: 'For Testing'}));
  })
}

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