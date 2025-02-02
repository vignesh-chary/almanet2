import React from "react";

const categories = ["IT", "Marketing", "Finance", "Healthcare", "Education"];

const JobCategoryCarousel = ({ selectedCategory, setSelectedCategory }) => {
	return (
		<div className="overflow-x-auto flex space-x-4 py-2">
			{categories.map((category) => (
				<button
					key={category}
					onClick={() => setSelectedCategory(category)}
					className={`btn ${
						selectedCategory === category ? "btn-primary" : "btn-outline"
					}`}
				>
					{category}
				</button>
			))}
		</div>
	);
};

export default JobCategoryCarousel;
