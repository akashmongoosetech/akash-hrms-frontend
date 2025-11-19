import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import CoursesAddEdit from "../../components/Courses/CoursesAddEdit";
import CourseAddEditModal from "../../components/Courses/CourseAddEditModal";
import CategoriesAddEdit from "../../components/Categories/CategoriesAddEdit";
import CategoryAddEditModal from "../../components/Categories/CategoryAddEditModal";

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

interface Category {
  _id?: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  createdBy: string;
  createdByDetails?: { _id: string; firstName: string; lastName: string; email: string };
  createdAt?: string;
}

export default function LearningPage() {
  const [activeTab, setActiveTab] = useState("courses");

  // Course states
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [showViewCourseModal, setShowViewCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [refreshCoursesTrigger, setRefreshCoursesTrigger] = useState(0);

  // Category states
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [refreshCategoriesTrigger, setRefreshCategoriesTrigger] = useState(0);

  // Course handlers
  const handleAddCourse = () => {
    setSelectedCourse(null);
    setShowAddCourseModal(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowEditCourseModal(true);
  };

  const handleViewCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowViewCourseModal(true);
  };

  const handleCourseModalSuccess = () => {
    setRefreshCoursesTrigger(prev => prev + 1);
  };

  const closeCourseModals = () => {
    setShowAddCourseModal(false);
    setShowEditCourseModal(false);
    setShowViewCourseModal(false);
    setSelectedCourse(null);
  };

  // Category handlers
  const handleAddCategory = () => {
    setSelectedCategory(null);
    setShowAddCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowEditCategoryModal(true);
  };

  const handleCategoryModalSuccess = () => {
    setRefreshCategoriesTrigger(prev => prev + 1);
  };

  const closeCategoryModals = () => {
    setShowAddCategoryModal(false);
    setShowEditCategoryModal(false);
    setSelectedCategory(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="mt-6">
            <CoursesAddEdit
              onAdd={handleAddCourse}
              onEdit={handleEditCourse}
              onView={handleViewCourse}
              key={`courses-${refreshCoursesTrigger}`}
            />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <CategoriesAddEdit
              onAdd={handleAddCategory}
              onEdit={handleEditCategory}
              key={`categories-${refreshCategoriesTrigger}`}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Course Modals */}
      <CourseAddEditModal
        isOpen={showAddCourseModal}
        onClose={closeCourseModals}
        onSuccess={handleCourseModalSuccess}
      />

      <CourseAddEditModal
        isOpen={showEditCourseModal}
        onClose={closeCourseModals}
        onSuccess={handleCourseModalSuccess}
        editingCourse={selectedCourse}
      />

      {/* Course View Modal - TODO: Create CourseViewModal */}
      {/* <CourseViewModal
        isOpen={showViewCourseModal}
        onClose={closeCourseModals}
        onEdit={handleEditCourse}
        course={selectedCourse}
      /> */}

      {/* Category Modals */}
      <CategoryAddEditModal
        isOpen={showAddCategoryModal}
        onClose={closeCategoryModals}
        onSuccess={handleCategoryModalSuccess}
      />

      <CategoryAddEditModal
        isOpen={showEditCategoryModal}
        onClose={closeCategoryModals}
        onSuccess={handleCategoryModalSuccess}
        editingCategory={selectedCategory}
      />
    </div>
  );
}