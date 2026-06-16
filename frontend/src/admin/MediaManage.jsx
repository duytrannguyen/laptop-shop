import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '../components/ToastContext';
import { Images, Plus, Trash2, Upload, Copy, Check, Folder, FolderOpen, Edit, FileImage, Maximize2, X, ChevronRight, ChevronDown } from 'lucide-react';
import { http } from '../api/client';

export default function MediaManage() {
  const { showToast } = useToast();
  const [images, setImages] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState('');
  const [search, setSearch] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const fileRef = useRef(null);

  const loadFolders = async () => {
    try {
      const res = await http.get('/admin/uploads/folders');
      setFolders(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadImages = async () => {
    setLoading(true);
    try {
      const res = await http.get('/admin/uploads');
      setImages(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
    loadImages();
  }, []);

  const uploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      await http.post('/admin/uploads', data, { params: { folder: activeFolder } });
      await loadImages();
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể tải ảnh lên');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeFile = async (url) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa file này không?`)) return;
    try {
      await http.delete(`/admin/uploads`, { params: { url } });
      await loadImages();
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể xóa');
    }
  };

  const renameFile = async (oldUrl, oldName) => {
    const newName = window.prompt('Nhập tên mới (bao gồm đuôi file, vd: anh.jpg):', oldName);
    if (!newName || newName === oldName) return;
    try {
      await http.put('/admin/uploads/rename', { oldUrl, newName });
      await loadImages();
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể đổi tên');
    }
  };

  const createSubfolder = async () => {
    const sub = window.prompt('Nhập tên thư mục con mới:');
    if (!sub) return;
    const path = activeFolder ? `${activeFolder}/${sub}` : sub;
    try {
      await http.post('/admin/uploads/folders', { path });
      await loadFolders();
      setActiveFolder(path);
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể tạo thư mục');
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const selectImageForCKEditor = (url) => {
    const urlParams = new URLSearchParams(window.location.search);
    const funcNum = urlParams.get('CKEditorFuncNum');
    if (funcNum && window.opener) {
      window.opener.CKEDITOR.tools.callFunction(funcNum, url);
      window.close();
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (ms) => {
    return new Date(ms).toLocaleDateString('vi-VN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredImages = images.filter(img => 
    img.folder === activeFolder && 
    img.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ background: '#fff' }}>
            <Upload size={16} /> {uploading ? 'Đang tải...' : 'Tải lên'}
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(e) => uploadImage(e.target.files?.[0])} />
          
          <button className="btn btn-outline btn-sm" onClick={createSubfolder} style={{ background: '#fff' }}>
            <Plus size={16} /> Tạo thư mục con
          </button>
        </div>
        <div>
          <input 
            type="text" 
            placeholder="Lọc ảnh..." 
            className="form-input" 
            style={{ width: '200px', padding: '6px 12px', height: '32px' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar Folders */}
        <div style={{ width: '260px', borderRight: '1px solid #e5e7eb', overflowY: 'auto', background: '#f9fafb' }}>
          <div style={{ padding: '12px', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOpen size={18} /> Quản lý thư mục
          </div>
          <div style={{ padding: '8px 0' }}>
            {folders.map(folder => {
              const depth = folder ? folder.split('/').length : 0;
              const folderName = folder ? folder.split('/').pop() : '📁 Tất cả ảnh (Gốc)';
              const isActive = activeFolder === folder;
              return (
                <div 
                  key={folder} 
                  onClick={() => setActiveFolder(folder)}
                  style={{
                    padding: `10px 12px 10px ${12 + depth * 20}px`,
                    display: 'flex', alignItems: 'center', gap: '8px',
                    cursor: 'pointer',
                    background: isActive ? '#e0f2fe' : 'transparent',
                    color: isActive ? '#0369a1' : '#4b5563',
                    fontWeight: isActive ? 600 : 500,
                    borderLeft: `4px solid ${isActive ? '#0284c7' : 'transparent'}`,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f3f4f6'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  {isActive ? <FolderOpen size={16} /> : (folder ? <Folder size={16} color="#9ca3af" /> : <FolderOpen size={16} color="#f59e0b" />)}
                  <span style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{folderName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#fff' }}>
          <div style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
            Thư mục: {activeFolder ? `/${activeFolder}` : '/ (Gốc)'}
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#888', marginTop: '60px' }}>Đang tải danh sách ảnh...</div>
          ) : filteredImages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '60px', padding: '40px', border: '2px dashed #e5e7eb', borderRadius: '8px' }}>
              <Images size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <div>Thư mục này hiện chưa có ảnh nào.</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>Hãy chọn "Tải lên" để thêm ảnh.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {filteredImages.map((img) => (
                <div key={img.url} style={{
                  border: '1px solid #e5e7eb', borderRadius: '6px', padding: '10px',
                  display: 'flex', flexDirection: 'column', gap: '8px',
                  position: 'relative', background: '#fff',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'transform 0.2s',
                }} 
                className="media-item"
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <div 
                    onClick={() => selectImageForCKEditor(img.url)}
                    style={{
                      height: '130px', backgroundImage: `url(${img.url})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
                      backgroundColor: '#f9fafb', borderRadius: '4px', cursor: new URLSearchParams(window.location.search).get('CKEditorFuncNum') ? 'pointer' : 'default',
                      position: 'relative', border: '1px solid #f3f4f6'
                    }}
                  >
                    {new URLSearchParams(window.location.search).get('CKEditorFuncNum') && (
                      <div className="media-select-overlay" style={{
                        position: 'absolute', inset: 0, background: 'rgba(16, 185, 129, 0.2)', display: 'none', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)'
                      }}>
                         <button className="btn btn-primary btn-sm" style={{ pointerEvents: 'none' }}><Check size={16} /> Chọn ảnh này</button>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151', textAlign: 'center', wordBreak: 'break-all', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={img.name}>
                    {img.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{formatDate(img.createdAt).split(' ')[0]}</span>
                    <span>{formatSize(img.size)}</span>
                  </div>
                  
                  {/* Actions */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: 'auto' }}>
                    <button className="btn btn-outline btn-sm" style={{ padding: '4px 8px', flex: 1 }} onClick={() => copyUrl(img.url)} title="Copy URL">
                      {copiedUrl === img.url ? <Check size={14} color="#10b981"/> : <Copy size={14} />}
                    </button>
                    <button className="btn btn-outline btn-sm" style={{ padding: '4px 8px', flex: 1 }} onClick={() => renameFile(img.url, img.name)} title="Đổi tên">
                      <Edit size={14} />
                    </button>
                    <button className="btn btn-outline btn-sm" style={{ padding: '4px 8px', flex: 1, color: '#ef4444', borderColor: '#fee2e2' }} onClick={() => removeFile(img.url)} title="Xóa">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* CSS for hover effects */}
      <style>{`
        .media-item:hover .media-select-overlay {
          display: flex !important;
        }
      `}</style>
    </div>
  );
}
