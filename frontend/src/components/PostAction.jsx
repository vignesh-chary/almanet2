import { useState } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export default function PostAction({ icon, text, onClick, isCommentAction }) {
	const [isChecking, setIsChecking] = useState(false);

	const checkContent = async (content) => {
		try {
			const response = await axiosInstance.post("/moderation/test-moderation", {
				content
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

	const handleClick = async (e) => {
		if (!isCommentAction) {
			onClick(e);
			return;
		}

		try {
			setIsChecking(true);
			const moderationResult = await checkContent(e.target.value);
			
			if (!moderationResult.success) {
				toast.error(moderationResult.error.message || "Comment failed moderation check");
				return;
			}

			onClick(e);
		} catch (error) {
			toast.error("Error checking content");
		} finally {
			setIsChecking(false);
		}
	};

	return (
		<button 
			className='flex items-center' 
			onClick={handleClick}
			disabled={isChecking}
		>
			<span className='mr-1'>{icon}</span>
			<span className='hidden sm:inline'>{text}</span>
			{isChecking && (
				<div className="ml-2">
					<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
				</div>
			)}
		</button>
	);
}
