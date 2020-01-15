console.log("Running index.js")

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
app.use(express.static('public'));