import mongoose from 'mongoose';

// Project Schema
const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 200
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'mentor', 'observer'],
      default: 'member'
    },
    permissions: {
      canEditProject: { type: Boolean, default: false },
      canManageMembers: { type: Boolean, default: false },
      canCreateTasks: { type: Boolean, default: true },
      canAssignTasks: { type: Boolean, default: false }
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  category: {
    type: String,
    enum: ['Software Development', 'Research', 'Business', 'Design', 'Engineering', 'Other'],
    default: 'Other'
  },
  tags: [String],
  status: {
    type: String,
    enum: ['Planning', 'In Progress', 'On Hold', 'Completed', 'Archived'],
    default: 'Planning'
  },
  visibility: {
    type: String,
    enum: ['Private', 'Team', 'Public'],
    default: 'Team'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Reference to related collections
  taskGroups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaskGroup'
  }],
  pendingInvites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamInvite'
  }],
  // Small collections can remain embedded
  milestones: [{
    title: { type: String, required: true },
    description: String,
    dueDate: Date,
    completed: { type: Boolean, default: false },
    completedAt: Date
  }],
  files: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String },
    size: { type: Number }, // in bytes
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Tasks schema
  tasks: [{
    title: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ['Todo', 'In Progress', 'Done'],
      default: 'Todo'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: Date,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Messages schema
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    file: {
      name: String,
      url: String,
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Project metrics
  metrics: {
    tasksCompleted: { type: Number, default: 0 },
    tasksTotal: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 }, // in minutes
    lastActivityDate: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating days remaining
projectSchema.virtual('daysRemaining').get(function() {
  const today = new Date();
  const endDate = new Date(this.endDate);
  const diffTime = Math.abs(endDate - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return endDate >= today ? diffDays : 0;
});

// Method to check if a user is a member of the project
projectSchema.methods.isMember = function(userId) {
  return this.teamMembers.some(member => 
    member.user.toString() === userId.toString()
  );
};

// Method to check if a user has specific permissions
projectSchema.methods.hasPermission = function(userId, permission) {
  const member = this.teamMembers.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!member) return false;
  
  // Admin and owner have all permissions
  if (member.role === 'admin' || this.owner.toString() === userId.toString()) {
    return true;
  }
  
  return member.permissions[permission] === true;
};

// Middleware to update project progress when saved
projectSchema.pre('save', async function(next) {
  if (this.isModified('metrics.tasksCompleted') || this.isModified('metrics.tasksTotal')) {
    if (this.metrics.tasksTotal > 0) {
      this.progress = Math.round((this.metrics.tasksCompleted / this.metrics.tasksTotal) * 100);
    } else {
      this.progress = 0;
    }
  }
  next();
});

// Indexes for better query performance
projectSchema.index({ title: 'text', description: 'text', tags: 'text' });
projectSchema.index({ 'teamMembers.user': 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ visibility: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;