import axios from 'axios';

export const checkContent = async (content) => {
    try {
        const response = await axios.post('/api/v1/moderation/test-moderation', {
            content
        }, {
            withCredentials: true
        });
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
}; 