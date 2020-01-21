const Comment = require('../models/Comment');

// @desc Get all comments
// @route GET /comments/
// @access Public
exports.getComments = async (req, res, next) => {
  try {
    let comments = await Comment.find();

    // Sort comments by created time (incase mongoose doesnt sort)
    const toSort = false;
    if (toSort) {
      comments = comments.sort((a,b) => (a.createdAt > b.createdAt ? 1 : -1));
    }

    // Remove collections after >400 (free mongodb limintations)
    if (comments.length > 400) {
      const to_delete = comments.length - 400;
    }

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: 'Server Error'
    });
  }
}

// @desc Adds a comment
// @route POST /comments/
// access Public
exports.addComments = async (req, res, next) => {
  try {
    if (req.body.comment) {
      const comment = await Comment.create(req.body);
      
      return res.status(201).json({
        success: true,
        data: comment
      });
    } else {
      return res.status(500).json({
        error: 'Enter a comment'
      })
    }

  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message
    });
  }
}