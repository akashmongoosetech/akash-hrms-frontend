import React, { useState, useEffect } from "react";
import { GitBranch, FileSpreadsheet, Code, Plus, Edit, Eye, Trash2 } from "lucide-react";
import API from "../../utils/api";
import LinkModal from "../../components/common/LinkModal";
import DeleteModal from "../../Common/DeleteModal";
import { formatDate } from "../../Common/Commonfunction";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../components/ui/pagination';
import Icon from "../../components/common/Icon";
import { UniversalSkeleton, BaseSkeleton } from '../../components/ui/skeleton';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<Link | null>(null);
  const [deleting, setDeleting] = useState(false);

  const tabs = [
    { id: 'git', label: 'Git', icon: GitBranch },
    { id: 'excel', label: 'Excel', icon: FileSpreadsheet },
    { id: 'codebase', label: 'Codebase', icon: Code },
  ];

  const fetchLinks = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await API.get(`/links?type=${activeTab}&page=${page}&limit=${itemsPerPage}`);
      setLinks(response.data.links || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalItems(response.data.totalItems || 0);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchLinks(1);
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

  const handleDelete = (link: Link) => {
    setLinkToDelete(link);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!linkToDelete) return;
    setDeleting(true);
    try {
      await API.delete(`/links/${linkToDelete._id}`);
      fetchLinks(currentPage);
      setDeleteModalOpen(false);
      setLinkToDelete(null);
    } catch (error) {
      console.error('Error deleting link:', error);
    } finally {
      setDeleting(false);
    }
  };

  // Handle file download
  const handleFileDownload = async (filePath: string) => {
    try {
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/${filePath}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Get file icon type based on filename
  const getIconType = (fileName: string): string => {
    const ext = fileName.toLowerCase().split('.').pop() || '';
    const extToIcon: Record<string, string> = {
      'pdf': 'pdf',
      'doc': 'doc',
      'docx': 'docx',
      'xls': 'xls',
      'xlsx': 'xlsx',
      'csv': 'csv',
      'ppt': 'ppt',
      'pptx': 'pptx',
      'txt': 'txt',
      'html': 'html',
      'css': 'css',
      'js': 'code',
      'php': 'code',
      'sql': 'sql',
      'xml': 'xml',
      'png': 'png',
      'jpg': 'image',
      'jpeg': 'image',
      'gif': 'gif',
      'webp': 'webp',
      'svg': 'svg',
      'mp4': 'mp4',
      'avi': 'avi',
      'mpeg': 'mpeg',
      'zip': 'zip',
      'exe': 'exe',
      'dmg': 'dmg',
      'psd': 'psd',
      'ai': 'ai',
      'fig': 'fig',
      'aep': 'aep',
      'java': 'java',
      'env': 'txt',
      'md': 'txt',
      'tex': 'txt',
      'epub': 'txt',
      'mobi': 'txt',
      'azw3': 'txt',
      'ods': 'spreadsheets',
      'tsv': 'csv',
      'odp': 'ppt',
      'key': 'ppt',
      'mp3': 'audio',
      'wav': 'audio',
      'aac': 'audio',
      'flac': 'audio',
      'ogg': 'audio',
      'wma': 'audio',
      'mid': 'audio',
      'midi': 'audio',
      'm4a': 'audio',
      'mov': 'video',
      'mkv': 'video',
      'wmv': 'video',
      'flv': 'video',
      'webm': 'video',
      '3gp': 'video',
      'm4v': 'video',
      'rar': 'zip',
      '7z': 'zip',
      'tar': 'zip',
      'gz': 'zip',
      'bz2': 'zip',
      'iso': 'zip',
      'bat': 'exe',
      'sh': 'exe',
      'app': 'exe',
      'dll': 'exe',
      'sys': 'exe',
      'mjs': 'code',
      'ts': 'code',
      'tsx': 'code',
      'jsx': 'code',
      'json': 'code',
      'yml': 'code',
      'yaml': 'code',
      'py': 'code',
      'c': 'code',
      'cpp': 'code',
      'h': 'code',
      'hpp': 'code',
      'rb': 'code',
      'go': 'code',
      'db': 'code',
      'bson': 'code',
      'crt': 'code',
      'cer': 'code',
      'pem': 'code',
      'pub': 'code',
      'pfx': 'code',
      'p12': 'code',
      'dwg': 'code',
      'dxf': 'code',
      'obj': 'code',
      'fbx': 'code',
      'stl': 'code',
      '3ds': 'code',
      'sketch': 'code',
      'bmp': 'image',
      'tif': 'image',
      'tiff': 'image',
      'heif': 'image',
      'heic': 'image',
      'raw': 'image',
      'cr2': 'image',
      'nef': 'image',
      'orf': 'image',
      'arw': 'image',
      'dng': 'image',
      'ico': 'image',
      'odt': 'doc',
      'rtf': 'doc',
    };
    return extToIcon[ext] || 'txt';
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
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 border-b text-left">
                    <BaseSkeleton className="h-4 w-4" />
                  </th>
                  <th className="px-4 py-2 border-b text-left">
                    <BaseSkeleton className="h-4 w-12" />
                  </th>
                  <th className="px-4 py-2 border-b text-left">
                    <BaseSkeleton className="h-4 w-8" />
                  </th>
                  {(activeTab === 'excel' || activeTab === 'codebase') && (
                    <>
                      <th className="px-4 py-2 border-b text-left">
                        <BaseSkeleton className="h-4 w-8" />
                      </th>
                    </>
                  )}
                  <th className="px-4 py-2 border-b text-left">
                    <BaseSkeleton className="h-4 w-12" />
                  </th>
                  <th className="px-4 py-2 border-b text-left">
                    <BaseSkeleton className="h-4 w-14" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }, (_, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b text-sm font-medium text-gray-900">
                      <BaseSkeleton className="h-5 w-8" />
                    </td>
                    <td className="px-4 py-2 border-b">
                      <BaseSkeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-2 border-b">
                      <BaseSkeleton className="h-4 w-32" />
                    </td>
                    {(activeTab === 'excel' || activeTab === 'codebase') && (
                      <>
                        <td className="px-4 py-2 border-b">
                          <BaseSkeleton className="h-8 w-8 rounded" />
                        </td>
                      </>
                    )}
                    <td className="px-4 py-2 border-b">
                      <BaseSkeleton className="h-4 w-16" />
                    </td>
                    <td className="px-4 py-2 border-b">
                      <div className="flex space-x-2">
                        <BaseSkeleton className="h-6 w-6 rounded" />
                        <BaseSkeleton className="h-6 w-6 rounded" />
                        <BaseSkeleton className="h-6 w-6 rounded" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredLinks.length === 0 ? (
          <p className="text-gray-600">No {activeTab} links found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 border-b text-left">#</th>
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
                {filteredLinks.map((link, index) => (
                  <tr key={link._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b text-sm font-medium text-gray-900">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
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
                              <button onClick={() => handleFileDownload(link.file)} className="flex items-center space-x-2 text-blue-600 hover:underline">
                                <Icon type={getIconType(link.file) as any} size={30} />
                                {/* <span>Download</span> */}
                              </button>
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
          onSuccess={() => fetchLinks(currentPage)}
        />

        <DeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Link"
          message={`Are you sure you want to delete "${linkToDelete?.title}"?`}
          loading={deleting}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}