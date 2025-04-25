import Job from '../models/job.model.js';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import { getJobRecommendations as getJobRecommendationsFromService } from '../services/recommendationService.js';

// Create a new job
export const createJob = async (req, res) => {
  try {
    const { title, description, location, jobType, experienceLevel, position, salary, requirements } = req.body;

    const job = await Job.create({
      title,
      description,
      location,
      jobType,
      experienceLevel,
      position,
      salary: Number(salary),
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
      experienceLevel = '',
      location = '',
      salaryRange = ''
    } = req.query;

    console.log("Received query parameters:", {
      page,
      limit,
      search,
      jobType,
      experienceLevel,
      location,
      salaryRange
    });

    // Build dynamic query object based on provided filters
    const query = {};

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
      console.log("Search query:", query.$or);
    }

    // Filter by job type (case-insensitive)
    if (jobType) {
      query.jobType = { $regex: new RegExp(`^${jobType}$`, 'i') };
      console.log("Job type filter:", jobType);
    }

    // Filter by experience level
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
      console.log("Experience level filter:", experienceLevel);
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
      console.log("Location filter:", location);
    }

    // Filter by salary range
    if (salaryRange) {
      const [min, max] = salaryRange.split('-').map(Number);
      if (max) {
        query.salary = { $gte: min, $lte: max };
      } else {
        query.salary = { $gte: min };
      }
      console.log("Salary range filter:", query.salary);
    }

    console.log("Final query object:", JSON.stringify(query, null, 2));

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(query);
    console.log("Total jobs matching query:", totalJobs);

    // Get paginated results
    const jobs = await Job.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 }); // Sort by newest first

    console.log("Found jobs:", jobs.length);
    console.log("Sample job data:", jobs.length > 0 ? JSON.stringify(jobs[0], null, 2) : "No jobs found");

    // Log all jobs in the database to verify data exists
    const allJobs = await Job.find({});
    console.log("Total jobs in database:", allJobs.length);
    console.log("Sample of all jobs:", allJobs.length > 0 ? JSON.stringify(allJobs[0], null, 2) : "No jobs in database");

    res.status(200).json({ 
      jobs, 
      totalJobs,
      currentPage: Number(page),
      totalPages: Math.ceil(totalJobs / limit)
    });
  } catch (error) {
    console.error('Error in getAllJobs controller:', error);
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
    const { title, description, location, jobType, experienceLevel, position, salary, requirements } = req.body;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Ensure only the creator can edit the job
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this job' });
    }

    // Update the job details with proper validation
    job.title = title || job.title;
    job.description = description || job.description;
    job.location = location || job.location;
    job.jobType = jobType || job.jobType;
    job.experienceLevel = experienceLevel || job.experienceLevel;
    job.position = position || job.position;
    job.salary = salary !== undefined ? Number(salary) : job.salary;
    job.requirements = Array.isArray(requirements) ? requirements : job.requirements;

    // Validate the job before saving
    try {
      await job.validate();
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationError.errors 
      });
    }

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
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const appliedJobs = await Job.aggregate([
      {
        $match: { "applications.email": req.user.email },
      },
      {
        $lookup: {
          from: "users",
          localField: "postedBy",
          foreignField: "_id",
          as: "postedBy"
        }
      },
      {
        $unwind: "$postedBy"
      },
      {
        $project: {
          _id: 1,
          title: 1,
          location: 1,
          jobType: 1,
          company: "$postedBy.name",
          applications: {
            $filter: {
              input: "$applications",
              as: "app",
              cond: { $eq: ["$$app.email", req.user.email] },
            },
          },
        },
      },
      {
        $unwind: "$applications",
      },
      {
        $project: {
          jobId: "$_id",
          title: 1,
          location: 1,
          jobType: 1,
          company: 1,
          status: "$applications.status",
          appliedAt: "$applications.appliedAt",
        },
      },
      {
        $sort: { appliedAt: -1 } // Sort by most recent applications first
      }
    ]);

    console.log("Fetched applied jobs:", appliedJobs); // Debug log

    res.status(200).json(appliedJobs);
  } catch (error) {
    console.error("Error in getAppliedJobs controller:", error);
    res.status(500).json({ message: "Server error." });
  }
};

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

// Get job recommendations for the current user
export const getJobRecommendations = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userId = req.user._id;
    const user = await User.findById(userId).select('skills experience education location');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all active jobs
    const jobs = await Job.find({})
      .populate('postedBy', 'name email')
      .select('title description location jobType experienceLevel position requirements');

    if (!jobs || jobs.length === 0) {
      return res.status(200).json({
        success: true,
        recommendations: []
      });
    }

    // Calculate match scores for each job
    const recommendations = jobs.map(job => {
      let matchScore = 0;
      let matchDetails = {
        skillsMatch: 0,
        experienceMatch: 0,
        educationMatch: 0
      };

      // Skills matching (40% weight)
      if (user.skills && job.requirements && job.requirements.length > 0) {
        const matchingSkills = user.skills.filter(skill =>
          job.requirements.some(req =>
            req.toLowerCase().includes(skill.toLowerCase())
          )
        );
        matchDetails.skillsMatch = matchingSkills.length / job.requirements.length;
        matchScore += matchDetails.skillsMatch * 0.4;
      }

      // Experience matching (30% weight)
      if (user.experience && user.experience.length > 0) {
        const userExperience = user.experience[0]; // Consider most recent experience
        const jobLevel = job.experienceLevel?.toLowerCase() || '';

        // Simple experience level matching
        if (jobLevel === 'entry' && user.experience.length === 0) {
          matchDetails.experienceMatch = 1;
        } else if (jobLevel === 'mid' && user.experience.length >= 1) {
          matchDetails.experienceMatch = 1;
        } else if (jobLevel === 'senior' && user.experience.length >= 3) {
          matchDetails.experienceMatch = 1;
        }
        matchScore += matchDetails.experienceMatch * 0.3;
      }

      // Education matching (20% weight)
      if (user.education && user.education.length > 0 && job.requirements) {
        const userEducation = user.education[0]; // Consider highest education
        const jobRequirements = job.requirements.join(' ').toLowerCase();

        // Check if field of study matches job requirements
        if (userEducation.fieldOfStudy &&
          jobRequirements.includes(userEducation.fieldOfStudy.toLowerCase())) {
          matchDetails.educationMatch = 1;
        }
        matchScore += matchDetails.educationMatch * 0.2;
      }

      // Location matching (10% weight)
      if (user.location && job.location) {
        const locationMatch = user.location.toLowerCase() === job.location.toLowerCase() ? 1 : 0;
        matchScore += locationMatch * 0.1;
      }

      return {
        job: {
          _id: job._id,
          title: job.title,
          description: job.description,
          location: job.location,
          jobType: job.jobType,
          experienceLevel: job.experienceLevel,
          position: job.position,
          requirements: job.requirements,
          postedBy: job.postedBy
        },
        matchScore,
        matchDetails
      };
    });

    // Sort by match score and return top 3
    const topRecommendations = recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    res.status(200).json({
      success: true,
      recommendations: topRecommendations
    });
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting job recommendations',
      error: error.message
    });
  }
};

