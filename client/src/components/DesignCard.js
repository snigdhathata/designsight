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

const ImageContainer = styled.div`
  width: 100%;
  height: 200px;
  background-color: ${props => props.theme.colors.secondary};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const Placeholder = styled.div`
  color: ${props => props.theme.colors.textLight};
  font-size: 0.875rem;
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const Status = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  background-color: ${props => {
    switch (props.status) {
      case 'completed': return '#dcfce7';
      case 'processing': return '#fef3c7';
      case 'failed': return '#fecaca';
      case 'pending': return '#e5e7eb';
      default: return '#e5e7eb';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#166534';
      case 'processing': return '#92400e';
      case 'failed': return '#dc2626';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  }};
`;

const Score = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textLight};
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const Date = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textLight};
`;

const FeedbackCount = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.primary};
  font-weight: 500;
`;

const DesignCard = ({ design }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAnalysisStatus = () => {
    return design.aiAnalysis?.status || 'pending';
  };

  const getOverallScore = () => {
    return design.aiAnalysis?.analysisData?.overallScore || 0;
  };

  const getFeedbackCount = () => {
    return design.aiAnalysis?.analysisData?.feedbackItems?.length || 0;
  };

  return (
    <Card to={`/project/${design.project}/design/${design._id}`}>
      <ImageContainer>
        {design.filePath ? (
          <Image src={`/api/uploads/${design.filename}`} alt={design.originalName} />
        ) : (
          <Placeholder>No preview available</Placeholder>
        )}
      </ImageContainer>

      <Content>
        <Title>{design.originalName}</Title>
        
        <Meta>
          <Status status={getAnalysisStatus()}>
            {getAnalysisStatus()}
          </Status>
          {getOverallScore() > 0 && (
            <Score>Score: {getOverallScore()}/100</Score>
          )}
        </Meta>

        <Footer>
          <Date>Uploaded {formatDate(design.createdAt)}</Date>
          {getFeedbackCount() > 0 && (
            <FeedbackCount>{getFeedbackCount()} feedback items</FeedbackCount>
          )}
        </Footer>
      </Content>
    </Card>
  );
};

export default DesignCard;


