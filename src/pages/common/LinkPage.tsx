import React, { useState, useEffect } from "react";
import { GitBranch, FileSpreadsheet, Code, Plus, Edit, Eye, Trash2, FileText, Image, File, Archive, Music, Video } from "lucide-react";
import API from "../../utils/api";
import LinkModal from "../../components/common/LinkModal";
import { formatDate } from "../../Common/Commonfunction";

interface Link {
  _id: string;
  type: 'git' | 'excel' | 'codebase';
  title: string;
  url?: string;
  image?: string;
  file?: string;
  createdAt: string;
}

export default function LinkPage() {
  const [activeTab, setActiveTab] = useState<'git' | 'excel' | 'codebase'>('git');
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedLink, setSelectedLink] = useState<Link | undefined>();

  const tabs = [
    { id: 'git', label: 'Git', icon: GitBranch },
    { id: 'excel', label: 'Excel', icon: FileSpreadsheet },
    { id: 'codebase', label: 'Codebase', icon: Code },
  ];

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/links?type=${activeTab}`);
      setLinks(response.data);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [activeTab]);

  const handleAdd = () => {
    setModalMode('add');
    setSelectedLink(undefined);
    setModalOpen(true);
  };

  const handleEdit = (link: Link) => {
    setModalMode('edit');
    setSelectedLink(link);
    setModalOpen(true);
  };

  const handleView = (link: Link) => {
    setModalMode('view');
    setSelectedLink(link);
    setModalOpen(true);
  };

  const handleDelete = async (link: Link) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      try {
        await API.delete(`/links/${link._id}`);
        fetchLinks();
      } catch (error) {
        console.error('Error deleting link:', error);
      }
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText size={16} className="text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'tif':
      case 'tiff':
      case 'svg':
      case 'webp':
      case 'heif':
      case 'heic':
      case 'raw':
      case 'cr2':
      case 'nef':
      case 'orf':
      case 'arw':
      case 'dng':
      case 'ico':
      case 'psd':
      case 'ai':
        return <Image size={16} className="text-green-500" />;
      case 'doc':
      case 'docx':
      case 'odt':
      case 'rtf':
      case 'txt':
      case 'md':
      case 'tex':
      case 'epub':
      case 'mobi':
      case 'azw3':
        return <FileText size={16} className="text-blue-500" />;
      case 'xls':
      case 'xlsx':
      case 'ods':
      case 'csv':
      case 'tsv':
        return <FileSpreadsheet size={16} className="text-green-600" />;
      case 'ppt':
      case 'pptx':
      case 'odp':
      case 'key':
        return <File size={16} className="text-orange-500" />;
      case 'mp3':
      case 'wav':
      case 'aac':
      case 'flac':
      case 'ogg':
      case 'wma':
      case 'mid':
      case 'midi':
      case 'm4a':
        return <Music size={16} className="text-purple-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'mkv':
      case 'wmv':
      case 'flv':
      case 'webm':
      case '3gp':
      case 'm4v':
        return <Video size={16} className="text-pink-500" />;
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
      case 'bz2':
      case 'iso':
        return <Archive size={16} className="text-yellow-500" />;
      case 'exe':
      case 'bat':
      case 'sh':
      case 'app':
      case 'dll':
      case 'sys':
        return <File size={16} className="text-gray-500" />;
      case 'html':
      case 'htm':
      case 'css':
      case 'js':
      case 'mjs':
      case 'ts':
      case 'tsx':
      case 'jsx':
      case 'json':
      case 'xml':
      case 'yml':
      case 'yaml':
      case 'py':
      case 'java':
      case 'c':
      case 'cpp':
      case 'h':
      case 'hpp':
      case 'php':
      case 'rb':
      case 'go':
      case 'sql':
      case 'db':
      case 'bson':
      case 'crt':
      case 'cer':
      case 'pem':
      case 'pub':
      case 'pfx':
      case 'p12':
      case 'dwg':
      case 'dxf':
      case 'obj':
      case 'fbx':
      case 'stl':
      case '3ds':
      case 'sketch':
      case 'fig':
        return <Code size={16} className="text-indigo-500" />;
      default:
        return <File size={16} className="text-gray-400" />;
    }
  };

  const renderTable = () => {
    const filteredLinks = links.filter(link => link.type === activeTab);

    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Links</h3>
          <button
            onClick={handleAdd}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : filteredLinks.length === 0 ? (
          <p className="text-gray-600">No {activeTab} links found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 border-b text-left">Title</th>
                  <th className="px-4 py-2 border-b text-left">URL</th>
                  {(activeTab === 'excel' || activeTab === 'codebase') && (
                    <>
                      {/* <th className="px-4 py-2 border-b text-left">Image</th> */}
                      <th className="px-4 py-2 border-b text-left">File</th>
                    </>
                  )}
                  <th className="px-4 py-2 border-b text-left">Created</th>
                  <th className="px-4 py-2 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLinks.map((link) => (
                  <tr key={link._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{link.title}</td>
                    <td className="px-4 py-2 border-b">
                      {link.url ? (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                          title={link.url} // shows full URL on hover
                        >
                          {link.url.length > 35
                            ? link.url.slice(0, 35) + '..'
                            : link.url}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    {(activeTab === 'excel' || activeTab === 'codebase') && (
                      <>
                        {/* <td className="px-4 py-2 border-b">
                          {link.image ? (
                            <img src={link.image} alt={link.title} className="w-16 h-16 object-cover" />
                          ) : (
                            '-'
                          )}
                        </td> */}
                        <td className="px-4 py-2 border-b">
                          {link.file ? (
                            <a href={`http://localhost:5000/${link.file}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-600 hover:underline">
                              {getFileIcon(link.file)}
                              {/* <span>Download</span> */}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-2 border-b">{formatDate(link.createdAt)}</td>
                    <td className="px-4 py-2 border-b">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(link)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(link)}
                          className="text-green-600 hover:text-green-800"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(link)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
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
                className={`flex items-center space-x-2 py-2 px-4 ${activeTab === tab.id
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
      <div>
        {renderTable()}
        <LinkModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          mode={modalMode}
          linkType={activeTab}
          link={selectedLink}
          onSuccess={fetchLinks}
        />
      </div>
    </div>
  );
}