import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

interface DashboardPreferences {
  projects: boolean;
  teams: boolean;
  todos: boolean;
  tickets: boolean;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ isOpen, onClose, onNavigate }) => {
  const [checkedItems, setCheckedItems] = useState<DashboardPreferences>({
    projects: true,
    teams: true,
    todos: true,
    tickets: true,
  });

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('dashboardPreferences');
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences);
      setCheckedItems(preferences);
    }
  }, []);

  const handleCheckboxChange = async (item: keyof DashboardPreferences) => {
    const newCheckedItems = {
      ...checkedItems,
      [item]: !checkedItems[item]
    };

    setCheckedItems(newCheckedItems);

    // Save to localStorage
    localStorage.setItem('dashboardPreferences', JSON.stringify(newCheckedItems));

    // Force page reload to apply changes immediately
    window.location.reload();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed right-0 top-0 w-80 bg-white h-full border-l border-gray-200 z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-gray-700">Settings</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600">Dashboard Items</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkedItems.projects}
                  onChange={() => handleCheckboxChange('projects')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700">Projects</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkedItems.teams}
                  onChange={() => handleCheckboxChange('teams')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700">Teams</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkedItems.todos}
                  onChange={() => handleCheckboxChange('todos')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700">Todos</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkedItems.tickets}
                  onChange={() => handleCheckboxChange('tickets')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700">Tickets</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600">System Settings</h3>
            <button
              onClick={() => onNavigate("/settings/notifications")}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Notifications
            </button>
            <button
              onClick={() => onNavigate("/settings/preferences")}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Preferences
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600">Support</h3>
            <button
              onClick={() => onNavigate("/settings/help")}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Help & Support
            </button>
            <button
              onClick={() => onNavigate("/settings/about")}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              About
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SettingsSidebar;