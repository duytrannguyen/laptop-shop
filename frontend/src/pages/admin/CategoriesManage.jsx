import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import { FolderTree, Plus, X, Edit2, Trash2, FolderOpen, Tag, GripVertical, Folder, FolderPlus } from 'lucide-react';
import { http } from '../../api/client';

/* ──────────────────────────────────────────────
   CONSTANTS & UTILS
────────────────────────────────────────────── */
const INDENT = 28;       // px per level indent
const MAX_LEVEL = 5;     // Hỗ trợ sâu 5 cấp
const EMPTY_FORM = { name: '', slug: '', image: '', active: true, parentIds: [] };

function toSlug(str) {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, () => 'd')
    .toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

/** Làm phẳng cây thành mảng [{...item, _level}] */
function flattenTree(nodes, level = 0) {
  const result = [];
  (nodes || []).forEach(node => {
    result.push({ ...node, _level: level });
    if (node.children?.length > 0) {
      result.push(...flattenTree(node.children, level + 1));
    }
  });
  return result;
}

/** Tính parentId và sortOrder từ flat list */
function buildPayload(flat) {
  return flat.map((item, idx) => {
    let parentId = null;
    if (item._level > 0) {
      for (let i = idx - 1; i >= 0; i--) {
        if (flat[i]._level < item._level) { parentId = flat[i].id; break; }
      }
    }
    return { id: item.id, parentId, sortOrder: idx };
  });
}

