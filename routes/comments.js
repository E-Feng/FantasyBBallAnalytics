const express = require('express');
const router = express.Router();
const comment = require('../controllers/comments');

router.route('/').get(comment.getComments).post(comment.addComments);

module.exports = router;