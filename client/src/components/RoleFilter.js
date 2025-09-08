import React from 'react';
import styled from 'styled-components';

const FilterContainer = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.theme.colors.backgroundSecondary};
`;

const FilterTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const FilterOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.xs};
`;

const FilterButton = styled.button`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.isActive ? props.theme.colors.primary : props.theme.colors.white};
  color: ${props => props.isActive ? props.theme.colors.white : props.theme.colors.text};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.isActive ? props.theme.colors.primaryDark : props.theme.colors.secondary};
  }
`;

const Count = styled.span`
  margin-left: ${props => props.theme.spacing.xs};
  padding: 1px 4px;
  border-radius: 8px;
  font-size: 10px;
  background-color: ${props => props.isActive ? 'rgba(255, 255, 255, 0.2)' : props.theme.colors.secondary};
  color: ${props => props.isActive ? props.theme.colors.white : props.theme.colors.textLight};
`;

const RoleFilter = ({ value, onChange, feedbackCount }) => {
  const roles = [
    { value: 'all', label: 'All Roles', count: feedbackCount },
    { value: 'designer', label: 'Designer', count: 0 },
    { value: 'reviewer', label: 'Reviewer', count: 0 },
    { value: 'product_manager', label: 'Product Manager', count: 0 },
    { value: 'developer', label: 'Developer', count: 0 }
  ];

  return (
    <FilterContainer>
      <FilterTitle>Filter by Role</FilterTitle>
      <FilterOptions>
        {roles.map(role => (
          <FilterButton
            key={role.value}
            isActive={value === role.value}
            onClick={() => onChange(role.value)}
          >
            {role.label}
            <Count isActive={value === role.value}>
              {role.count}
            </Count>
          </FilterButton>
        ))}
      </FilterOptions>
    </FilterContainer>
  );
};

export default RoleFilter;


