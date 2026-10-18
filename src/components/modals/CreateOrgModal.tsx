import React from 'react';
import { OrganizationForm } from '../../features/organizations/OrganizationForm';

export const CreateOrgModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-2xl">
        <OrganizationForm onComplete={onClose} onCancel={onClose} />
      </div>
    </div>
  );
};
