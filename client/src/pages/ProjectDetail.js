import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useProject } from '../contexts/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';
import DesignCard from '../components/DesignCard';
import UploadDesignModal from '../components/UploadDesignModal';

const ProjectContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ProjectInfo = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Description = styled.p`
  color: ${props => props.theme.colors.textLight};
  font-size: 1.125rem;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Meta = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.textLight};
  font-size: 0.875rem;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const Actions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
`;

const Button = styled.button`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;

  ${props => props.variant === 'primary' ? `
    background-color: ${props.theme.colors.primary};
    color: ${props.theme.colors.white};
    border: none;

    &:hover {
      background-color: ${props.theme.colors.primaryDark};
    }
  ` : `
    background-color: transparent;
    color: ${props.theme.colors.text};
    border: 1px solid ${props.theme.colors.border};

    &:hover {
      background-color: ${props.theme.colors.secondary};
    }
  `}
`;

const DesignsSection = styled.div`
  margin-top: ${props => props.theme.spacing.xl};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const DesignsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.lg};
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

const ProjectDetail = () => {
  const { id } = useParams();
  const { currentProject, designs, loading, fetchDesigns, setCurrentProject } = useProject();
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (id) {
      setCurrentProject({ _id: id });
      fetchDesigns(id);
    }
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading project..." />;
  }

  if (!currentProject) {
    return (
      <ProjectContainer>
        <div>Project not found</div>
      </ProjectContainer>
    );
  }

  return (
    <ProjectContainer>
      <Header>
        <ProjectInfo>
          <Title>{currentProject.name}</Title>
          {currentProject.description && (
            <Description>{currentProject.description}</Description>
          )}
          <Meta>
            <MetaItem>
              <span>Status:</span>
              <span style={{ 
                textTransform: 'capitalize',
                color: currentProject.status === 'active' ? '#10b981' : '#6b7280'
              }}>
                {currentProject.status}
              </span>
            </MetaItem>
            <MetaItem>
              <span>Designs:</span>
              <span>{designs.length}</span>
            </MetaItem>
            <MetaItem>
              <span>Created:</span>
              <span>{new Date(currentProject.createdAt).toLocaleDateString()}</span>
            </MetaItem>
          </Meta>
        </ProjectInfo>

        <Actions>
          <Button onClick={() => setShowUploadModal(true)}>
            Upload Design
          </Button>
          <Button variant="primary">
            Settings
          </Button>
        </Actions>
      </Header>

      <DesignsSection>
        <SectionHeader>
          <SectionTitle>Designs</SectionTitle>
        </SectionHeader>

        {designs.length === 0 ? (
          <EmptyState>
            <EmptyTitle>No designs yet</EmptyTitle>
            <EmptyDescription>
              Upload your first design to start getting AI-powered feedback
            </EmptyDescription>
            <Button variant="primary" onClick={() => setShowUploadModal(true)}>
              Upload Design
            </Button>
          </EmptyState>
        ) : (
          <DesignsGrid>
            {designs.map(design => (
              <DesignCard key={design._id} design={design} />
            ))}
          </DesignsGrid>
        )}
      </DesignsSection>

      {showUploadModal && (
        <UploadDesignModal
          projectId={id}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchDesigns(id);
          }}
        />
      )}
    </ProjectContainer>
  );
};

export default ProjectDetail;


