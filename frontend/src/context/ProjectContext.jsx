import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import { useSocket } from './SocketContext';
import { useAuth } from '../hooks/useAuth';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { data: authUser } = useAuth();
  const [currentProject, setCurrentProject] = useState(null);
  const socket = useSocket();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["userProjects", authUser?.id],
    queryFn: async () => {
      if (!authUser?.id) return [];
      try {
        const res = await axiosInstance.get(`/projects/user/${authUser.id}`);
        return res.data;
      } catch (err) {
        return [];
      }
    },
    enabled: !!authUser?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1
  });

  useEffect(() => {
    if (!socket || !authUser) return;

    // Join project room when current project changes
    if (currentProject) {
      socket.emit("join-project", {
        projectId: currentProject._id,
        userId: authUser._id,
      });
    }

    // Socket event handlers
    const handleTeamMemberAdded = (data) => {
      queryClient.setQueryData(["userProjects", authUser.id], (old) =>
        old.map((project) =>
          project._id === data.projectId
            ? {
                ...project,
                team: [...project.team, data.member],
              }
            : project
        )
      );
    };

    const handleTeamMemberRemoved = (data) => {
      queryClient.setQueryData(["userProjects", authUser.id], (old) =>
        old.map((project) =>
          project._id === data.projectId
            ? {
                ...project,
                team: project.team.filter(
                  (member) => member._id !== data.memberId
                ),
              }
            : project
        )
      );
    };

    const handleNewTask = (data) => {
      queryClient.setQueryData(["userProjects", authUser.id], (old) =>
        old.map((project) =>
          project._id === data.projectId
            ? {
                ...project,
                tasks: [...project.tasks, data.task],
              }
            : project
        )
      );
    };

    const handleTaskUpdated = (data) => {
      queryClient.setQueryData(["userProjects", authUser.id], (old) =>
        old.map((project) =>
          project._id === data.projectId
            ? {
                ...project,
                tasks: project.tasks.map((task) =>
                  task._id === data.task._id ? data.task : task
                ),
              }
            : project
        )
      );
    };

    const handleNewMessage = (data) => {
      queryClient.setQueryData(["userProjects", authUser.id], (old) =>
        old.map((project) =>
          project._id === data.projectId
            ? {
                ...project,
                messages: [...project.messages, data.message],
              }
            : project
        )
      );
    };

    const handleFileUploaded = (data) => {
      queryClient.setQueryData(["userProjects", authUser.id], (old) =>
        old.map((project) =>
          project._id === data.projectId
            ? {
                ...project,
                files: [...project.files, data.file],
              }
            : project
        )
      );
    };

    // Listen for socket events
    socket.on("team-member-added", handleTeamMemberAdded);
    socket.on("team-member-removed", handleTeamMemberRemoved);
    socket.on("new-task", handleNewTask);
    socket.on("task-updated", handleTaskUpdated);
    socket.on("new-message", handleNewMessage);
    socket.on("file-uploaded", handleFileUploaded);

    // Cleanup
    return () => {
      if (currentProject) {
        socket.emit("leave-project", {
          projectId: currentProject._id,
          userId: authUser._id,
        });
      }
      socket.off("team-member-added", handleTeamMemberAdded);
      socket.off("team-member-removed", handleTeamMemberRemoved);
      socket.off("new-task", handleNewTask);
      socket.off("task-updated", handleTaskUpdated);
      socket.off("new-message", handleNewMessage);
      socket.off("file-uploaded", handleFileUploaded);
    };
  }, [socket, currentProject, authUser, queryClient]);

  const createProject = async (projectData) => {
    try {
      const response = await axiosInstance.post("/api/v1/projects", projectData);
      queryClient.setQueryData(["userProjects", authUser.id], (old) => [...old, response.data.data.project]);
      return response.data.data.project;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const getProject = async (projectId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/projects/${projectId}`);
      setCurrentProject(response.data.data.project);
      return response.data.data.project;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const updateProject = async (projectId, projectData) => {
    try {
      const response = await axiosInstance.patch(
        `/api/v1/projects/${projectId}`,
        projectData
      );
      queryClient.setQueryData(["userProjects", authUser.id], (old) =>
        old.map((project) =>
          project._id === projectId ? response.data.data.project : project
        )
      );
      if (currentProject?._id === projectId) {
        setCurrentProject(response.data.data.project);
      }
      return response.data.data.project;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await axiosInstance.delete(`/api/v1/projects/${projectId}`);
      queryClient.setQueryData(["userProjects", authUser.id], (old) =>
        old.filter((project) => project._id !== projectId)
      );
      if (currentProject?._id === projectId) {
        setCurrentProject(null);
      }
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const addTeamMember = async (projectId, userId) => {
    try {
      const response = await axiosInstance.post(
        `/api/v1/projects/${projectId}/team`,
        { userId }
      );
      queryClient.setQueryData(["userProjects", authUser.id], (old) =>
        old.map((project) =>
          project._id === projectId
            ? {
                ...project,
                team: [...project.team, response.data.data.member],
              }
            : project
        )
      );
      if (currentProject?._id === projectId) {
        setCurrentProject((prev) => ({
          ...prev,
          team: [...prev.team, response.data.data.member],
        }));
      }
      return response.data.data.member;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const removeTeamMember = async (projectId, userId) => {
    try {
      await axiosInstance.delete(`/api/v1/projects/${projectId}/team/${userId}`);
      queryClient.setQueryData(["userProjects", authUser.id], (old) =>
        old.map((project) =>
          project._id === projectId
            ? {
                ...project,
                team: project.team.filter((member) => member._id !== userId),
              }
            : project
        )
      );
      if (currentProject?._id === projectId) {
        setCurrentProject((prev) => ({
          ...prev,
          team: prev.team.filter((member) => member._id !== userId),
        }));
      }
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const addTask = async (projectId, taskData) => {
    try {
      const response = await axiosInstance.post(
        `/api/v1/projects/${projectId}/tasks`,
        taskData
      );
      queryClient.setQueryData(["userProjects", authUser.id], (old) =>
        old.map((project) =>
          project._id === projectId
            ? {
                ...project,
                tasks: [...project.tasks, response.data.data.task],
              }
            : project
        )
      );
      if (currentProject?._id === projectId) {
        setCurrentProject((prev) => ({
          ...prev,
          tasks: [...prev.tasks, response.data.data.task],
        }));
      }
      return response.data.data.task;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const updateTaskStatus = async (projectId, taskId, status) => {
    try {
      const response = await axiosInstance.patch(
        `/api/v1/projects/${projectId}/tasks/${taskId}`,
        { status }
      );
      queryClient.setQueryData(["userProjects", authUser.id], (old) =>
        old.map((project) =>
          project._id === projectId
            ? {
                ...project,
                tasks: project.tasks.map((task) =>
                  task._id === taskId ? response.data.data.task : task
                ),
              }
            : project
        )
      );
      if (currentProject?._id === projectId) {
        setCurrentProject((prev) => ({
          ...prev,
          tasks: prev.tasks.map((task) =>
            task._id === taskId ? response.data.data.task : task
          ),
        }));
      }
      return response.data.data.task;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const sendMessage = async (projectId, messageData) => {
    try {
      const response = await axiosInstance.post(
        `/api/v1/projects/${projectId}/messages`,
        messageData
      );
      queryClient.setQueryData(["userProjects", authUser.id], (old) =>
        old.map((project) =>
          project._id === projectId
            ? {
                ...project,
                messages: [...project.messages, response.data.data.message],
              }
            : project
        )
      );
      if (currentProject?._id === projectId) {
        setCurrentProject((prev) => ({
          ...prev,
          messages: [...prev.messages, response.data.data.message],
        }));
      }
      return response.data.data.message;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const uploadFile = async (projectId, fileData) => {
    try {
      const response = await axiosInstance.post(
        `/api/v1/projects/${projectId}/files`,
        fileData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      queryClient.setQueryData(["userProjects", authUser.id], (old) =>
        old.map((project) =>
          project._id === projectId
            ? {
                ...project,
                files: [...project.files, response.data.data.file],
              }
            : project
        )
      );
      if (currentProject?._id === projectId) {
        setCurrentProject((prev) => ({
          ...prev,
          files: [...prev.files, response.data.data.file],
        }));
      }
      return response.data.data.file;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const deleteFile = async (projectId, fileId) => {
    try {
      await axiosInstance.delete(`/api/v1/projects/${projectId}/files/${fileId}`);
      queryClient.setQueryData(["userProjects", authUser.id], (old) =>
        old.map((project) =>
          project._id === projectId
            ? {
                ...project,
                files: project.files.filter((file) => file._id !== fileId),
              }
            : project
        )
      );
      if (currentProject?._id === projectId) {
        setCurrentProject((prev) => ({
          ...prev,
          files: prev.files.filter((file) => file._id !== fileId),
        }));
      }
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const value = {
    projects,
    currentProject,
    loading: isLoading,
    createProject,
    getProject,
    updateProject,
    deleteProject,
    addTeamMember,
    removeTeamMember,
    addTask,
    updateTaskStatus,
    sendMessage,
    uploadFile,
    deleteFile,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export default ProjectContext;