import { X } from "lucide-react";
import { useState } from "react";

const SkillsSection = ({ userData, isOwnProfile, onSave, isDarkMode }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [skills, setSkills] = useState(userData.skills || []);
	const [newSkill, setNewSkill] = useState("");

	const handleAddSkill = () => {
		if (newSkill && !skills.includes(newSkill)) {
			setSkills([...skills, newSkill]);
			setNewSkill("");
		}
	};

	const handleDeleteSkill = (skill) => {
		setSkills(skills.filter((s) => s !== skill));
	};

	const handleSave = () => {
		onSave({ skills });
		setIsEditing(false);
	};

	return (
		<div className={`${isDarkMode ? 'bg-background-dark' : 'bg-white'} shadow rounded-lg p-6`}>
			<h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>Skills</h2>
			<div className='flex flex-wrap gap-2'>
				{skills.map((skill, index) => (
					<span
						key={index}
						className={`${isDarkMode ? 'bg-secondary-dark text-text-dark' : 'bg-secondary text-text'} px-3 py-1 rounded-full text-sm flex items-center`}
					>
						{skill}
						{isEditing && (
							<button onClick={() => handleDeleteSkill(skill)} className={`ml-2 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
								<X size={14} />
							</button>
						)}
					</span>
				))}
			</div>

			{isEditing && (
				<div className='mt-4 flex'>
					<input
						type='text'
						placeholder='New Skill'
						value={newSkill}
						onChange={(e) => setNewSkill(e.target.value)}
						className={`flex-grow p-2 border rounded-l ${isDarkMode ? 'bg-background-dark text-text-dark border-border-dark' : 'bg-white text-text border-border'}`}
					/>
					<button
						onClick={handleAddSkill}
						className='bg-primary text-white py-2 px-4 rounded-r hover:bg-primary-dark transition duration-300'
					>
						Add Skill
					</button>
				</div>
			)}

			{isOwnProfile && (
				<>
					{isEditing ? (
						<button
							onClick={handleSave}
							className='mt-4 bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300'
						>
							Save Changes
						</button>
					) : (
						<button
							onClick={() => setIsEditing(true)}
							className={`mt-4 ${isDarkMode ? 'text-primary-dark' : 'text-primary'} hover:text-primary-dark transition duration-300`}
						>
							Edit Skills
						</button>
					)}
				</>
			)}
		</div>
	);
};
export default SkillsSection;
