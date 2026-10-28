import Comment from '../models/Comment.js';

export const getComments = async (req, res) => {
  try {
    const { eventId } = req.query;
    const query = eventId ? { eventId } : {};

    const comments = await Comment.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve discussions.',
      error: error.message
    });
  }
};

export const createComment = async (req, res) => {
  try {
    const { content, eventId } = req.body;
    const user = req.user;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty.'
      });
    }

    const comment = new Comment({
      eventId: eventId || null,
      userId: user._id,
      authorName: user.name || 'Executive Leader',
      authorPosition: user.position || 'C-Suite Executive',
      authorCompany: user.company || '',
      authorImage: user.profileImage || '',
      content: content.trim()
    });

    await comment.save();

    return res.status(201).json({
      success: true,
      message: 'Insight posted successfully.',
      data: comment
    });
  } catch (error) {
    console.error('[createComment Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to post insight.',
      error: error.message
    });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.'
      });
    }

    comment.likes += 1;
    await comment.save();

    return res.status(200).json({
      success: true,
      likes: comment.likes
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to endorse comment.',
      error: error.message
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.'
      });
    }

    // Must be author or admin
    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to remove this comment.'
      });
    }

    await Comment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Comment removed.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete comment.',
      error: error.message
    });
  }
};
