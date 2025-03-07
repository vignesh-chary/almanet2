// import React from "react";
// import { useQuery } from "@tanstack/react-query";
// import { axiosInstance } from "../../lib/axios";

// const fetchGoalProgress = async (goalId) => {
//   const { data } = await axiosInstance.get(`/mentorships/goals/${goalId}/progress`);
//   return data;
// };

// const GoalProgress = ({ goalId }) => {
//   const { data: progress, isLoading, isError } = useQuery({
//     queryKey: ["goalProgress", goalId],
//     queryFn: () => fetchGoalProgress(goalId),
//     enabled: !!goalId,
//   });

//   if (isLoading) return <div>Loading progress...</div>;
//   if (isError) return <div>Error: {isError.message}</div>;

//   return (
//     <div>
//       <h4>Progress</h4>
//       <div style={{ width: "100%", backgroundColor: "#e0e0e0", borderRadius: "5px" }}>
//         <div
//           style={{
//             width: `${progress.progress}%`,
//             backgroundColor: "#76c7c0",
//             height: "10px",
//             borderRadius: "5px",
//           }}
//         ></div>
//       </div>
//       <p>{progress.progress}% completed</p>
//     </div>
//   );
// };

// export default GoalProgress;