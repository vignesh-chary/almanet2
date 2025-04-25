import { useState } from "react";

const AboutSection = ({ userData, isOwnProfile, onSave, isDarkMode }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [about, setAbout] = useState(userData.about || "");

	const handleSave = () => {
		setIsEditing(false);
		onSave({ about });
	};
	return (
		<div className={`${isDarkMode ? 'bg-background-dark' : 'bg-white'} shadow rounded-lg p-6 mb-6`}>
			<h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>About</h2>
			{isOwnProfile && (
				<>
					{isEditing ? (
						<>
							<textarea
								value={about}
								onChange={(e) => setAbout(e.target.value)}
								className={`w-full p-2 border rounded ${isDarkMode ? 'bg-background-dark text-text-dark border-border-dark' : 'bg-white text-text border-border'}`}
								rows='4'
							/>
							<button
								onClick={handleSave}
								className='mt-2 bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300'
							>
								Save
							</button>
						</>
					) : (
						<>
							<p className={isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'}>{userData.about}</p>
							<button
								onClick={() => setIsEditing(true)}
								className={`mt-2 ${isDarkMode ? 'text-primary-dark' : 'text-primary'} hover:text-primary-dark transition duration-300`}
							>
								Edit
							</button>
						</>
					)}
				</>
			)}
		</div>
	);
};
export default AboutSection;
