import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ModerationPreferences = () => {
    const [preferences, setPreferences] = useState({
        contentFilterLevel: 'medium'
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Fetch current preferences
        const fetchPreferences = async () => {
            try {
                const response = await axios.get('/api/v1/users/preferences');
                setPreferences(response.data.preferences);
            } catch (error) {
                console.error('Error fetching preferences:', error);
            }
        };
        fetchPreferences();
    }, []);

    const handlePreferenceChange = async (level) => {
        try {
            setIsLoading(true);
            const response = await axios.put('/api/v1/moderation/preferences', {
                contentFilterLevel: level
            });
            setPreferences(response.data.user.preferences);
            toast.success('Preferences updated successfully');
        } catch (error) {
            console.error('Error updating preferences:', error);
            toast.error('Error updating preferences');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="moderation-preferences">
            <h3>Content Filtering Preferences</h3>
            <div className="filter-options">
                <div className="form-check">
                    <input
                        type="radio"
                        className="form-check-input"
                        id="low"
                        name="contentFilterLevel"
                        value="low"
                        checked={preferences.contentFilterLevel === 'low'}
                        onChange={(e) => handlePreferenceChange(e.target.value)}
                        disabled={isLoading}
                    />
                    <label className="form-check-label" htmlFor="low">
                        Low (Show all content)
                    </label>
                </div>
                <div className="form-check">
                    <input
                        type="radio"
                        className="form-check-input"
                        id="medium"
                        name="contentFilterLevel"
                        value="medium"
                        checked={preferences.contentFilterLevel === 'medium'}
                        onChange={(e) => handlePreferenceChange(e.target.value)}
                        disabled={isLoading}
                    />
                    <label className="form-check-label" htmlFor="medium">
                        Medium (Filter inappropriate content)
                    </label>
                </div>
                <div className="form-check">
                    <input
                        type="radio"
                        className="form-check-input"
                        id="high"
                        name="contentFilterLevel"
                        value="high"
                        checked={preferences.contentFilterLevel === 'high'}
                        onChange={(e) => handlePreferenceChange(e.target.value)}
                        disabled={isLoading}
                    />
                    <label className="form-check-label" htmlFor="high">
                        High (Strict filtering)
                    </label>
                </div>
            </div>
        </div>
    );
};

export default ModerationPreferences; 