/* ──────────────────────────────────────────────
   PARENT SELECTOR (multi-select)
────────────────────────────────────────────── */
function ParentSelector({ value, onChange, allItems, excludeId }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const available = allItems.filter(c => c.id !== excludeId);
  const selectedNames = value.map(id => allItems.find(c => c.id === id)?.name).filter(Boolean);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggle = id => onChange(value.includes(id) ? value.filter(x => x !== id) : [...value, id]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div className="form-input" onClick={() => setOpen(!open)}
        style={{ minHeight: '38px', height: 'auto', display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '4px 8px', cursor: 'pointer' }}>
        {selectedNames.length > 0
          ? selectedNames.map((name, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', background: 'var(--primary)', color: '#fff', borderRadius: '4px', padding: '2px 8px', fontSize: '13px', gap: '4px' }}>
              <Folder size={12} />{name}
              <X size={12} style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); toggle(value[i]); }} />
            </span>
          ))
          : <span style={{ color: '#aaa', alignSelf: 'center', fontSize: '14px' }}>-- Không có (Danh mục gốc) --</span>}
      </div>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ddd', borderRadius: '0 0 6px 6px', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
          {available.length === 0
            ? <div style={{ padding: '12px', color: '#aaa', fontSize: '13px' }}>Chưa có danh mục nào</div>
            : available.map(cat => {
              const isSel = value.includes(cat.id);
              return (
                <div key={cat.id} onClick={() => toggle(cat.id)}
                  style={{ padding: '9px 14px', background: isSel ? 'var(--primary)' : 'transparent', color: isSel ? '#fff' : '#333', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = '#f0f4f8'; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}>
                  {isSel ? '✓ ' : ''}<Folder size={14} />{cat.name}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────────── */
export default function CategoriesManage() {
  const { showToast } = useToast();
  const [flat, setFlat] = useState([]);   // flat display list
  const [allCats, setAllCats] = useState([]); // for parent selector
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Drag state
  const draggingIdx = useRef(null);
  const [dropIndicator, setDropIndicator] = useState(null); // {afterIdx, level}
  const containerRef = useRef(null);

  /* ── Load ── */
  const load = () => {
    http.get('/admin/categories/tree').then(r => setFlat(flattenTree(r.data))).catch(() => {});
    http.get('/admin/categories').then(r => setAllCats(r.data)).catch(() => {});
  };
  useEffect(load, []);

  /* ── Modal helpers ── */
  const openAdd = (parentId = null) => {
    setForm({ ...EMPTY_FORM, parentIds: parentId ? [parentId] : [] });
    setEditId(null);
    setModal(true);
  };

  const openEdit = item => {
    const parentIds = allCats.filter(c => c.children?.some(ch => ch.id === item.id)).map(c => c.id);
    setForm({ name: item.name || '', slug: item.slug || '', image: item.image || '', active: item.active ?? true, parentIds });
    setEditId(item.id);
    setModal(true);
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, slug: form.slug, image: form.image || null, active: form.active, parentIds: form.parentIds || [] };
      if (editId) {
        await http.put(`/admin/categories/${editId}`, payload);
        showToast('Cập nhật danh mục thành công!');
      } else {
        await http.post('/admin/categories', payload);
        showToast('Thêm danh mục thành công!');
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
    if (!window.confirm(`Xác nhận xóa danh mục "${name}"?`)) return;
    try {
      await http.delete(`/admin/categories/${id}`);
      showToast('Đã xóa danh mục');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể xóa danh mục');
    }
  };

  /* ────────────────────────────────────────
     DRAG & DROP — nested reorder
     Kéo ngang (trái/phải) để đổi cấp
     Kéo dọc để đổi vị trí
  ──────────────────────────────────────── */
  const handleDragStart = (e, idx) => {
    draggingIdx.current = idx;
    e.dataTransfer.effectAllowed = 'move';
    // Ẩn ghost mặc định
    const ghost = document.createElement('div');
    ghost.style.cssText = 'position:absolute;top:-999px;width:1px;height:1px;';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (draggingIdx.current === null) return;

    const rect = containerRef.current?.getBoundingClientRect();
    const mouseX = e.clientX - (rect?.left || 0);
    // Tính level dựa trên vị trí X của chuột
    // X < 60 → level 0 (root), X >= 60 → level 1 (child)
    const level = Math.max(0, Math.min(MAX_LEVEL, mouseX < 60 ? 0 : Math.floor((mouseX - 30) / INDENT)));

    setDropIndicator({ afterIdx: idx, level });
  };

  const handleDragEnd = () => {
    draggingIdx.current = null;
    setDropIndicator(null);
  };

  const handleDrop = async (e, dropIdx) => {
    e.preventDefault();
    const srcIdx = draggingIdx.current;
    if (srcIdx === null || dropIndicator === null) { handleDragEnd(); return; }

    const newFlat = [...flat];
    // Lấy item được kéo
    const [moved] = newFlat.splice(srcIdx, 1);
    // Điều chỉnh index sau khi xóa
    let insertIdx = dropIdx;
    if (srcIdx < dropIdx) insertIdx--;
    insertIdx = Math.max(0, Math.min(newFlat.length, insertIdx + 1));

    // Gán level mới
    const updatedMoved = { ...moved, _level: dropIndicator.level };
    newFlat.splice(insertIdx, 0, updatedMoved);

    setFlat(newFlat);
    handleDragEnd();

    // Gọi API lưu
    try {
      const payload = buildPayload(newFlat);
      await http.put('/admin/categories/reorder', payload);
      showToast('✅ Đã lưu thứ tự');
      load();
    } catch (err) {
      showToast('Lỗi khi lưu: ' + (err.response?.data?.message || err.message));
      load(); // rollback
    }
  };

  /* ── Counts ── */
  const rootCount = flat.filter(i => i._level === 0).length;
  const childCount = flat.filter(i => i._level > 0).length;

  return (
    <>
      {/* ── HEADER ── */}
      <div className="admin-header">
        <h1><FolderTree size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Quản lý danh mục</h1>
        <div className="admin-header-actions">
          <button className="btn btn-primary btn-sm" onClick={() => openAdd()} id="add-category-btn">
            <Plus size={16} /> Thêm danh mục
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { icon: <FolderOpen size={22} style={{ color: 'var(--primary)' }} />, count: rootCount, label: 'Danh mục cha', color: 'var(--primary)' },
          { icon: <Tag size={22} style={{ color: '#10b981' }} />, count: childCount, label: 'Danh mục con', color: '#10b981' },
          { icon: <FolderTree size={22} style={{ color: '#f59e0b' }} />, count: flat.length, label: 'Tổng cộng', color: '#f59e0b' },
        ].map(({ icon, count, label, color }) => (
          <div key={label} style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '140px' }}>
            {icon}
            <div>
              <div style={{ fontSize: '22px', fontWeight: '700', color }}>{count}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── TREE LIST ── */}
      <div className="admin-table-wrap">
        <div className="admin-table-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3>Danh sách danh mục ({flat.length})</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <GripVertical size={13} /> Kéo để sắp xếp &amp; đổi cấp bậc
          </span>
        </div>

        {/* Hướng dẫn */}
        <div style={{ padding: '8px 16px', background: 'linear-gradient(90deg,#eff6ff,#f0fdf4)', borderBottom: '1px solid var(--border)', display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '12px', color: '#555' }}>
          <span>⬅️ Kéo sang trái → lên cấp cha</span>
          <span>➡️ Kéo sang phải → xuống cấp con</span>
          <span>⬆️⬇️ Kéo lên/xuống → đổi vị trí</span>
        </div>

        {/* Danh sách kéo thả */}
        <div ref={containerRef} style={{ padding: '6px 0', minHeight: '120px' }}>
          {flat.length === 0
            ? <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Chưa có danh mục nào</div>
            : flat.map((item, idx) => {
              const isRoot = item._level === 0;
              const isDragging = draggingIdx.current === idx;
              const showDropAbove = dropIndicator?.afterIdx === idx;

              return (
                <React.Fragment key={item.id}>
                  {/* Drop indicator line TRƯỚC item này */}
                  {showDropAbove && (
                    <div style={{
                      height: '3px',
                      background: 'var(--primary)',
                      marginLeft: `${dropIndicator.level * INDENT + 42}px`,
                      marginRight: '16px',
                      borderRadius: '2px',
                      boxShadow: '0 0 6px rgba(208,0,22,0.4)',
                      transition: 'margin-left 0.1s',
                    }} />
                  )}

                  {/* Item row */}
                  <div
                    draggable
                    onDragStart={e => handleDragStart(e, idx)}
                    onDragOver={e => handleDragOver(e, idx)}
                    onDrop={e => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 16px',
                      paddingLeft: `${item._level * INDENT + 12}px`,
                      borderBottom: '1px solid var(--border-light, #f0f0f0)',
                      background: isDragging ? 'rgba(208,0,22,0.04)' : isRoot ? '#fff' : 'rgba(245,248,255,0.8)',
                      opacity: isDragging ? 0.5 : 1,
                      cursor: 'grab',
                      transition: 'background 0.15s, opacity 0.15s',
                    }}
                    onMouseEnter={e => { if (!isDragging) e.currentTarget.style.background = isRoot ? '#fafbff' : 'rgba(240,245,255,0.9)'; }}
                    onMouseLeave={e => { if (!isDragging) e.currentTarget.style.background = isRoot ? '#fff' : 'rgba(245,248,255,0.8)'; }}
                  >
                    {/* Drag handle */}
                    <GripVertical size={16} style={{ color: '#bbb', flexShrink: 0, cursor: 'grab' }} />

                    {/* Icon */}
                    {isRoot
                      ? <FolderOpen size={17} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      : <Tag size={14} style={{ color: '#10b981', flexShrink: 0, marginLeft: '4px' }} />
                    }

                    {/* Tên */}
                    <span style={{ flex: 1, fontWeight: isRoot ? '700' : '500', fontSize: isRoot ? '14px' : '13px', color: isRoot ? 'var(--text)' : 'var(--text-secondary)' }}>
                      {item.name}
                    </span>

                    {/* Slug */}
                    <span style={{ fontSize: '12px', color: '#aaa', marginRight: '8px', display: 'none' /* ẩn trên mobile */ }}>
                      /{item.slug}
                    </span>

                    {/* Status badge */}
                    <span className={`badge ${item.active !== false ? 'badge-success' : 'badge-danger'}`} style={{ flexShrink: 0, fontSize: '11px' }}>
                      {item.active !== false ? 'Hiện' : 'Ẩn'}
                    </span>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      {/* Tạo con — cho phép ở mọi cấp */}
                      <button
                        onClick={e => { e.stopPropagation(); openAdd(item.id); }}
                        style={{ padding: '4px 10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Tạo danh mục con"
                      >
                        <FolderPlus size={13} /> Tạo con
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); openEdit(item); }}
                        style={{ padding: '4px 10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit2 size={13} /> Chỉnh sửa
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(item.id, item.name); }}
                        style={{ padding: '4px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Trash2 size={13} /> Xóa
                      </button>
                    </div>
                  </div>

                </React.Fragment>
              );
            })}

          {/* Drop indicator cuối danh sách */}
          {dropIndicator?.afterIdx === flat.length && (
            <div style={{ height: '3px', background: 'var(--primary)', margin: `0 16px 0 ${dropIndicator.level * INDENT + 42}px`, borderRadius: '2px' }} />
          )}
          {/* Drop zone cuối */}
          <div style={{ height: '48px' }}
            onDragOver={e => { e.preventDefault(); setDropIndicator({ afterIdx: flat.length, level: 0 }); }}
            onDrop={e => handleDrop(e, flat.length)}
          />
        </div>
      </div>

      {/* ── MODAL ── */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="admin-modal-header">
              <h2>{editId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
              <button className="admin-modal-close" onClick={() => setModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FolderOpen size={14} style={{ color: 'var(--primary)' }} />
                    Danh mục cha
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>(để trống = danh mục gốc)</span>
                  </label>
                  <ParentSelector value={form.parentIds} onChange={ids => setForm({ ...form, parentIds: ids })} allItems={allCats} excludeId={editId} />
                </div>
                <div className="form-group">
                  <label className="form-label">Tên danh mục *</label>
                  <input className="form-input" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value, slug: toSlug(e.target.value) })}
                    required placeholder="VD: Laptop Dell, MacBook..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug *</label>
                  <input className="form-input" value={form.slug}
                    onChange={e => setForm({ ...form, slug: e.target.value })}
                    required placeholder="laptop-dell" />
                </div>
                <div className="form-group">
                  <label className="form-label">Ảnh đại diện (URL)</label>
                  <input className="form-input" value={form.image}
                    onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
                  {form.image && <img src={form.image} alt="preview" style={{ marginTop: '8px', height: '60px', borderRadius: '6px', objectFit: 'contain', border: '1px solid var(--border)', background: '#f8f9fa', padding: '4px' }} />}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', cursor: 'pointer', padding: '10px 14px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} style={{ width: '16px', height: '16px' }} />
                  <span>{form.active ? '🟢 Hiển thị danh mục' : '🔴 Ẩn danh mục'}</span>
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
