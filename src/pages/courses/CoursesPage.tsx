import React, { useState } from "react";
import CoursesAddEdit from "../../components/Courses/CoursesAddEdit";
import CourseAddEditModal from "../../components/Courses/CourseAddEditModal";

interface Course {
  _id?: string;
  title: string;
  description: string;
  duration: string;
  status: 'Published' | 'Draft';
  category: string;
  categoryDetails?: { _id: string; name: string };
  createdBy: string;
  createdByDetails?: { _id: string; firstName: string; lastName: string; email: string };
  courseVideo?: string;
  thumbnailImage?: string;
  createdAt?: string;
}

export default function CoursesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAdd = () => {
    setSelectedCourse(null);
    setShowAddModal(true);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  const handleView = (course: Course) => {
    setSelectedCourse(course);
    setShowViewModal(true);
  };

  const handleModalSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setSelectedCourse(null);
  };

  return (
    <div className="p-6">
      <CoursesAddEdit
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        key={refreshTrigger}
      />

      {/* Add Modal */}
      <CourseAddEditModal
        isOpen={showAddModal}
        onClose={closeModals}
        onSuccess={handleModalSuccess}
      />

      {/* Edit Modal */}
      <CourseAddEditModal
        isOpen={showEditModal}
        onClose={closeModals}
        onSuccess={handleModalSuccess}
        editingCourse={selectedCourse}
      />

      {/* View Modal - TODO: Create CourseViewModal */}
      {/* <CourseViewModal
        isOpen={showViewModal}
        onClose={closeModals}
        onEdit={handleEdit}
        course={selectedCourse}
      /> */}
    </div>
  );
}