import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useProject } from '../contexts/ProjectContext';
import LoadingSpinner from '../components/LoadingSpinner';
import FeedbackOverlay from '../components/FeedbackOverlay';
import FeedbackPanel from '../components/FeedbackPanel';
import RoleFilter from '../components/RoleFilter';

const ViewerContainer = styled.div`
  display: flex;
  height: calc(100vh - 80px);
  background-color: ${props => props.theme.colors.backgroundSecondary};
`;

const ImageContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.lg};
  position: relative;
  overflow: auto;
`;

const ImageWrapper = styled.div`
  position: relative;
  max-width: 100%;
  max-height: 100%;
  box-shadow: ${props => props.theme.shadows.lg};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  display: block;
`;

const Sidebar = styled.div`
  width: 400px;
  background-color: ${props => props.theme.colors.white};
  border-left: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.textLight};
  text-decoration: none;
  font-size: 0.875rem;
  margin-bottom: ${props => props.theme.spacing.md};

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const DesignTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const DesignMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textLight};
`;

const AnalysisStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 0.875rem;
  font-weight: 500;
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

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const EmptyState = styled.div`
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  color: ${props => props.theme.colors.textLight};
`;

const EmptyTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const EmptyDescription = styled.p`
  font-size: 0.875rem;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const RetryButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${props => props.theme.colors.primaryDark};
  }
`;

const DesignViewer = () => {
  const { projectId, designId } = useParams();
  const { feedback, loading, fetchFeedback, retryAnalysis } = useProject();
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [imageRef, setImageRef] = useState(null);

  useEffect(() => {
    if (designId) {
      fetchFeedback(designId, { role: roleFilter });
    }
  }, [designId, roleFilter]);

  const handleFeedbackClick = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
  };

  const handleRetryAnalysis = async () => {
    await retryAnalysis(designId);
  };

  if (loading) {
    return <LoadingSpinner text="Loading design..." />;
  }

  if (!feedback) {
    return (
      <ViewerContainer>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>Design not found</div>
        </div>
      </ViewerContainer>
    );
  }

  const { design, feedbackItems, analysisStatus, overallScore, summary } = feedback;

  return (
    <ViewerContainer>
      <ImageContainer>
        <ImageWrapper>
          <Image
            ref={setImageRef}
            src={`/api/uploads/${design.filename}`}
            alt={design.originalName}
          />
          {feedbackItems && feedbackItems.length > 0 && (
            <FeedbackOverlay
              feedbackItems={feedbackItems}
              onFeedbackClick={handleFeedbackClick}
              selectedFeedback={selectedFeedback}
            />
          )}
        </ImageWrapper>
      </ImageContainer>

      <Sidebar>
        <SidebarHeader>
          <BackButton to={`/project/${projectId}`}>
            ← Back to Project
          </BackButton>
          <DesignTitle>{design.originalName}</DesignTitle>
          <DesignMeta>
            <div>Dimensions: {design.dimensions.width} × {design.dimensions.height}</div>
            <div>Uploaded: {new Date(design.uploadedAt || design.createdAt).toLocaleDateString()}</div>
            {overallScore > 0 && <div>Overall Score: {overallScore}/100</div>}
          </DesignMeta>
          
          <AnalysisStatus status={analysisStatus}>
            {analysisStatus === 'completed' && '✓ Analysis Complete'}
            {analysisStatus === 'processing' && '⏳ Analyzing...'}
            {analysisStatus === 'failed' && '✗ Analysis Failed'}
            {analysisStatus === 'pending' && '⏳ Pending Analysis'}
          </AnalysisStatus>
        </SidebarHeader>

        <SidebarContent>
          {analysisStatus === 'failed' && (
            <EmptyState>
              <EmptyTitle>Analysis Failed</EmptyTitle>
              <EmptyDescription>
                The AI analysis encountered an error. You can retry the analysis.
              </EmptyDescription>
              <RetryButton onClick={handleRetryAnalysis}>
                Retry Analysis
              </RetryButton>
            </EmptyState>
          )}

          {analysisStatus === 'processing' && (
            <EmptyState>
              <EmptyTitle>Analyzing Design</EmptyTitle>
              <EmptyDescription>
                AI is analyzing your design. This usually takes 10-30 seconds.
              </EmptyDescription>
            </EmptyState>
          )}

          {analysisStatus === 'pending' && (
            <EmptyState>
              <EmptyTitle>Analysis Pending</EmptyTitle>
              <EmptyDescription>
                Click "Retry Analysis" to start the AI analysis.
              </EmptyDescription>
              <RetryButton onClick={handleRetryAnalysis}>
                Start Analysis
              </RetryButton>
            </EmptyState>
          )}

          {analysisStatus === 'completed' && (
            <>
              <RoleFilter
                value={roleFilter}
                onChange={setRoleFilter}
                feedbackCount={feedbackItems?.length || 0}
              />
              
              {summary && (
                <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    Summary
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {summary}
                  </p>
                </div>
              )}

              <FeedbackPanel
                feedbackItems={feedbackItems || []}
                selectedFeedback={selectedFeedback}
                onSelectFeedback={setSelectedFeedback}
              />
            </>
          )}
        </SidebarContent>
      </Sidebar>
    </ViewerContainer>
  );
};

export default DesignViewer;


