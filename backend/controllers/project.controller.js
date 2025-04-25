import Project from '../models/project.model.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import { io } from '../lib/socket.js';
import mongoose from 'mongoose';

// Create a new project
export const createProject = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    const project = new Project({
      title,
      description,
      owner: req.user._id,
      startDate,
      endDate,
      teamMembers: [{ user: req.user._id, role: 'admin' }]
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all projects
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'teamMembers.user': req.user._id }
      ]
    })
    .populate('owner', 'name profilePicture')
    .populate('teamMembers.user', 'name profilePicture')
    .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single project
export const getProject = async (req, res) => {
  try {
    console.log('Fetching project with ID:', req.params.id);
    console.log('User ID:', req.user._id);

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid project ID format:', req.params.id);
      return res.status(400).json({ message: 'Invalid project ID format' });
    }

    const project = await Project.findById(req.params.id)
      .populate('owner', 'name profilePicture')
      .populate('teamMembers.user', 'name profilePicture')
      .populate('tasks.assignedTo', 'name profilePicture')
      .populate('messages.sender', 'name profilePicture');
    
    if (!project) {
      console.log('Project not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to the project
    const hasAccess = project.owner._id.equals(req.user._id) ||
      project.teamMembers.some(member => member.user._id.equals(req.user._id));

    if (!hasAccess) {
      console.log('Access denied for user:', req.user._id);
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('Successfully fetched project:', project._id);
    res.json(project);
  } catch (error) {
    console.error('Error in getProject:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is project owner or admin
    const isOwner = project.owner.equals(req.user._id);
    const isAdmin = project.teamMembers.some(
      member => member.user.equals(req.user._id) && member.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(project, req.body);
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project owner can delete
    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await project.remove();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add team member
export const addTeamMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is project owner or admin
    const isOwner = project.owner.equals(req.user._id);
    const isAdmin = project.teamMembers.some(
      member => member.user.equals(req.user._id) && member.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { userId, role } = req.body;

    // Check if user is already a team member
    if (project.teamMembers.some(member => member.user.equals(userId))) {
      return res.status(400).json({ message: 'User is already a team member' });
    }

    project.teamMembers.push({ user: userId, role: role || 'member' });
    await project.save();

    // Emit socket event for real-time update
    io.to(project._id.toString()).emit('team-member-added', {
      projectId: project._id,
      userId,
      role: role || 'member'
    });

    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove team member
export const removeTeamMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is project owner or admin
    const isOwner = project.owner.equals(req.user._id);
    const isAdmin = project.teamMembers.some(
      member => member.user.equals(req.user._id) && member.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const userId = req.params.userId;

    // Cannot remove project owner
    if (project.owner.equals(userId)) {
      return res.status(400).json({ message: 'Cannot remove project owner' });
    }

    project.teamMembers = project.teamMembers.filter(
      member => !member.user.equals(userId)
    );
    await project.save();

    // Emit socket event for real-time update
    io.to(project._id.toString()).emit('team-member-removed', {
      projectId: project._id,
      userId
    });

    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add task
export const addTask = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to the project
    const hasAccess = project.owner.equals(req.user._id) ||
      project.teamMembers.some(member => member.user.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const task = {
      ...req.body,
      createdAt: new Date()
    };

    project.tasks.push(task);
    await project.save();

    // Emit socket event for real-time update
    io.to(project._id.toString()).emit('new-task', {
      projectId: project._id,
      task
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to the project
    const hasAccess = project.owner.equals(req.user._id) ||
      project.teamMembers.some(member => member.user.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const task = project.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = req.body.status;
    await project.save();

    // Emit socket event for real-time update
    io.to(project._id.toString()).emit('update-task', {
      projectId: project._id,
      taskId: task._id,
      status: task.status
    });

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to the project
    const hasAccess = project.owner.equals(req.user._id) ||
      project.teamMembers.some(member => member.user.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const message = {
      sender: req.user._id,
      content: req.body.content,
      createdAt: new Date()
    };

    if (req.file) {
      // Upload file to Cloudinary
      const fileUrl = await uploadToCloudinary(req.file);
      message.file = {
        name: req.file.originalname,
        url: fileUrl,
        type: req.file.mimetype
      };
    }

    project.messages.push(message);
    await project.save();

    // Emit socket event for real-time update
    io.to(project._id.toString()).emit('new-message', {
      projectId: project._id,
      message
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Upload file
export const uploadFile = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to the project
    const hasAccess = project.owner.equals(req.user._id) ||
      project.teamMembers.some(member => member.user.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload file to Cloudinary
    const fileUrl = await uploadToCloudinary(req.file);

    const file = {
      name: req.file.originalname,
      url: fileUrl,
      type: req.file.mimetype,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };

    project.files.push(file);
    await project.save();

    // Emit socket event for real-time update
    io.to(project._id.toString()).emit('new-file', {
      projectId: project._id,
      file
    });

    res.status(201).json(file);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete file
export const deleteFile = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to the project
    const hasAccess = project.owner.equals(req.user._id) ||
      project.teamMembers.some(member => member.user.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const file = project.files.id(req.params.fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete file from Cloudinary
    await deleteFromCloudinary(file.url);

    file.remove();
    await project.save();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 