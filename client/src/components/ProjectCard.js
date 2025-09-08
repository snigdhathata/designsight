import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Card = styled(Link)`
  background-color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  padding: ${props => props.theme.spacing.lg};
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.theme.colors.border};

  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const Status = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  background-color: ${props => {
    switch (props.status) {
      case 'active': return '#dcfce7';
      case 'archived': return '#f3f4f6';
      case 'completed': return '#dbeafe';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'active': return '#166534';
      case 'archived': return '#6b7280';
      case 'completed': return '#1e40af';
      default: return '#6b7280';
    }
  }};
`;

const Description = styled.p`
  color: ${props => props.theme.colors.textLight};
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: ${props => props.theme.spacing.lg};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const Meta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const MetaItem = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textLight};
`;

const Owner = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const Avatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.75rem;
`;

const OwnerName = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
  font-weight: 500;
`;

const ProjectCard = ({ project }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card to={`/project/${project._id}`}>
      <Header>
        <div>
          <Title>{project.name}</Title>
        </div>
        <Status status={project.status}>{project.status}</Status>
      </Header>

      {project.description && (
        <Description>{project.description}</Description>
      )}

      <Footer>
        <Meta>
          <MetaItem>Created {formatDate(project.createdAt)}</MetaItem>
          <MetaItem>Updated {formatDate(project.updatedAt)}</MetaItem>
        </Meta>

        <Owner>
          <Avatar>{getInitials(project.owner?.name || 'U')}</Avatar>
          <OwnerName>{project.owner?.name}</OwnerName>
        </Owner>
      </Footer>
    </Card>
  );
};

export default ProjectCard;


