const path = require('path');
const aws = require('aws-sdk');
const express = require('express');
const router = express.Router();
require('dotenv').config();

// Starting server with express
const app = express();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
app.use(express.static('public'));

get_AWS_S3_data()

// Connecting to AWS-S3
async function get_AWS_S3_data() {
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

    // Getting each file 
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

          const json_name = path.basename(file.Key, '.json');
          const json_data = data.Body.toString('utf-8');

          app.get(`/api/${json_name}`, (req, res) => {
            res.json(json_data);
          })
        });
      }
    })
  } catch (e) {
    console.log('Error: ', e);
  }
}