import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import { Newspaper, Plus, X, Edit2, Trash2, ArrowLeft, Upload, FileText, Image, Save, Check, ChevronsUpDown, Copy } from 'lucide-react';
import { CKEditor } from 'ckeditor4-react';
import { http, API } from '../../api/client';

const EMPTY = { 
  title: '', slug: '', image: '', content: '', active: true, type: 'ARTICLE',
  createdAt: '', metaTitle: '', metaDescription: '', metaImage: ''
};

export default function PostsManage() {
  const { showToast, confirm } = useToast();
  const [data, setData] = useState([]);
  const [view, setView] = useState('list');
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Filter & Pagination states
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Image Upload states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const [uploadingType, setUploadingType] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const load = () => {
    // Fetch all posts (both ARTICLE and PAGE) since we now manage them together
    http.get('/admin/posts').then((r) => setData(r.data)).catch(() => {});
  };

  useEffect(load, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType, filterStatus, pageSize]);

  const openAdd = () => { 
    setForm({ ...EMPTY, createdAt: new Date().toISOString().substring(0, 10) }); 
    setEditId(null); 
    setSelectedImageFile(null);
    setSelectedImagePreview(null);
    setView('form'); 
  };
  
  const openEdit = (item) => {
    setForm({
      title: item.title || '', slug: item.slug || '',
      image: item.image || '', content: item.content || '',
      active: item.active ?? true, type: item.type || 'ARTICLE',
      createdAt: item.createdAt ? item.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10),
      metaTitle: item.metaTitle || '',
      metaDescription: item.metaDescription || '',
      metaImage: item.metaImage || ''
    });
    setEditId(item.id);
    setSelectedImageFile(null);
    setSelectedImagePreview(null);
    setView('form');
  };

  const handleSave = async (e, shouldExit = true) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalImageUrl = form.image;
      if (selectedImageFile) {
        setUploadingType('main');
        const formData = new FormData();
        formData.append('file', selectedImageFile);
        const response = await http.post('/admin/uploads', formData, { 
          params: { folder: 'posts' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        finalImageUrl = response.data.url;
        setUploadingType(null);
        setUploadProgress(0);
      }

      const saveData = {
        ...form,
        image: finalImageUrl,
        createdAt: form.createdAt ? `${form.createdAt}T00:00:00` : null
      };

      if (editId) {
        await http.put(`/admin/posts/${editId}`, saveData);
      } else {
        await http.post('/admin/posts', saveData);
      }
      
      load();
      if (shouldExit) {
        setView('list');
      } else {
        showToast('Đã lưu thành công!');
        if (!editId) {
          setView('list'); // if create new, just go back, or we could redirect to edit
        }
      }
    } catch (err) {
      showToast('Lỗi: ' + (err.response?.data?.message || 'Không thể lưu'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!await confirm(`Xác nhận xóa "${title}"?`)) return;
    try {
      await http.delete(`/admin/posts/${id}`);
      load();
    } catch {
      showToast('Không thể xóa bài viết');
    }
  };

  const handleQuickUpdate = async (id, field, value) => {
    try {
      const item = data.find(x => x.id === id);
      if (!item) return;
      const updatedItem = { ...item, [field]: value };
      if (field === 'createdAt' && value && !value.includes('T')) {
        updatedItem.createdAt = value + 'T00:00:00';
      }
      await http.put(`/admin/posts/${id}`, updatedItem);
      load();
    } catch (err) {
      showToast('Không thể cập nhật nhanh!');
    }
  };

  // Drag and Drop
  const handleDrag = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = (files) => {
    const file = Array.from(files).find((item) => item.type.startsWith('image/'));
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ảnh không được vượt quá 5MB');
      return;
    }
    setSelectedImageFile(file);
    setSelectedImagePreview(URL.createObjectURL(file));
  };

  if (view === 'form') {
    return (
      <div className="admin-product-page fade-in">
        <div className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn btn-outline btn-sm" onClick={() => setView('list')} type="button">
              <ArrowLeft size={16} />
            </button>
            <h1>{editId ? 'Sửa bài viết/trang' : 'THÊM BÀI VIẾT'}</h1>
          </div>
        </div>
        
        <form onSubmit={(e) => handleSave(e, true)} className="admin-form-grid">
          <div className="admin-form-left">
            <div className="admin-form-section">
              <h3 className="admin-form-section-title">
                <FileText size={18} /> Thông tin bài viết
              </h3>
              <div className="form-row-2">
                <div className="form-col" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Tên bài viết *</label>
                    <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Link seo *</label>
                    <input className="form-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày tạo</label>
                    <input type="date" className="form-input" value={form.createdAt} onChange={(e) => setForm({ ...form, createdAt: e.target.value })} />
                  </div>
                </div>
                <div className="form-col" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Meta title</label>
                    <input className="form-input" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Meta description</label>
                    <input className="form-input" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Đường dẫn meta image</label>
                    <input className="form-input" value={form.metaImage} onChange={(e) => setForm({ ...form, metaImage: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-form-section" style={{ zIndex: 3 }}>
              <h3 className="admin-form-section-title">Mô tả</h3>
              <div className="ckeditor-wrap">
                <CKEditor
                  key={`content-${editId || 'new'}`}
                  editorUrl="https://cdn.ckeditor.com/4.22.1/full-all/ckeditor.js"
                  initData={form.content}
                  onChange={(e) => setForm(prev => ({ ...prev, content: e.editor.getData() }))}
                  config={{
                    filebrowserBrowseUrl: '/admin/file-browser',
                    filebrowserUploadUrl: `${API}/admin/uploads/ckeditor?folder=posts&token=${localStorage.getItem('admin_token')}`,
                    filebrowserUploadMethod: 'form',
                    allowedContent: true,
                    versionCheck: false,
                    height: 400,
                    toolbar: [
                      { name: 'document', items: ['Source', '-', 'Maximize'] },
                      { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', '-', 'Undo', 'Redo'] },
                      { name: 'editing', items: ['Find', 'Replace', '-', 'SelectAll'] },
                      '/',
                      { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', '-', 'RemoveFormat'] },
                      { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
                      { name: 'links', items: ['Link', 'Unlink'] },
                      { name: 'insert', items: ['Image', 'Table', 'HorizontalRule', 'SpecialChar'] },
                      '/',
                      { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
                      { name: 'colors', items: ['TextColor', 'BGColor'] }
                    ]
                  }}
                />
              </div>
            </div>
          </div>

          <div className="admin-form-right">
            <div className="admin-form-section">
              <h3 className="admin-form-section-title">Danh mục bài viết</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="postType" checked={form.type === 'ARTICLE'} onChange={() => setForm({ ...form, type: 'ARTICLE' })} />
                  Tin Tức
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="radio" name="postType" checked={form.type === 'PAGE'} onChange={() => setForm({ ...form, type: 'PAGE' })} />
                  Chính sách
                </label>
              </div>
            </div>

            <div className="admin-form-section">
              <h3 className="admin-form-section-title">Hình bài viết</h3>
              <div className={`image-upload-area ${dragActive ? 'drag-active' : ''}`}
                   style={{ border: '2px dashed #ddd', padding: (form.image || selectedImagePreview) ? '5px' : '40px 20px', textAlign: 'center', cursor: (form.image || selectedImagePreview) || uploadingType === 'main' ? 'default' : 'pointer', minHeight: '150px', background: '#f9fafb', borderRadius: '8px', marginTop: '16px' }}
                   onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => !(form.image || selectedImagePreview) && uploadingType !== 'main' && fileInputRef.current?.click()}
              >
                {uploadingType === 'main' ? (
                  <div style={{ padding: '40px 0' }}>
                    <p style={{ margin: '0 0 10px', color: 'var(--primary)', fontWeight: 'bold' }}>Đang tải lên... {uploadProgress}%</p>
                    <div style={{ width: '80%', height: '6px', background: '#e0e0e0', margin: '0 auto', borderRadius: '3px', overflow: 'hidden' }}>
                       <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }}></div>
                    </div>
                  </div>
                ) : !(form.image || selectedImagePreview) ? (
                  <div style={{ pointerEvents: 'none' }}>
                    <Image size={40} style={{ color: '#ccc', marginBottom: '10px' }} />
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Click hoặc kéo thả ảnh vào đây</p>
                  </div>
                ) : (
                  <div>
                    <img src={selectedImagePreview || form.image} alt="Preview" style={{ maxWidth: '100%', borderRadius: '4px', display: 'block' }} />
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
              </div>
              
              {(form.image || selectedImagePreview) && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm" 
                    style={{ flex: 1 }} 
                    onClick={() => {
                      setForm(current => ({ ...current, image: '' }));
                      setSelectedImageFile(null);
                      setSelectedImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    Xóa ảnh
                  </button>
                </div>
              )}
            </div>

            <div className="admin-form-section">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Hiển thị bài viết/trang
              </label>
            </div>
          </div>
        </form>
        
        <div className="admin-bottom-actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={(e) => handleSave(e, false)} disabled={saving}>
             <Save size={18} /> Lưu bài viết
          </button>
          <button type="button" className="btn btn-success btn-lg" onClick={(e) => handleSave(e, true)} disabled={saving}>
             <Check size={18} /> Lưu và quay lại
          </button>
        </div>
      </div>
    );
  }

  // Lọc và phân trang
  let filtered = data;
  if (filterType) {
    filtered = filtered.filter(item => item.type === filterType);
  }
  if (filterStatus) {
    if (filterStatus === 'active') filtered = filtered.filter(item => item.active !== false);
    if (filterStatus === 'hidden') filtered = filtered.filter(item => item.active === false);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(item => 
      (item.title && item.title.toLowerCase().includes(q)) || 
      (item.slug && item.slug.toLowerCase().includes(q))
    );
  }

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <div className="admin-header">
        <h1><Newspaper size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Quản lý Bài viết & Trang chính sách</h1>
        <div className="admin-header-actions">
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            <Plus size={16} /> Thêm mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#666' }}>Danh mục bài viết</label>
            <select className="form-input" style={{ width: '220px', padding: '6px 12px' }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">Tất cả danh mục</option>
              <option value="ARTICLE">Tin tức</option>
              <option value="PAGE">Trang chính sách</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#666' }}>Trạng thái bài viết</label>
            <select className="form-input" style={{ width: '220px', padding: '6px 12px' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hiện</option>
              <option value="hidden">Đã ẩn</option>
            </select>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: '#333' }}>Hiển thị:</label>
            <select className="form-input" style={{ width: '70px', padding: '6px' }} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: '#333' }}>Tìm kiếm:</label>
            <input
              className="form-input"
              style={{ width: '250px', padding: '6px 12px' }}
              placeholder="Nhập tên bài viết..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header" style={{ marginBottom: '15px' }}>
          <h3>Danh sách ({filtered.length})</h3>
        </div>
        <table className="admin-table" style={{ verticalAlign: 'middle', border: '1px solid #eee' }}>
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center', borderRight: '1px solid #eee' }}>STT <ChevronsUpDown size={12} style={{ color: '#ccc', verticalAlign: 'middle' }} /></th>
              <th style={{ width: '70px', textAlign: 'center', borderRight: '1px solid #eee' }}>Ảnh</th>
              <th style={{ borderRight: '1px solid #eee' }}>Tiêu đề</th>
              <th style={{ width: '130px', textAlign: 'center', borderRight: '1px solid #eee' }}>Loại</th>
              <th style={{ width: '130px', textAlign: 'center', borderRight: '1px solid #eee' }}>Ngày tạo <ChevronsUpDown size={12} style={{ color: '#ccc', verticalAlign: 'middle' }} /></th>
              <th style={{ width: '90px', textAlign: 'center', borderRight: '1px solid #eee' }}>Hiển thị</th>
              <th style={{ width: '260px', textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length > 0 ? paginated.map((item, index) => (
              <tr key={item.id}>
                <td style={{ textAlign: 'center', borderRight: '1px solid #eee' }}>{(currentPage - 1) * pageSize + index + 1}</td>
                <td style={{ textAlign: 'center', borderRight: '1px solid #eee' }}>
                  {item.image ? (
                    <img src={item.image} alt={item.title} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', background: '#f8f9fa', display: 'inline-block' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Newspaper size={20} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}
                </td>
                <td style={{ borderRight: '1px solid #eee' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/{item.slug}</div>
                </td>
                <td style={{ textAlign: 'center', borderRight: '1px solid #eee' }}>
                  <span className={`badge ${item.type === 'PAGE' ? 'badge-info' : 'badge-primary'}`}>
                    {item.type === 'PAGE' ? 'Chính sách' : 'Tin tức'}
                  </span>
                </td>
                <td style={{ textAlign: 'center', borderRight: '1px solid #eee' }}>
                  <input 
                    type="date" 
                    className="form-input" 
                    style={{ padding: '0', fontSize: '13px', width: '105px', textAlign: 'center', border: 'none', background: 'transparent', cursor: 'pointer' }}
                    defaultValue={item.createdAt ? item.createdAt.substring(0, 10) : ''}
                    onBlur={(e) => {
                      const val = e.target.value;
                      const oldVal = item.createdAt ? item.createdAt.substring(0, 10) : '';
                      if (val && val !== oldVal) handleQuickUpdate(item.id, 'createdAt', val);
                    }}
                  />
                </td>
                <td style={{ textAlign: 'center', borderRight: '1px solid #eee' }}>
                  <label className="toggle-switch" style={{ display: 'inline-block', margin: '0 auto', transform: 'scale(0.8)' }}>
                    <input type="checkbox" checked={item.active !== false} onChange={(e) => handleQuickUpdate(item.id, 'active', e.target.checked)} />
                    <span className="toggle-slider" style={{ background: item.active !== false ? '#0d6efd' : '#ccc' }}></span>
                  </label>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div className="actions" style={{ justifyContent: 'center', gap: '5px' }}>
                    <button className="admin-btn-edit" style={{ background: '#198754', color: '#fff', borderRadius: '4px', padding: '4px 8px' }} onClick={() => handleDuplicate(item)} title="Copy">
                      <Copy size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Copy
                    </button>
                    <button className="admin-btn-edit" style={{ background: '#0d6efd', color: '#fff', borderRadius: '4px', padding: '4px 8px' }} onClick={() => openEdit(item)} title="Sửa">
                      <Edit2 size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Chỉnh sửa
                    </button>
                    <button className="admin-btn-delete" style={{ background: '#dc3545', color: '#fff', borderRadius: '4px', padding: '4px 8px' }} onClick={() => handleDelete(item.id, item.title)} title="Xóa">
                      <Trash2 size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> Xóa
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Chưa có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px', paddingBottom: '20px' }}>
          <button 
            className="btn btn-outline btn-sm" 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            style={{ padding: '6px 12px', minWidth: '100px' }}
          >
            Trang trước
          </button>
          
          <div style={{ display: 'flex', gap: '5px' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setCurrentPage(page)}
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  padding: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: currentPage === page ? 'bold' : 'normal'
                }}
              >
                {page}
              </button>
            ))}
          </div>

          <button 
            className="btn btn-outline btn-sm" 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            style={{ padding: '6px 12px', minWidth: '100px' }}
          >
            Trang sau
          </button>
        </div>
      )}
    </>
  );
}
