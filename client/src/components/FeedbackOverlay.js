import React from 'react';
import styled from 'styled-components';

const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const FeedbackMarker = styled.div`
  position: absolute;
  border: 2px solid ${props => {
    switch (props.severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6366f1';
    }
  }};
  background-color: ${props => {
    switch (props.severity) {
      case 'high': return 'rgba(239, 68, 68, 0.1)';
      case 'medium': return 'rgba(245, 158, 11, 0.1)';
      case 'low': return 'rgba(16, 185, 129, 0.1)';
      default: return 'rgba(99, 102, 241, 0.1)';
    }
  }};
  border-radius: 4px;
  cursor: pointer;
  pointer-events: all;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 20;
  }

  ${props => props.isSelected && `
    border-width: 3px;
    box-shadow: 0 0 0 2px ${props.theme.colors.primary};
    z-index: 30;
  `}
`;

const MarkerLabel = styled.div`
  position: absolute;
  top: -8px;
  left: -2px;
  background-color: ${props => {
    switch (props.severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6366f1';
    }
  }};
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
  pointer-events: none;
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${props => props.theme.colors.text};
  color: ${props => props.theme.colors.white};
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 0.75rem;
  white-space: nowrap;
  margin-bottom: ${props => props.theme.spacing.sm};
  opacity: ${props => props.isVisible ? 1 : 0};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  transition: all 0.2s ease;
  z-index: 40;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: ${props => props.theme.colors.text};
  }
`;

const FeedbackOverlay = ({ feedbackItems, onFeedbackClick, selectedFeedback }) => {
  const [hoveredItem, setHoveredItem] = React.useState(null);

  const handleMarkerClick = (feedbackItem) => {
    onFeedbackClick(feedbackItem);
  };

  const handleMarkerHover = (feedbackItem) => {
    setHoveredItem(feedbackItem);
  };

  const handleMarkerLeave = () => {
    setHoveredItem(null);
  };

  return (
    <OverlayContainer>
      {feedbackItems.map((item, index) => (
        <FeedbackMarker
          key={item.id || index}
          severity={item.severity}
          isSelected={selectedFeedback?.id === item.id}
          style={{
            left: `${(item.coordinates.x / 800) * 100}%`, // Assuming 800px base width
            top: `${(item.coordinates.y / 600) * 100}%`, // Assuming 600px base height
            width: `${(item.coordinates.width / 800) * 100}%`,
            height: `${(item.coordinates.height / 600) * 100}%`,
          }}
          onClick={() => handleMarkerClick(item)}
          onMouseEnter={() => handleMarkerHover(item)}
          onMouseLeave={handleMarkerLeave}
        >
          <MarkerLabel severity={item.severity}>
            {item.severity}
          </MarkerLabel>
          
          <Tooltip isVisible={hoveredItem?.id === item.id}>
            {item.title}
          </Tooltip>
        </FeedbackMarker>
      ))}
    </OverlayContainer>
  );
};

export default FeedbackOverlay;


