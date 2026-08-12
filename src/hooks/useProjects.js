import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useToast } from './useToast';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProjects();
      setProjects(res.projects || []);
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (data) => {
    try {
      const res = await api.createProject(data);
      addToast('Project created successfully!', 'success');
      await fetchProjects();
      return res.project;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const deleteProject = async (id) => {
    try {
      await api.deleteProject(id);
      addToast('Project deleted', 'info');
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return { projects, loading, error, fetchProjects, createProject, deleteProject };
}

export default useProjects;
