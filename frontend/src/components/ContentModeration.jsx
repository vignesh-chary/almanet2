import React, { useState } from 'react';
import { checkContent } from '../utils/contentModeration';
import { toast } from 'react-hot-toast';

const ContentModeration = ({ content, onModerationResult }) => {
    const [isChecking, setIsChecking] = useState(false);

    const handleContentCheck = async () => {
        if (!content) return;

        setIsChecking(true);
        try {
            const result = await checkContent(content);
            
            if (!result.success) {
                toast.error(result.error.message || 'Content failed moderation check');
                onModerationResult?.(false, result.error.details);
                return;
            }

            toast.success('Content passed moderation check');
            onModerationResult?.(true, result.data);
        } catch (error) {
            toast.error('Error checking content');
            onModerationResult?.(false, { error: error.message });
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="content-moderation">
            {isChecking && (
                <div className="flex items-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                    <span>Checking content...</span>
                </div>
            )}
        </div>
    );
};

export default ContentModeration; 