import * as React from 'react';
import { useToast } from '../../ui/toast';
import { useNavigate } from 'react-router-dom';
import { Button, FormInput, FormTextarea, FormField } from '../../ui';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  title: string;
  submitText?: string;
  cancelText?: string;
  type?: 'create' | 'edit';
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  submitText = 'Submit',
  cancelText = 'Cancel',
  type = 'create',
}) => {
  const { notify } = useToast();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = React.useState(initialData || {});
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      setSuccess(true);
      
      notify({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${type}d`,
        description: `${type.charAt(0).toUpperCase() + type.slice(1)}ed successfully`,
        variant: 'success',
      });
      
      onClose();
    } catch (error) {
      notify({
        title: 'Error',
        description: 'Failed to save. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-lg transform scale-95 opacity-0 transition-all duration-300">
        {/* Modal Header */}
        <div className="p-5 border-b border-border opacity-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              >
                ✕
              </Button>
              <h2 className="text-xl font-medium text-gray-900">{title}</h2>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4">
          {success ? (
            <div className="bg-green-50 rounded-md p-4 text-green-800 text-sm mb-4">
              ✔ Successfully submitted
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Employee Name">
                <FormInput
                  placeholder="Enter employee name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormField>
              
              <FormField label="Email">
                <FormInput
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </FormField>

              <FormField label="Department">
                <FormInput
                  placeholder="Select department"
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </FormField>

              <FormField label="Role">
                <FormInput
                  placeholder="Select role"
                  value={formData.role || ''}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </FormField>

              {type === 'edit' && (
                <FormField label="Employee ID">
                  <FormInput
                    placeholder="EMP-00123"
                    value={formData.employeeId || ''}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  />
                </FormField>
              )}

              <FormField label="Hire Date">
                <FormInput
                  type="date"
                  placeholder="Select hire date"
                  value={formData.hireDate || ''}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                />
              </FormField>

              <FormField label="Phone">
                <FormInput
                  placeholder="Enter phone number"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </FormField>

              <FormField label="Address">
                <FormTextarea
                  placeholder="Enter employee address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </FormField>
            </form>
          )}

          {/* Modal Footer */}
          <div className="mt-6 p-4 border-t border-border flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : submitText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
