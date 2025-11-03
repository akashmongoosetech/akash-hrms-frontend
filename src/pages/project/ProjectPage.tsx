import React from "react";
import ProjectTable from "../../components/project/ProjectTable";

export default function ProjectPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Projects</h1>
      <ProjectTable />
    </div>
  );
}