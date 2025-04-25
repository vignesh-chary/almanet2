import { School, X } from "lucide-react";
import { useState } from "react";

const EducationSection = ({ userData, isOwnProfile, onSave, isDarkMode }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [educations, setEducations] = useState(userData.education || []);
	const [newEducation, setNewEducation] = useState({
		school: "",
		fieldOfStudy: "",
		startYear: "",
		endYear: "",
	});

	const handleAddEducation = () => {
		if (newEducation.school && newEducation.fieldOfStudy && newEducation.startYear) {
			setEducations([...educations, { ...newEducation }]);
			setNewEducation({
				school: "",
				fieldOfStudy: "",
				startYear: "",
				endYear: "",
			});
		}
	};

	const handleDeleteEducation = (id) => {
		setEducations(educations.filter((edu) => edu._id !== id));
	};

	const handleSave = () => {
		onSave({ education: educations });
		setIsEditing(false);
	};

	return (
		<div className={`${isDarkMode ? 'bg-background-dark' : 'bg-white'} shadow rounded-lg p-6 mb-6`}>
			<h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>Education</h2>
			{educations.map((edu) => (
				<div key={edu._id || `${edu.school}-${edu.fieldOfStudy}-${edu.startYear}`} className='mb-4 flex justify-between items-start'>
					<div className='flex items-start'>
						<School size={20} className={`mr-2 mt-1 ${isDarkMode ? 'text-text-dark' : 'text-text'}`} />
						<div>
							<h3 className={`font-semibold ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>{edu.fieldOfStudy}</h3>
							<p className={isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'}>{edu.school}</p>
							<p className={`text-sm ${isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'}`}>
								{edu.startYear} - {edu.endYear || "Present"}
							</p>
						</div>
					</div>
					{isEditing && (
						<button onClick={() => handleDeleteEducation(edu._id)} className={isDarkMode ? 'text-red-400' : 'text-red-500'}>
							<X size={20} />
						</button>
					)}
				</div>
			))}
			{isEditing && (
				<div className='space-y-2'>
					<input
						type='text'
						placeholder='School'
						value={newEducation.school}
						onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
						className={`w-full p-2 border rounded mb-2 ${isDarkMode ? 'bg-background-dark text-text-dark border-border-dark' : 'bg-white text-text border-border'}`}
					/>
					<input
						type='text'
						placeholder='Field of Study'
						value={newEducation.fieldOfStudy}
						onChange={(e) => setNewEducation({ ...newEducation, fieldOfStudy: e.target.value })}
						className={`w-full p-2 border rounded mb-2 ${isDarkMode ? 'bg-background-dark text-text-dark border-border-dark' : 'bg-white text-text border-border'}`}
					/>
					<input
						type='number'
						placeholder='Start Year'
						value={newEducation.startYear}
						onChange={(e) => setNewEducation({ ...newEducation, startYear: e.target.value })}
						className={`w-full p-2 border rounded mb-2 ${isDarkMode ? 'bg-background-dark text-text-dark border-border-dark' : 'bg-white text-text border-border'}`}
					/>
					<input
						type='number'
						placeholder='End Year'
						value={newEducation.endYear}
						onChange={(e) => setNewEducation({ ...newEducation, endYear: e.target.value })}
						className={`w-full p-2 border rounded mb-2 ${isDarkMode ? 'bg-background-dark text-text-dark border-border-dark' : 'bg-white text-text border-border'}`}
					/>
					<button
						onClick={handleAddEducation}
						className='bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300'
					>
						Add Education
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
							Edit Education
						</button>
					)}
				</>
			)}
		</div>
	);
};
export default EducationSection;
