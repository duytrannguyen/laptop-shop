import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { Newspaper, Plus, X, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { CKEditor } from 'ckeditor4-react';
import { http, API } from '../../api/client';

const EMPTY = { title: '', slug: '', image: '', content: '', active: true, type: 'PAGE' };

export default function PagesManage() {
  const { showToast, confirm } = useToast();
  const [data, setData] = useState([]);
  const [view, setView] = useState('list');
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    http.get('/admin/posts?type=PAGE').then((r) => setData(r.data)).catch(() => {});
  };

  useEffect(load, []);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setView('form'); };
  const openEdit = (item) => {
    setForm({
      title: item.title || '', slug: item.slug || '',
      image: item.image || '', content: item.content || '',
      active: item.active ?? true, type: 'PAGE'
    });
    setEditId(item.id);
    setView('form');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await http.put(`/admin/posts/${editId}`, form);
      } else {
        await http.post('/admin/posts', form);
      }
      setView('list');
      load();
    } catch (err) {
      showToast('Lỗi: ' + (err.response?.data?.message || 'Không thể lưu'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!await confirm(`Xác nhận xóa trang "${title}"?`)) return;
    try {
      await http.delete(`/admin/posts/${id}`);
      load();
    } catch {
      showToast('Không thể xóa trang');
    }
  };

  if (view === 'form') {
    return (
      <div className="admin-product-page fade-in">
        <div className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn btn-outline btn-sm" onClick={() => setView('list')} type="button">
              <ArrowLeft size={16} />
            </button>
            <h1>{editId ? 'Sửa trang' : 'Thêm trang mới'}</h1>
          </div>
        </div>
        
        <form onSubmit={handleSave} className="admin-form-grid" style={{ display: 'block' }}>
          <div className="admin-form-section">
            <div className="form-group">
              <label className="form-label">Tiêu đề *</label>
              <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Tiêu đề trang" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Slug *</label>
                <input className="form-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required placeholder="tieu-de-trang" />
              </div>
              <div className="form-group">
                <label className="form-label">Ảnh đại diện</label>
                <input className="form-input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div className="form-group" style={{ zIndex: 3 }}>
              <label className="form-label">Nội dung *</label>
              <div className="ckeditor-wrap">
                <CKEditor
                  key={`content-${editId || 'new'}`}
                  editorUrl="https://cdn.ckeditor.com/4.22.1/full-all/ckeditor.js"
                  initData={form.content}
                  onChange={(e) => setForm({ ...form, content: e.editor.getData() })}
                  config={{
                    filebrowserBrowseUrl: '/admin/file-browser',
                    filebrowserUploadUrl: `${API}/admin/uploads/ckeditor?folder=posts&token=${localStorage.getItem('admin_token')}`,
                    filebrowserUploadMethod: 'form',
                    versionCheck: false,
                    height: 300,
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
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', marginBottom: '16px' }}>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Hiển thị
            </label>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setView('list')}>Hủy</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? 'Đang lưu...' : (editId ? 'Cập nhật' : 'Thêm mới')}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className="admin-header">
        <h1><Newspaper size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Quản lý trang</h1>
        <div className="admin-header-actions">
          <button className="btn btn-primary btn-sm" onClick={openAdd} id="add-post-btn">
            <Plus size={16} /> Thêm trang
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>Danh sách trang ({data.length})</h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tiêu đề</th>
              <th>Slug</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? data.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.image ? (
                    <img src={item.image} alt={item.title} />
                  ) : (
                    <div style={{ width: '60px', height: '45px', background: '#f3f4f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Newspaper size={20} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}
                </td>
                <td>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.content?.substring(0, 80)}...
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>/{item.slug}</td>
                <td>
                  <span className={`badge ${item.active !== false ? 'badge-success' : 'badge-danger'}`}>
                    {item.active !== false ? 'Hiện' : 'Ẩn'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button className="admin-btn-edit" onClick={() => openEdit(item)}><Edit2 size={14} /> Sửa</button>
                    <button className="admin-btn-delete" onClick={() => handleDelete(item.id, item.title)}><Trash2 size={14} /> Xóa</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Chưa có trang nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </>
  );
}

