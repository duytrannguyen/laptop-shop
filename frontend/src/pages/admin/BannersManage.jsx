import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  Images, Plus, Edit2, Trash2, Upload, X, Check,
  GripVertical, Eye, EyeOff, ChevronUp, ChevronDown,
  Link as LinkIcon, Image as ImageIcon, ArrowUpDown,
  Layers, SidebarOpen, Grid3x3
} from 'lucide-react';
import { http } from '../../api/client';

// ======= Constants =======
const POSITIONS = {
  SLIDER:  { label: 'Slider chính',   icon: '🎠', desc: 'Banner trượt chính giữa trang chủ' },
  SIDEBAR: { label: 'Banner phụ',     icon: '📌', desc: 'Banner nhỏ bên phải slider (Trả góp, Freeship...)' },
  STRIP:   { label: 'Banner dải dưới',icon: '🎨', desc: '4 ô màu phía dưới slider (Ưu đãi, Khuyến mãi...)' },
};

const EMPTY_SLIDER = {
  position: 'SLIDER', title: '', description: '', imageUrl: '', linkUrl: '/products',
  background: '', sortOrder: 1, active: true, type: 'Hình ảnh'
};
const EMPTY_SIDEBAR = {
  position: 'SIDEBAR', title: '', description: '', imageUrl: '', linkUrl: '/products',
  background: '', sortOrder: 1, active: true, type: 'Hình ảnh'
};
const EMPTY_STRIP = {
  position: 'STRIP', title: '', description: '', imageUrl: '', linkUrl: '/products',
  background: '', sortOrder: 1, active: true, type: 'Hình ảnh'
};

const EMPTY_BY_POS = { SLIDER: EMPTY_SLIDER, SIDEBAR: EMPTY_SIDEBAR, STRIP: EMPTY_STRIP };

const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #6d28d9, #8b5cf6)',
  'linear-gradient(135deg, #be185d, #ec4899)',
  'linear-gradient(135deg, #c2410c, #f97316)',
  'linear-gradient(135deg, #0369a1, #0ea5e9)',
  'linear-gradient(135deg, #065f46, #10b981)',
  'linear-gradient(145deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)',
  'linear-gradient(145deg, #064e3b 0%, #059669 60%, #10b981 100%)',
  'linear-gradient(135deg, #9d0011 0%, #ed1c24 50%, #ff4444 100%)',
  'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
  'linear-gradient(135deg, #b5179e, #7209b7)',
];

