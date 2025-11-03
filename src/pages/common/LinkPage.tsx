import React, { useState } from "react";
import { GitBranch, FileSpreadsheet, Code } from "lucide-react";

export default function LinkPage() {
  const [activeTab, setActiveTab] = useState<'git' | 'excel' | 'codebase'>('git');

  const tabs = [
    { id: 'git', label: 'Git', icon: GitBranch },
    { id: 'excel', label: 'Excel', icon: FileSpreadsheet },
    { id: 'codebase', label: 'Codebase', icon: Code },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'git':
        return <p className="text-gray-600">Git links and resources go here.</p>;
      case 'excel':
        return <p className="text-gray-600">Excel links and resources go here.</p>;
      case 'codebase':
        return <p className="text-gray-600">Codebase links and resources go here.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Link</h1>
      <div className="mb-4">
        <div className="flex space-x-4 border-b">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'git' | 'excel' | 'codebase')}
                className={`flex items-center space-x-2 py-2 px-4 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <IconComponent size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div>{renderContent()}</div>
    </div>
  );
}