import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ProjectCard from '../components/ProjectCard';
import CreateProjectModal from '../components/CreateProjectModal';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textLight};
  font-size: 1.125rem;
`;

const CreateButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 500;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  background-color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 2px dashed ${props => props.theme.colors.border};
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const EmptyDescription = styled.p`
  color: ${props => props.theme.colors.textLight};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const StatCard = styled.div`
  background-color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.textLight};
  font-weight: 500;
`;

const Dashboard = () => {
  const { user } = useAuth();
  const { projects, loading, fetchProjects } = useProject();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const totalDesigns = projects.reduce((acc, project) => acc + (project.designCount || 0), 0);
  const activeProjects = projects.filter(project => project.status === 'active').length;

  return (
    <DashboardContainer>
      <Header>
        <div>
          <Title>Welcome back, {user?.name}!</Title>
          <Subtitle>Manage your design projects and get AI-powered feedback</Subtitle>
        </div>
        <CreateButton onClick={() => setShowCreateModal(true)}>
          Create Project
        </CreateButton>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatNumber>{projects.length}</StatNumber>
          <StatLabel>Total Projects</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{activeProjects}</StatNumber>
          <StatLabel>Active Projects</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{totalDesigns}</StatNumber>
          <StatLabel>Designs Analyzed</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{user?.role?.replace('_', ' ')}</StatNumber>
          <StatLabel>Your Role</StatLabel>
        </StatCard>
      </StatsGrid>

      {projects.length === 0 ? (
        <EmptyState>
          <EmptyTitle>No projects yet</EmptyTitle>
          <EmptyDescription>
            Create your first project to start getting AI-powered design feedback
          </EmptyDescription>
          <CreateButton onClick={() => setShowCreateModal(true)}>
            Create Your First Project
          </CreateButton>
        </EmptyState>
      ) : (
        <ProjectsGrid>
          {projects.map(project => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </ProjectsGrid>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchProjects();
          }}
        />
      )}
    </DashboardContainer>
  );
};

export default Dashboard;


