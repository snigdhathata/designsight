import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [currentDesign, setCurrentDesign] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  // Projects
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get('/projects');
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      const response = await api.post('/projects', projectData);
      const newProject = response.data.project;
      setProjects(prev => [newProject, ...prev]);
      toast.success('Project created successfully');
      return { success: true, project: newProject };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create project';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateProject = async (projectId, updates) => {
    try {
      const response = await api.put(`/projects/${projectId}`, updates);
      const updatedProject = response.data.project;
      setProjects(prev => 
        prev.map(p => p._id === projectId ? updatedProject : p)
      );
      if (currentProject?._id === projectId) {
        setCurrentProject(updatedProject);
      }
      toast.success('Project updated successfully');
      return { success: true, project: updatedProject };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update project';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Designs
  const fetchDesigns = async (projectId) => {
    setLoading(true);
    try {
      const response = await api.get(`/projects/${projectId}/designs`);
      setDesigns(response.data.designs);
    } catch (error) {
      console.error('Error fetching designs:', error);
      toast.error('Failed to fetch designs');
    } finally {
      setLoading(false);
    }
  };

  const uploadDesign = async (projectId, file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post(`/projects/${projectId}/designs`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const newDesign = response.data.design;
      setDesigns(prev => [newDesign, ...prev]);
      toast.success('Design uploaded successfully');
      return { success: true, design: newDesign };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload design';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Feedback
  const fetchFeedback = async (designId, filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/feedback/design/${designId}?${params}`);
      setFeedback(response.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const retryAnalysis = async (designId) => {
    try {
      await api.post(`/feedback/design/${designId}/retry-analysis`);
      toast.success('Analysis restarted');
      // Refresh feedback after a delay
      setTimeout(() => {
        fetchFeedback(designId);
      }, 2000);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to restart analysis';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    // State
    projects,
    currentProject,
    designs,
    currentDesign,
    feedback,
    loading,
    
    // Project actions
    fetchProjects,
    createProject,
    updateProject,
    setCurrentProject,
    
    // Design actions
    fetchDesigns,
    uploadDesign,
    setCurrentDesign,
    
    // Feedback actions
    fetchFeedback,
    retryAnalysis,
    setFeedback
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};


