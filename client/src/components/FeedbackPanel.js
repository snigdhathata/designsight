import React from 'react';
import styled from 'styled-components';

const Panel = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const FeedbackList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const FeedbackItem = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  cursor: pointer;
  transition: background-color 0.2s ease;
  background-color: ${props => props.isSelected ? props.theme.colors.secondary : 'transparent'};

  &:hover {
    background-color: ${props => props.theme.colors.secondary};
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ItemTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
  flex: 1;
`;

const SeverityBadge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  background-color: ${props => {
    switch (props.severity) {
      case 'high': return '#fecaca';
      case 'medium': return '#fed7aa';
      case 'low': return '#bbf7d0';
      default: return '#e0e7ff';
    }
  }};
  color: ${props => {
    switch (props.severity) {
      case 'high': return '#dc2626';
      case 'medium': return '#ea580c';
      case 'low': return '#16a34a';
      default: return '#4338ca';
    }
  }};
`;

const CategoryBadge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  background-color: ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.textLight};
  margin-right: ${props => props.theme.spacing.sm};
`;

const ItemDescription = styled.p`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textLight};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  line-height: 1.4;
`;

const Recommendations = styled.div`
  margin-top: ${props => props.theme.spacing.sm};
`;

const RecommendationTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const RecommendationList = styled.ul`
  margin: 0;
  padding-left: ${props => props.theme.spacing.md};
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textLight};
`;

const RecommendationItem = styled.li`
  margin-bottom: 2px;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.sm};
`;

const Tag = styled.span`
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  background-color: ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.textLight};
`;

const Roles = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.xs};
  margin-top: ${props => props.theme.spacing.sm};
`;

const RoleTag = styled.span`
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 10px;
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
`;

const EmptyState = styled.div`
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  color: ${props => props.theme.colors.textLight};
`;

const EmptyTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const EmptyDescription = styled.p`
  font-size: 0.875rem;
`;

const FeedbackPanel = ({ feedbackItems, selectedFeedback, onSelectFeedback }) => {
  if (!feedbackItems || feedbackItems.length === 0) {
    return (
      <Panel>
        <EmptyState>
          <EmptyTitle>No feedback items</EmptyTitle>
          <EmptyDescription>
            No feedback items match your current filter.
          </EmptyDescription>
        </EmptyState>
      </Panel>
    );
  }

  return (
    <Panel>
      <FeedbackList>
        {feedbackItems.map((item, index) => (
          <FeedbackItem
            key={item.id || index}
            isSelected={selectedFeedback?.id === item.id}
            onClick={() => onSelectFeedback(item)}
          >
            <ItemHeader>
              <ItemTitle>{item.title}</ItemTitle>
              <SeverityBadge severity={item.severity}>
                {item.severity}
              </SeverityBadge>
            </ItemHeader>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <CategoryBadge>{item.category.replace('_', ' ')}</CategoryBadge>
            </div>

            <ItemDescription>{item.description}</ItemDescription>

            {item.recommendations && item.recommendations.length > 0 && (
              <Recommendations>
                <RecommendationTitle>Recommendations:</RecommendationTitle>
                <RecommendationList>
                  {item.recommendations.map((rec, recIndex) => (
                    <RecommendationItem key={recIndex}>{rec}</RecommendationItem>
                  ))}
                </RecommendationList>
              </Recommendations>
            )}

            {item.tags && item.tags.length > 0 && (
              <Tags>
                {item.tags.map((tag, tagIndex) => (
                  <Tag key={tagIndex}>{tag}</Tag>
                ))}
              </Tags>
            )}

            {item.relevantRoles && item.relevantRoles.length > 0 && (
              <Roles>
                {item.relevantRoles.map((role, roleIndex) => (
                  <RoleTag key={roleIndex}>
                    {role.replace('_', ' ')}
                  </RoleTag>
                ))}
              </Roles>
            )}
          </FeedbackItem>
        ))}
      </FeedbackList>
    </Panel>
  );
};

export default FeedbackPanel;


