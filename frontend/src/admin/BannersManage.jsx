import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '../components/ToastContext';
import { Images, Plus, Edit2, Trash2, Upload, X } from 'lucide-react';
import { http } from '../api/client';

const EMPTY = {
  title: '', description: '', badge: '', imageUrl: '', linkUrl: '/products',
  background: 'linear-gradient(135deg, #8b0010 0%, #d00016 55%, #ff4757 100%)',
  sortOrder: 0, active: true,
};

export default function BannersManage() {
  const { showToast } = useToast();
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = () => http.get('/admin/banners').then((res) => setBanners(res.data));

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const openAdd = () => {
    setForm({ ...EMPTY, sortOrder: banners.length + 1 });
    setEditId(null);
    setModal(true);
  };

  const openEdit = (banner) => {
    setForm({ ...EMPTY, ...banner });
    setEditId(banner.id);
    setModal(true);
  };

  const uploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const response = await http.post('/admin/uploads', data, { params: { folder: 'banners' } });
      setForm((current) => ({ ...current, imageUrl: response.data.url }));
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể tải ảnh lên');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editId) await http.put(`/admin/banners/${editId}`, form);
      else await http.post('/admin/banners', form);
      await load();
      setModal(false);
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể lưu banner');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (banner) => {
    if (!window.confirm(`Xóa banner "${banner.title}"?`)) return;
    try {
      await http.delete(`/admin/banners/${banner.id}`);
      await load();
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể xóa banner');
    }
  };

  return (
    <>
      <div className="admin-header">
        <h1><Images size={24} /> Quản lý banner</h1>
        <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={16} /> Thêm banner</button>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header"><h3>Banner trang chủ ({banners.length})</h3></div>
        <div className="banner-admin-grid">
          {banners.map((banner) => (
            <article className="banner-admin-card" key={banner.id}>
              <div
                className="banner-admin-preview"
                style={{
                  background: banner.imageUrl
                    ? `${banner.background || 'linear-gradient(135deg, #111827aa, #11182766)'}, url(${banner.imageUrl}) center/cover`
                    : banner.background,
                }}
              >
                <span>{banner.badge}</span>
                <strong>{banner.title}</strong>
              </div>
              <div className="banner-admin-meta">
                <span>Thứ tự: {banner.sortOrder ?? 0}</span>
                <span className={`badge ${banner.active ? 'badge-success' : 'badge-danger'}`}>
                  {banner.active ? 'Đang hiện' : 'Đang ẩn'}
                </span>
              </div>
              <div className="actions">
                <button className="admin-btn-edit" onClick={() => openEdit(banner)}><Edit2 size={14} /> Sửa</button>
                <button className="admin-btn-delete" onClick={() => remove(banner)}><Trash2 size={14} /> Xóa</button>
              </div>
            </article>
          ))}
          {banners.length === 0 && <div className="empty-state">Chưa có banner nào</div>}
        </div>
      </div>

      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(false)}>
          <div className="admin-modal banner-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editId ? 'Chỉnh sửa banner' : 'Thêm banner'}</h2>
              <button className="admin-modal-close" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={save}>
              <div className="admin-modal-body">
                <div className="banner-form-preview" style={{
                  background: form.imageUrl
                    ? `${form.background || 'linear-gradient(135deg, #111827aa, #11182766)'}, url(${form.imageUrl}) center/cover`
                    : form.background,
                }}>
                  <span>{form.badge || 'NHÃN BANNER'}</span>
                  <strong>{form.title || 'Tiêu đề banner'}</strong>
                  <p>{form.description || 'Mô tả sẽ hiển thị tại đây'}</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Tiêu đề *</label>
                  <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-textarea" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Nhãn nhỏ</label>
                    <input className="form-input" value={form.badge || ''} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Đường dẫn khi bấm</label>
                    <input className="form-input" value={form.linkUrl || ''} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="/products" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Ảnh banner</label>
                  <div className="banner-upload-row">
                    <input className="form-input" value={form.imageUrl || ''} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="URL ảnh hoặc tải ảnh lên" />
                    <button type="button" className="btn btn-outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      <Upload size={16} /> {uploading ? 'Đang tải...' : 'Thay ảnh'}
                    </button>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(e) => uploadImage(e.target.files?.[0])} />
                  </div>
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Nền/gradient dự phòng</label>
                    <input className="form-input" value={form.background || ''} onChange={(e) => setForm({ ...form, background: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Thứ tự</label>
                    <input className="form-input" type="number" min="0" value={form.sortOrder ?? 0} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
                  </div>
                </div>
                <label className="check-row">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  Hiển thị banner trên trang chủ
                </label>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setModal(false)}>Hủy</button>
                <button className="btn btn-primary btn-sm" disabled={saving || uploading}>{saving ? 'Đang lưu...' : 'Lưu banner'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

