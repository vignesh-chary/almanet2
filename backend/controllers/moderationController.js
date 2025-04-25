import Post from '../models/post.model.js';
import User from '../models/user.model.js';

export const moderateContent = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { action, reason } = req.body;
        const moderatorId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (commentId) {
            // Moderate a specific comment
            const comment = post.comments.id(commentId);
            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            if (action === 'flag') {
                comment.moderationStatus = {
                    isFlagged: true,
                    flaggedAt: new Date(),
                    reasons: [reason],
                    moderatedBy: moderatorId
                };
            } else if (action === 'unflag') {
                comment.moderationStatus = {
                    isFlagged: false,
                    reasons: [],
                    moderatedBy: moderatorId
                };
            }
        } else {
            // Moderate the post itself
            if (action === 'flag') {
                post.moderationStatus = {
                    isFlagged: true,
                    flaggedAt: new Date(),
                    reasons: [reason],
                    moderatedBy: moderatorId
                };
            } else if (action === 'unflag') {
                post.moderationStatus = {
                    isFlagged: false,
                    reasons: [],
                    moderatedBy: moderatorId
                };
            }
        }

        await post.save();
        res.json({ message: 'Content moderated successfully', post });
    } catch (error) {
        console.error('Error in content moderation:', error);
        res.status(500).json({ message: 'Error moderating content' });
    }
};

export const getModeratedContent = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status === 'flagged' 
            ? { 'moderationStatus.isFlagged': true }
            : { 'moderationStatus.isFlagged': false };

        const posts = await Post.find(query)
            .populate('author', 'name profilePicture')
            .populate('moderationStatus.moderatedBy', 'name')
            .sort({ 'moderationStatus.flaggedAt': -1 });

        res.json(posts);
    } catch (error) {
        console.error('Error fetching moderated content:', error);
        res.status(500).json({ message: 'Error fetching moderated content' });
    }
};

export const updateUserModerationPreferences = async (req, res) => {
    try {
        const { contentFilterLevel } = req.body;
        const userId = req.user._id;

        const user = await User.findByIdAndUpdate(
            userId,
            { 'preferences.contentFilterLevel': contentFilterLevel },
            { new: true }
        );

        res.json({ message: 'Moderation preferences updated', user });
    } catch (error) {
        console.error('Error updating moderation preferences:', error);
        res.status(500).json({ message: 'Error updating preferences' });
    }
}; 