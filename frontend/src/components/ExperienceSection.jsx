import { Briefcase, X } from "lucide-react";
import { useState } from "react";
import { formatDate } from "../utils/dateUtils";

const ExperienceSection = ({ userData, isOwnProfile, onSave, isDarkMode }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [experiences, setExperiences] = useState(userData.experience || []);
	const [newExperience, setNewExperience] = useState({
		title: "",
		company: "",
		startDate: "",
		endDate: "",
		description: "",
		currentlyWorking: false,
	});

	const handleAddExperience = () => {
		if (newExperience.title && newExperience.company && newExperience.startDate) {
			setExperiences([...experiences, { ...newExperience }]);
			setNewExperience({
				title: "",
				company: "",
				startDate: "",
				endDate: "",
				description: "",
				currentlyWorking: false,
			});
		}
	};

	const handleDeleteExperience = (id) => {
		setExperiences(experiences.filter((exp) => exp._id !== id));
	};

	const handleCurrentlyWorkingChange = (e) => {
		setNewExperience({
			...newExperience,
			currentlyWorking: e.target.checked,
			endDate: e.target.checked ? "" : newExperience.endDate,
		});
	};

	const handleSave = () => {
		onSave({ experience: experiences });
		setIsEditing(false);
	};

	return (
		<div className={`${isDarkMode ? 'bg-background-dark' : 'bg-white'} shadow rounded-lg p-6 mb-6`}>
			<h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>Experience</h2>
			{experiences.map((exp) => (
				<div key={exp._id || `${exp.title}-${exp.company}-${exp.startDate}`} className='mb-4 flex justify-between items-start'>
					<div className='flex items-start'>
						<Briefcase size={20} className={`mr-2 mt-1 ${isDarkMode ? 'text-text-dark' : 'text-text'}`} />
						<div>
							<h3 className={`font-semibold ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>{exp.title}</h3>
							<p className={isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'}>{exp.company}</p>
							<p className={`text-sm ${isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'}`}>
								{formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : "Present"}
							</p>
							<p className={isDarkMode ? 'text-text-dark-muted' : 'text-text-muted'}>{exp.description}</p>
						</div>
					</div>
					{isEditing && (
						<button onClick={() => handleDeleteExperience(exp._id)} className={isDarkMode ? 'text-red-400' : 'text-red-500'}>
							<X size={20} />
						</button>
					)}
				</div>
			))}

			{isEditing && (
				<div className='mt-4'>
					<div className='mb-4'>
						<label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>Title</label>
						<input
							type='text'
							placeholder='Title'
							value={newExperience.title}
							onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
							className={`w-full p-2 border rounded mb-2 ${isDarkMode ? 'bg-background-dark text-text-dark border-border-dark' : 'bg-white text-text border-border'}`}
						/>
					</div>
					<div className='mb-4'>
						<label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>Company</label>
						<input
							type='text'
							placeholder='Company'
							value={newExperience.company}
							onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
							className={`w-full p-2 border rounded mb-2 ${isDarkMode ? 'bg-background-dark text-text-dark border-border-dark' : 'bg-white text-text border-border'}`}
						/>
					</div>
					<div className='mb-4'>
						<label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>Start Date</label>
						<input
							type='date'
							value={newExperience.startDate}
							onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
							className={`w-full p-2 border rounded mb-2 ${isDarkMode ? 'bg-background-dark text-text-dark border-border-dark' : 'bg-white text-text border-border'}`}
						/>
					</div>
					<div className='mb-4'>
						<div className='flex items-center mb-2'>
							<input
								type='checkbox'
								id='currentlyWorking'
								checked={newExperience.currentlyWorking}
								onChange={handleCurrentlyWorkingChange}
								className='mr-2'
							/>
							<label htmlFor='currentlyWorking' className={`text-sm font-bold ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>I currently work here</label>
						</div>
						{!newExperience.currentlyWorking && (
							<div>
								<label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>End Date</label>
								<input
									type='date'
									value={newExperience.endDate}
									onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
									className={`w-full p-2 border rounded mb-2 ${isDarkMode ? 'bg-background-dark text-text-dark border-border-dark' : 'bg-white text-text border-border'}`}
								/>
							</div>
						)}
					</div>
					<div className='mb-4'>
						<label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-text-dark' : 'text-text'}`}>Description</label>
						<textarea
							placeholder='Description'
							value={newExperience.description}
							onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
							className={`w-full p-2 border rounded mb-2 ${isDarkMode ? 'bg-background-dark text-text-dark border-border-dark' : 'bg-white text-text border-border'}`}
							rows={3}
						/>
					</div>
					<button
						onClick={handleAddExperience}
						className='bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300'
					>
						Add Experience
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
							Edit Experience
						</button>
					)}
				</>
			)}
		</div>
	);
};

export default ExperienceSection;
