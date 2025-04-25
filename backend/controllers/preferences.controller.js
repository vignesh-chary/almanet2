import User from '../models/user.model.js';

// Get user theme preference
export const getThemePreference = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            darkMode: user.preferences?.darkMode || false
        });
    } catch (error) {
        console.error('Error getting theme preference:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update user theme preference
export const updateThemePreference = async (req, res) => {
    try {
        const { darkMode } = req.body;
        
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize preferences object if it doesn't exist
        if (!user.preferences) {
            user.preferences = {};
        }

        user.preferences.darkMode = darkMode;
        await user.save();

        res.json({
            darkMode: user.preferences.darkMode
        });
    } catch (error) {
        console.error('Error updating theme preference:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};