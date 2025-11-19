import React, { useState } from "react";
import CategoriesAddEdit from "../../components/Categories/CategoriesAddEdit";
import CategoryAddEditModal from "../../components/Categories/CategoryAddEditModal";

interface Category {
  _id?: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  createdBy: string;
  createdByDetails?: { _id: string; firstName: string; lastName: string; email: string };
  createdAt?: string;
}

export default function CategoriesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAdd = () => {
    setSelectedCategory(null);
    setShowAddModal(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleModalSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedCategory(null);
  };

  return (
    <div className="p-6">
      <CategoriesAddEdit
        onAdd={handleAdd}
        onEdit={handleEdit}
        key={refreshTrigger}
      />

      {/* Add Modal */}
      <CategoryAddEditModal
        isOpen={showAddModal}
        onClose={closeModals}
        onSuccess={handleModalSuccess}
      />

      {/* Edit Modal */}
      <CategoryAddEditModal
        isOpen={showEditModal}
        onClose={closeModals}
        onSuccess={handleModalSuccess}
        editingCategory={selectedCategory}
      />
    </div>
  );
}