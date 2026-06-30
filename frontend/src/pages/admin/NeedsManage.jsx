import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { FolderTree, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { http } from '../../api/client';

const EMPTY = { name: '', slug: '', active: true };

function toSlug(str) {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'd'))
    .toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export default function NeedsManage() {
  const { showToast, confirm } = useToast();
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    http.get('/admin/needs').then((r) => setData(r.data)).catch(() => {});
  };

  useEffect(load, []);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (item) => {
    setForm({ name: item.name || '', slug: item.slug || '', active: item.active ?? true });
    setEditId(item.id);
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await http.put(`/admin/needs/${editId}`, form);
      } else {
        await http.post('/admin/needs', form);
      }
      setModal(false);
      load();
    } catch (err) {
      showToast('Lỗi: ' + (err.response?.data?.message || 'Không thể lưu'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!await confirm(`Xác nhận xóa nhu cầu "${name}"?`)) return;
    try {
      await http.delete(`/admin/needs/${id}`);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể xóa nhu cầu');
    }
  };

  return (
    <>
      <div className="admin-header">
        <h1><FolderTree size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Quản lý nhu cầu</h1>
        <div className="admin-header-actions">
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            <Plus size={16} /> Thêm nhu cầu
          </button>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <h3>Danh sách nhu cầu ({data.length})</h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên nhu cầu</th>
              <th>Slug</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? data.map((item) => (
              <tr key={item.id}>
                <td><strong>#{item.id}</strong></td>
                <td style={{ fontWeight: '600' }}>{item.name}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>/{item.slug}</td>
                <td>
                  <span className={`badge ${item.active !== false ? 'badge-success' : 'badge-danger'}`}>
                    {item.active !== false ? 'Hiện' : 'Ẩn'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button className="admin-btn-edit" onClick={() => openEdit(item)}><Edit2 size={14} /> Sửa</button>
                    <button className="admin-btn-delete" onClick={() => handleDelete(item.id, item.name)}><Trash2 size={14} /> Xóa</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Chưa có nhu cầu nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="admin-modal-header">
              <h2>{editId ? 'Sửa nhu cầu' : 'Thêm nhu cầu mới'}</h2>
              <button className="admin-modal-close" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="form-group">
                  <label className="form-label">Tên nhu cầu *</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: toSlug(e.target.value) })} required placeholder="VD: Gaming" />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug *</label>
                  <input className="form-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required placeholder="gaming" />
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