export default function BannersManage() {
  const { showToast, confirm } = useToast();
  const [activeTab, setActiveTab] = useState('SLIDER');
  const [allBanners, setAllBanners] = useState({ SLIDER: [], SIDEBAR: [], STRIP: [] });
  const [form, setForm] = useState(EMPTY_SLIDER);
  const [editId, setEditId] = useState(null);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const fileRef = useRef(null);

  const load = async () => {
    const res = await http.get('/admin/banners');
    const grouped = { SLIDER: [], SIDEBAR: [], STRIP: [] };
    res.data.forEach(b => {
      const pos = (b.position || 'SLIDER').toUpperCase();
      if (!grouped[pos]) grouped[pos] = [];
      grouped[pos].push(b);
    });
    setAllBanners(grouped);
  };

  useEffect(() => { load().catch(() => {}); }, []);

  const banners = allBanners[activeTab] || [];

  const openCreate = () => {
    setForm({ ...EMPTY_BY_POS[activeTab], sortOrder: banners.length + 1 });
    setEditId(null);
    setModal(true);
  };

  const openEdit = (banner) => {
    setForm({ ...EMPTY_BY_POS[activeTab], ...banner });
    setEditId(banner.id);
    setModal(true);
  };

  const processImageWithAI = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.filter = 'contrast(110%) saturate(110%)';
        ctx.drawImage(img, 0, 0, img.width, img.height);
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(objectUrl);
          blob ? resolve(new File([blob], file.name, { type: 'image/jpeg' }))
               : reject(new Error('Lỗi xử lý ảnh'));
        }, 'image/jpeg', 1.0);
      };
      img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Lỗi tải ảnh')); };
      img.src = objectUrl;
    });
  };

  const uploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      let fileToUpload = file;
      if (file.type.startsWith('image/')) {
        showToast('Đang tăng cường chất lượng ảnh...', 'info');
        fileToUpload = await processImageWithAI(file);
      }
      const data = new FormData();
      data.append('file', fileToUpload);
      const response = await http.post('/admin/uploads', data, { params: { folder: 'banners' } });
      setForm((f) => ({ ...f, imageUrl: response.data.url }));
      showToast('Tải ảnh thành công!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể tải ảnh', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, position: activeTab };
      if (editId) await http.put(`/admin/banners/${editId}`, payload);
      else await http.post('/admin/banners', payload);
      await load();
      setModal(false);
      showToast(editId ? 'Đã cập nhật banner!' : 'Đã thêm banner mới!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể lưu banner', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (banner) => {
    if (!await confirm('Xóa banner này?')) return;
    try {
      await http.delete(`/admin/banners/${banner.id}`);
      await load();
      showToast('Đã xóa banner!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Không thể xóa', 'error');
    }
  };

  const toggleActive = async (banner) => {
    try {
      await http.put(`/admin/banners/${banner.id}`, { ...banner, active: !banner.active });
      await load();
      showToast(banner.active ? 'Đã ẩn banner' : 'Đã hiển thị banner', 'success');
    } catch { showToast('Không thể cập nhật trạng thái', 'error'); }
  };

  const saveReorder = async (newBanners) => {
    setReordering(true);
    try {
      const payload = newBanners.map((b, i) => ({ id: b.id, sortOrder: i + 1 }));
      await http.put('/admin/banners/reorder', payload);
      showToast('Đã lưu thứ tự!', 'success');
    } catch { showToast('Không thể lưu thứ tự', 'error'); }
    finally { setReordering(false); }
  };

  const moveItem = async (index, dir) => {
    const list = [...banners];
    const ti = index + dir;
    if (ti < 0 || ti >= list.length) return;
    [list[index], list[ti]] = [list[ti], list[index]];
    setAllBanners(prev => ({ ...prev, [activeTab]: list }));
    await saveReorder(list);
  };

  const handleDragStart = (e, i) => { setDragIdx(i); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e, i) => { e.preventDefault(); setDragOverIdx(i); };
  const handleDrop = async (e, dropIdx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === dropIdx) { setDragIdx(null); setDragOverIdx(null); return; }
    const list = [...banners];
    const [moved] = list.splice(dragIdx, 1);
    list.splice(dropIdx, 0, moved);
    setAllBanners(prev => ({ ...prev, [activeTab]: list }));
    setDragIdx(null); setDragOverIdx(null);
    await saveReorder(list);
  };
  const handleDragEnd = () => { setDragIdx(null); setDragOverIdx(null); };

  const isSidebar = activeTab === 'SIDEBAR';
  const isStrip = activeTab === 'STRIP';
  const isSlider = activeTab === 'SLIDER';

  return (
    <>
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Images size={24} style={{ color: 'var(--primary)' }} />
            Quản lý Banner & Hình ảnh
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Quản lý toàn bộ banner: slider chính, banner phụ bên phải và dải banner dưới
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Thêm {POSITIONS[activeTab]?.label}
        </button>
      </div>

      {/* Tab navigation */}
      <div className="banner-tabs">
        {Object.entries(POSITIONS).map(([pos, info]) => (
          <button
            key={pos}
            className={`banner-tab-btn ${activeTab === pos ? 'active' : ''}`}
            onClick={() => setActiveTab(pos)}
          >
            <span className="banner-tab-icon">{info.icon}</span>
            <span className="banner-tab-label">{info.label}</span>
            <span className="banner-tab-count">{(allBanners[pos] || []).length}</span>
          </button>
        ))}
      </div>

      {/* Tab description */}
      <div className="banner-tab-desc">
        {POSITIONS[activeTab]?.desc}
        {isSidebar && <span style={{ marginLeft: 8, color: '#6366f1', fontWeight: 600 }}>· Hiển thị 2 ô bên phải slider</span>}
        {isStrip && <span style={{ marginLeft: 8, color: '#6366f1', fontWeight: 600 }}>· Hiển thị 4 ô dải màu bên dưới slider</span>}
      </div>

      {/* Preview zone for sidebar/strip */}
      {(isSidebar || isStrip) && banners.length > 0 && (
        <div className="banner-preview-zone">
          <div className="banner-preview-title">👁 Xem trước</div>
          {isSidebar && (
            <div className="banner-sidebar-preview-grid">
              {banners.slice(0, 2).map(b => (
                <div key={b.id} className="banner-sidebar-preview-item"
                  style={{ background: b.background || '#1e3a5f' }}>
                  {b.imageUrl && <img src={b.imageUrl} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.5 }} />}
                  <div style={{ position:'relative', zIndex:2 }}>
                    <div style={{ fontWeight:800, fontSize:15, marginBottom:4 }}>{b.title || 'Tiêu đề'}</div>
                    <div style={{ fontSize:12, opacity:0.85 }}>{b.description || 'Mô tả ngắn'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {isStrip && (
            <div className="banner-strip-preview-grid">
              {banners.map(b => (
                <div key={b.id} className="banner-strip-preview-item"
                  style={{ background: b.background || '#6d28d9' }}>
                  {b.title || 'Nội dung'}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Banner list */}
      <div className="banner-manage-wrap" style={{ marginTop: 16 }}>
        {banners.length === 0 ? (
          <div className="banner-empty-state">
            <span style={{ fontSize: 48 }}>{POSITIONS[activeTab]?.icon}</span>
            <h3 style={{ marginTop: 12 }}>Chưa có {POSITIONS[activeTab]?.label} nào</h3>
            <p>Bấm nút "+ Thêm" để tạo banner đầu tiên</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openCreate}>
              <Plus size={16} /> Thêm {POSITIONS[activeTab]?.label}
            </button>
          </div>
        ) : (
          <div className="banner-drag-list">
            <div className={`banner-drag-header banner-header-${activeTab.toLowerCase()}`}>
              <span className="bh-drag" />
              <span className="bh-order">#</span>
              <span className="bh-thumb">
                {isStrip ? 'Màu nền' : 'Hình ảnh'}
              </span>
              <span className="bh-info">Thông tin</span>
              {!isStrip && <span className="bh-type">Loại</span>}
              <span className="bh-status">Trạng thái</span>
              <span className="bh-actions">Thao tác</span>
            </div>

            {banners.map((banner, idx) => (
              <div
                key={banner.id}
                className={`banner-drag-row ${dragIdx === idx ? 'dragging' : ''} ${dragOverIdx === idx && dragIdx !== idx ? 'drag-over' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                style={isStrip ? { gridTemplateColumns: '36px 56px 140px 1fr 110px 120px' } : {}}
              >
                <div className="banner-drag-handle" title="Kéo để sắp xếp"><GripVertical size={18} /></div>

                <div className="banner-drag-order">
                  <span className="banner-order-num">{idx + 1}</span>
                  <div className="banner-move-btns">
                    <button className="banner-move-btn" onClick={() => moveItem(idx, -1)} disabled={idx === 0 || reordering} title="Lên"><ChevronUp size={13} /></button>
                    <button className="banner-move-btn" onClick={() => moveItem(idx, 1)} disabled={idx === banners.length - 1 || reordering} title="Xuống"><ChevronDown size={13} /></button>
                  </div>
                </div>

                {/* Thumbnail / Color preview */}
                <div className="banner-drag-thumb">
                  {isStrip ? (
                    <div className="banner-strip-color-thumb" style={{ background: banner.background || '#6d28d9' }}>
                      <span style={{ fontSize: 11, color: 'white', textAlign: 'center', padding: '0 4px', wordBreak: 'break-all' }}>
                        {banner.title?.slice(0, 20) || '...'}
                      </span>
                    </div>
                  ) : banner.imageUrl ? (
                    <img src={banner.imageUrl} alt="banner" />
                  ) : banner.background ? (
                    <div className="banner-strip-color-thumb" style={{ background: banner.background }} />
                  ) : (
                    <div className="banner-thumb-placeholder"><ImageIcon size={24} /></div>
                  )}
                </div>

                {/* Info */}
                <div className="banner-drag-info">
                  {banner.title && <p className="banner-desc-text" style={{ fontWeight: 700, color: 'var(--primary)' }}>{banner.title}</p>}
                  {banner.description ? (
                    <p className="banner-desc-text" style={{ fontWeight: 500 }}>{banner.description}</p>
                  ) : (
                    !banner.title && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Không có nội dung</span>
                  )}
                  {banner.linkUrl && (
                    <div className="banner-link-preview"><LinkIcon size={11} /><span>{banner.linkUrl}</span></div>
                  )}
                </div>

                {/* Type */}
                <div className="banner-drag-type">
                  <span className={`banner-type-badge`}>{banner.type || 'Hình ảnh'}</span>
                </div>

                {/* Status */}
                <div className="banner-drag-status">
                  <button
                    className={`banner-active-toggle ${banner.active ? 'active' : 'inactive'}`}
                    onClick={() => toggleActive(banner)}
                  >
                    {banner.active ? <Eye size={14} /> : <EyeOff size={14} />}
                    {banner.active ? 'Hiển thị' : 'Ẩn'}
                  </button>
                </div>

                {/* Actions */}
                <div className="banner-drag-actions">
                  <button className="banner-btn-edit" onClick={() => openEdit(banner)}><Edit2 size={14} /> Sửa</button>
                  <button className="banner-btn-delete" onClick={() => remove(banner)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {banners.length > 1 && (
          <div className="banner-drag-hint">
            <ArrowUpDown size={14} />
            Kéo thả hoặc dùng nút ▲▼ để thay đổi thứ tự hiển thị
          </div>
        )}
      </div>

      {/* ===== Edit/Create Modal ===== */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(false)}>
          <div className="admin-modal banner-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editId ? '✏️ Chỉnh sửa' : '➕ Thêm'} {POSITIONS[activeTab]?.label}</h2>
              <button className="admin-modal-close" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={save}>
              <div className="admin-modal-body">

                {/* Unified Form */}
                <div className="banner-form-preview" style={{
                  background: form.imageUrl ? `url(${form.imageUrl}) center/cover no-repeat` : '#e2e8f0',
                  minHeight: form.imageUrl ? 200 : 80,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {!form.imageUrl && <div style={{ textAlign: 'center', color: '#94a3b8' }}><ImageIcon size={32} style={{ margin: '0 auto 4px' }} /><p style={{ fontSize: 12 }}>Chưa có ảnh</p></div>}
                </div>

                <div className="form-group" style={{ marginTop: 14 }}>
                  <label className="form-label">Loại</label>
                  <select className="form-input" value={form.type || 'Hình ảnh'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option>Hình ảnh</option>
                    <option>Hình ảnh & Nội dung</option>
                    <option>Video</option>
                    <option>Youtube</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tiêu đề (tuỳ chọn)</label>
                  <input className="form-input" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Nhập tiêu đề..." />
                </div>

                {form.type !== 'Hình ảnh' && (
                  <div className="form-group">
                    <label className="form-label">Mô tả</label>
                    <textarea className="form-textarea" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Mô tả ngắn..." />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">{form.type === 'Youtube' ? 'ID Youtube' : form.type === 'Video' ? 'URL Video' : 'Ảnh banner'}</label>
                  {form.type !== 'Youtube' && form.type !== 'Video' && (
                    <div className="banner-upload-dropzone" onClick={() => fileRef.current?.click()}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => { e.preventDefault(); uploadImage(e.dataTransfer.files?.[0]); }}>
                      <Upload size={24} style={{ opacity: 0.4 }} />
                      <span>{uploading ? 'Đang tải...' : 'Bấm hoặc kéo thả ảnh vào đây'}</span>
                      <small>JPG, PNG, WebP, GIF</small>
                    </div>
                  )}
                  <div className="banner-upload-row" style={{ marginTop: 8 }}>
                    <input className="form-input" value={form.imageUrl || ''} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="URL hình ảnh" />
                    {form.type !== 'Youtube' && (
                      <button type="button" className="btn btn-outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                        <Upload size={16} /> Upload
                      </button>
                    )}
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={e => uploadImage(e.target.files?.[0])} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Đường dẫn khi bấm</label>
                  <input className="form-input" value={form.linkUrl || ''} onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))} placeholder="/products" />
                </div>

                {/* Common: sort order + active */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Thứ tự</label>
                    <input className="form-input" type="number" min={1} value={form.sortOrder || 1}
                      onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 1 }))}
                      style={{ maxWidth: 100 }} />
                  </div>
                  <label className="check-row" style={{ marginTop: 20 }}>
                    <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                    Hiển thị trên trang chủ
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setModal(false)}>Hủy</button>
                <button className="btn btn-primary btn-sm" disabled={saving || uploading}>
                  <Check size={16} /> {saving ? 'Đang lưu...' : 'Lưu banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
