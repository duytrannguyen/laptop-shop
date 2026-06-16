import React, { useState, useEffect } from 'react';
import { useToast } from '../components/ToastContext';
import { Newspaper, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { http } from '../api/client';

const EMPTY = { title: '', slug: '', image: '', content: '', active: true };

export default function PostsManage() {
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    http.get('/admin/posts').then((r) => setData(r.data)).catch(() => {});
  };

  useEffect(load, []);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (item) => {
    setForm({
      title: item.title || '', slug: item.slug || '',
      image: item.image || '', content: item.content || '',
      active: item.active ?? true,
    });
    setEditId(item.id);
    setModal(true);
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
      setModal(false);
      load();
    } catch (err) {
      showToast('Lỗi: ' + (err.response?.data?.message || 'Không thể lưu'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Xác nhận xóa bài viết "${title}"?`)) return;
    try {
      await http.delete(`/admin/posts/${id}`);
      load();
    } catch {
      showToast('Không thể xóa bài viết');
    }
  };

  return (
    <>
      <div className="admin-header">
        <h1><Newspaper size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Quản lý bài viết</h1>
        <div className="admin-header-actions">
          <button className="btn btn-primary btn-sm" onClick={openAdd} id="add-post-btn">
            <Plus size={16} /> Thêm bài viết
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>Danh sách bài viết ({data.length})</h3>
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
                  Chưa có bài viết nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editId ? 'Sửa bài viết' : 'Thêm bài viết mới'}</h2>
              <button className="admin-modal-close" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="form-group">
                  <label className="form-label">Tiêu đề *</label>
                  <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Tiêu đề bài viết" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Slug *</label>
                    <input className="form-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required placeholder="tieu-de-bai-viet" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ảnh đại diện</label>
                    <input className="form-input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Nội dung *</label>
                  <textarea
                    className="form-textarea"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    required
                    placeholder="Nội dung bài viết..."
                    style={{ minHeight: '200px' }}
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  Hiển thị
                </label>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? 'Đang lưu...' : (editId ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

