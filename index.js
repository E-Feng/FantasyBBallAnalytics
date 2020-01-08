console.log("Running index.js")

const express = require('express');
const app = express();

app.listen(3000, () => console.log('Running'));
app.use(express.static('public'));