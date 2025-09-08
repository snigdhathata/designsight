import React, { useState } from 'react';
import styled from 'styled-components';
import { useProject } from '../contexts/ProjectContext';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${props => props.theme.spacing.lg};
`;

const Modal = styled.div`
  background-color: ${props => props.theme.colors.white};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const Header = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${props => props.theme.colors.textLight};
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};

  &:hover {
    background-color: ${props => props.theme.colors.secondary};
  }
`;

const Body = styled.div`
  padding: ${props => props.theme.spacing.lg};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const Label = styled.label`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textLight};
  }
`;

const TextArea = styled.textarea`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textLight};
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  cursor: pointer;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${props => props.theme.colors.primary};
`;

const Footer = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: flex-end;
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

    &:disabled {
      background-color: ${props.theme.colors.textLight};
      cursor: not-allowed;
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

const CreateProjectModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    settings: {
      aiAnalysisEnabled: true,
      autoAnalysis: false,
      feedbackCategories: ['accessibility', 'visual_hierarchy', 'content', 'ui_patterns']
    }
  });
  const [loading, setLoading] = useState(false);

  const { createProject } = useProject();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('settings.')) {
      const settingName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingName]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        feedbackCategories: prev.settings.feedbackCategories.includes(category)
          ? prev.settings.feedbackCategories.filter(c => c !== category)
          : [...prev.settings.feedbackCategories, category]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await createProject(formData);
    
    if (result.success) {
      onSuccess();
    }
    
    setLoading(false);
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Create New Project</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        <Body>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="name">Project Name *</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter project name"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="description">Description</Label>
              <TextArea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your project..."
              />
            </FormGroup>

            <FormGroup>
              <Label>AI Analysis Settings</Label>
              <CheckboxGroup>
                <CheckboxItem>
                  <Checkbox
                    type="checkbox"
                    name="settings.aiAnalysisEnabled"
                    checked={formData.settings.aiAnalysisEnabled}
                    onChange={handleChange}
                  />
                  Enable AI analysis for uploaded designs
                </CheckboxItem>
                <CheckboxItem>
                  <Checkbox
                    type="checkbox"
                    name="settings.autoAnalysis"
                    checked={formData.settings.autoAnalysis}
                    onChange={handleChange}
                  />
                  Automatically analyze designs on upload
                </CheckboxItem>
              </CheckboxGroup>
            </FormGroup>

            <FormGroup>
              <Label>Feedback Categories</Label>
              <CheckboxGroup>
                {[
                  { value: 'accessibility', label: 'Accessibility' },
                  { value: 'visual_hierarchy', label: 'Visual Hierarchy' },
                  { value: 'content', label: 'Content & Copy' },
                  { value: 'ui_patterns', label: 'UI/UX Patterns' }
                ].map(category => (
                  <CheckboxItem key={category.value}>
                    <Checkbox
                      type="checkbox"
                      checked={formData.settings.feedbackCategories.includes(category.value)}
                      onChange={() => handleCategoryChange(category.value)}
                    />
                    {category.label}
                  </CheckboxItem>
                ))}
              </CheckboxGroup>
            </FormGroup>
          </Form>
        </Body>

        <Footer>
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim()}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default CreateProjectModal;


