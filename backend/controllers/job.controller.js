import Job from '../models/job.model.js';
import mongoose from 'mongoose'; 

// Create a new job
export const createJob = async (req, res) => {
  try {
    const { title, description, location, jobType, experienceLevel, position, requirements } = req.body;

    const job = await Job.create({
      title,
      description,
      location,
      jobType,
      experienceLevel,
      position,
      requirements,
      postedBy: req.user._id, 
    });

    res.status(201).json({ message: 'Job created successfully', job }); 
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all jobs (with filtering and pagination) - For general users (optional)


// Get jobs created by the current alumni user
// Get jobs created by the current alumni user
// export const getAlumniJobs = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, search = '', jobType = '', location = '' } = req.query;

//     // Ensure req.user._id is a valid ObjectId
//     if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
//       return res.status(400).json({ message: 'Invalid user ID' });
//     }

//     const query = { postedBy: req.user._id }; 

//     // ... (rest of the filtering logic) 

//     const jobs = await Job.find(query)
//       .skip((page - 1) * limit)
//       .limit(Number(limit))
//       .populate('postedBy', 'name email');

//     const totalJobs = await Job.countDocuments(query);

//     res.status(200).json({ jobs, totalJobs });
//   } catch (error) {
//     console.error('Error fetching jobs:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
export const getAlumniJobs = async (req, res) => {
  try {
    console.log("Fetching jobs for alumni user:", req.user._id);

    // Ensure user ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const jobs = await Job.find({ postedBy: req.user._id })
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 }); // Optional: Sort jobs by creation date

    res.status(200).json({ jobs });
  } catch (error) {
    console.error("Error fetching alumni jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Get all jobs (with filtering and pagination)
export const getAllJobs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      jobType = '', 
      location = '' 
    } = req.query;

    // Build dynamic query object based on provided filters
    const query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

    if (jobType) {
      query.jobType = jobType; // Exact match for job type
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' }; // Case-insensitive location search
    }

    const jobs = await Job.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('postedBy', 'name email'); // Include user details

    const totalJobs = await Job.countDocuments(query);

    res.status(200).json({ jobs, totalJobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
///getJobById

export const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    

    const job = await Job.findById(jobId).populate('postedBy', 'name email');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const hasApplied = job.applications.some(
      (application) => application.email === req.user.email // Assuming user is authenticated
    );

    res.status(200).json({ ...job.toObject(), hasApplied });
    // res.status(200).json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { resume } = req.body;

    const { name, email } = req.user;
    if (!name || !email || !resume) {
      return res.status(400).json({ message: 'Incomplete data provided.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    const hasAlreadyApplied = job.applications.some((app) => app.email === email);

    if (hasAlreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    job.applications.push({ name, email, resume });
    await job.save();

    res.status(200).json({ message: 'Applied successfully.' });
  } catch (error) {
    console.error('Error in applyForJob controller:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete a job
export const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findByIdAndDelete(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Edit Job
export const editJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { title, description, location, jobType, experienceLevel, position, requirements } = req.body;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Ensure only the creator can edit the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this job' });
    }

    // Update the job details
    job.title = title || job.title;
    job.description = description || job.description;
    job.location = location || job.location;
    job.jobType = jobType || job.jobType;
    job.experienceLevel = experienceLevel || job.experienceLevel;
    job.position = position || job.position;
    job.requirements = requirements || job.requirements;

    await job.save();

    res.status(200).json({ message: 'Job updated successfully', job });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Server error' });
  }
};






// export const updateApplicationStatus = async (req, res) => {
//   try {
//     const { jobId, applicantEmail } = req.params;
//     const { status } = req.body;

//     if (!["Accepted", "Rejected"].includes(status)) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     const job = await Job.findById(jobId);

//     if (!job) {
//       return res.status(404).json({ message: "Job not found" });
//     }

//     // Check if the logged-in user is the poster
//     if (req.user._id.toString() !== job.postedBy.toString()) {
//       return res.status(403).json({ message: "Unauthorized to modify this job" });
//     }

//     // Update the applicant's status
//     const application = job.applications.find(
//       (app) => app.email === applicantEmail
//     );

//     if (!application) {
//       return res.status(404).json({ message: "Application not found" });
//     }

//     application.status = status; // Add a "status" field dynamically if not in schema

//     await job.save();

//     res.json({ message: "Application status updated successfully" });
//   } catch (error) {
//     console.error("Error in updateApplicationStatus controller:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };










//first get applied jobs
// export const getAppliedJobs = async (req, res) => {
//   try {
//     const jobs = await Job.find({
//       "applications.email": req.user.email, // Filter by logged-in user's email
//     }).select("title location jobType applications");

//     // Filter only the applicant's data from the job
//     const appliedJobs = jobs.map((job) => ({
//       jobId: job._id,
//       title: job.title,
//       location: job.location,
//       jobType: job.jobType,
//       status: job.applications.find(
//         (app) => app.email === req.user.email
//       )?.status || "Pending",
//     }));

//     res.json(appliedJobs);
//   } catch (error) {
//     console.error("Error in getAppliedJobs controller:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
export const updateApplicationStatus = async (req, res) => {
  try {
    const { jobId, applicantEmail } = req.params;
    const { status } = req.body;

    // Validate status
    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'Accepted' or 'Rejected'." });
    }

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Ensure the logged-in user is the job poster
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to update this job." });
    }

    // Find the applicant's application
    const application = job.applications.find((app) => app.email === applicantEmail);
    if (!application) {
      return res.status(404).json({ message: "Applicant not found for this job." });
    }

    // Update the status
    application.status = status;
    await job.save();

    res.status(200).json({ message: "Application status updated successfully." });
  } catch (error) {
    console.error("Error in updateApplicationStatus controller:", error);
    res.status(500).json({ message: "Server error." });
  }
};








export const getAppliedJobs = async (req, res) => {
  try {
    const appliedJobs = await Job.aggregate([
      {
        $match: { "applications.email": req.user.email }, // Match jobs where the user has applied
      },
      {
        $project: {
          _id: 1,
          title: 1,
          location: 1,
          jobType: 1,
          applications: {
            $filter: {
              input: "$applications",
              as: "app",
              cond: { $eq: ["$$app.email", req.user.email] }, // Filter only the logged-in user's application
            },
          },
        },
      },
      {
        $unwind: "$applications", // Extract the application object
      },
      {
        $project: {
          jobId: "$_id",
          title: 1,
          location: 1,
          jobType: 1,
          status: "$applications.status", // Get status of the application
        },
      },
    ]);

    res.status(200).json(appliedJobs);
  } catch (error) {
    console.error("Error in getAppliedJobs controller:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// export const getAppliedJobs = async (req, res) => {
//   try {
//     const appliedJobs = await Job.aggregate([
//       {
//         $match: { "applications.email": req.user.email }, // Match jobs where user has applied
//       },
//       {
//         $project: {
//           _id: 1,
//           title: 1,
//           location: 1,
//           jobType: 1,
//           applications: {
//             $filter: {
//               input: "$applications",
//               as: "app",
//               cond: { $eq: ["$$app.email", req.user.email] }, // Filter only the logged-in user's application
//             },
//           },
//         },
//       },
//       {
//         $unwind: "$applications", // Extract the application object
//       },
//       {
//         $project: {
//           jobId: "$_id",
//           title: 1,
//           location: 1,
//           jobType: 1,
//           status: "$applications.status", // Get status of the application
//         },
//       },
//     ]);

//     res.json(appliedJobs);
//   } catch (error) {
//     console.log("Error in getAppliedJobs controller:", error);
//     console.error("Error in getAppliedJobs controller:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };








// export const getAppliedJobs = async (req, res) => {
//   try {
//     // Use aggregation pipeline to efficiently filter and project data
//     const pipeline = [
//       {
//         $match: {
//           "applications.email": req.user.email, // Filter by logged-in user's email
//         },
//       },
//       {
//         $project: {
//           _id: 1, // Include _id field for applied jobs
//           title: 1,
//           location: 1,
//           jobType: 1,
//           applications: 1,
//         },
//       },
//       {
//         $lookup: {
//           from: "users", // Lookup user collection to get applicant data
//           localField: "applications.email", // Match email in applications with user email
//           foreignField: "email",
//           as: "applicant",
//         },
//       },
//       {
//         $unwind: "$applicant", // Unwind the applicant array to access user data
//       },
//       {
//         $project: {
//           jobId: "$_id", // Maintain jobId for consistency
//           title: 1,
//           location: 1,
//           jobType: 1,
//           status: "$applications.status", // Access application status directly
//           appliedBy: "$applicant.name", // Add appliedBy field from user data
//         },
//       },
//     ];

//     const appliedJobs = await Job.aggregate(pipeline);

//     res.json(appliedJobs);
//   } catch (error) {
//     console.error("Error in getAppliedJobs controller:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
//second applied jobs
// export const getAppliedJobs = async (req, res) => {
//   try {
//     // Ensure user is authenticated (if applicable in your application)
//     if (!req.user) {
//       return res.status(401).json({ message: 'Unauthorized access' });
//     }

//     const appliedJobs = await Job.find({
//       "applications.email": req.user.email, // Filter by logged-in user's email
//     })
//       .select("title location jobType applications") // Select relevant job fields
//       .populate('postedBy', 'name email'); // Include basic info about the job poster (optional)

//     // Filter and format appliedJobs data (if necessary)
//     const formattedAppliedJobs = appliedJobs.map((job) => {
//       const application = job.applications.find((app) => app.email === req.user.email);
//       return {
//         jobId: job._id,
//         title: job.title,
//         location: job.location,
//         jobType: job.jobType,
//         status: application?.status || "Pending", // Use optional chaining for status
//         postedBy: job.postedBy?.name || "", // Include poster name if populated (optional)
//       };
//     });

//     res.json(formattedAppliedJobs);
//   } catch (error) {
//     console.error("Error in getAppliedJobs controller:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
export const getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId)
      .populate('postedBy', 'name email') 
      .select('applications'); 

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if the current user is the job poster
    if (job.postedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to view applicants for this job' });
    }

    res.status(200).json(job.applications); 
  } catch (error) {
    console.error('Error fetching job applicants:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

