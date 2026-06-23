import React, { useEffect, useState, useCallback } from 'react';
import {
  GripVertical, Plus, Edit3, Trash2, X, Save,
  ChevronDown, ChevronRight, Minimize2, Maximize2, Menu as MenuIcon
} from 'lucide-react';
import { http } from '../../api/client';

/* ─────────── THIẾT LẬP MENU ─────────── */
export default function MenuManage() {
  return <TreeManager type="MENU" title="THIẾT LẬP MENU" createLabel="Tạo menu" />;
}

/* ─────────── Shared Tree Manager ─────────── */
export function TreeManager({ type, title, createLabel }) {
  const [items, setItems] = useState([]);
  const [expanded, setExpanded] = useState({});     // id -> bool
  const [allExpanded, setAllExpanded] = useState(true);
  const [modal, setModal] = useState(null);         // null | { mode, item?, parentId? }
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [dragId, setDragId] = useState(null);

  /* ── Fetch ── */
  const load = useCallback(() => {
    http.get(`/admin/menu-items?type=${type}`).then(r => {
      setItems(r.data);
      // Auto-expand all parents
      const exp = {};
      r.data.forEach(i => { if (!i.parentId) exp[i.id] = true; });
      setExpanded(prev => ({ ...exp, ...prev }));
    }).catch(() => {});
  }, [type]);

  useEffect(() => { load(); }, [load]);

  /* ── Tree helpers ── */
  const roots = items.filter(i => !i.parentId);
  const children = (parentId) => items.filter(i => i.parentId === parentId);

  /* ── Expand / Collapse all ── */
  const toggleAll = () => {
    if (allExpanded) {
      setExpanded({});
    } else {
      const exp = {};
      roots.forEach(r => { exp[r.id] = true; });
      setExpanded(exp);
    }
    setAllExpanded(!allExpanded);
  };

  /* ── Create / Edit modal ── */
  const openCreate = (parentId = null) => {
    setModal({ mode: 'create', parentId, label: '', url: '' });
  };

  const openEdit = (item) => {
    setModal({ mode: 'edit', item, label: item.label, url: item.url || '' });
  };

  const closeModal = () => setModal(null);

  const handleSave = async () => {
    if (!modal || !modal.label.trim()) return;
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        const maxOrder = items.length > 0
          ? Math.max(...items.filter(i => (i.parentId || null) === (modal.parentId || null)).map(i => i.sortOrder || 0)) + 1
          : 0;
        await http.post('/admin/menu-items', {
          label: modal.label.trim(),
          url: modal.url.trim() || null,
          type,
          parentId: modal.parentId || null,
          sortOrder: maxOrder,
        });
      } else {
        await http.put(`/admin/menu-items/${modal.item.id}`, {
          label: modal.label.trim(),
          url: modal.url.trim() || null,
        });
      }
      load();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa mục này? Các mục con cũng sẽ bị xóa.')) return;
    try {
      await http.delete(`/admin/menu-items/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi xóa');
    }
  };

  /* ── Reorder (save current order) ── */
  const handleReorder = async () => {
    setReordering(true);
    try {
      const payload = items.map((item, idx) => ({
        id: item.id,
        sortOrder: idx,
        parentId: item.parentId || null,
      }));
      const res = await http.put('/admin/menu-items/reorder', payload);
      setItems(res.data);
    } catch (err) {
      alert('Lỗi cập nhật thứ tự');
    } finally {
      setReordering(false);
    }
  };

  /* ── Drag & Drop ── */
  const handleDragStart = (e, id) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, overId) => {
    e.preventDefault();
    if (dragId === null || dragId === overId) return;

    setItems(prev => {
      const clone = [...prev];
      const dragIdx = clone.findIndex(i => i.id === dragId);
      const overIdx = clone.findIndex(i => i.id === overId);
      if (dragIdx === -1 || overIdx === -1) return prev;

      const [dragged] = clone.splice(dragIdx, 1);
      clone.splice(overIdx, 0, dragged);
      return clone;
    });
  };

  const handleDragEnd = () => {
    setDragId(null);
  };

  /* ── Render a single row ── */
  const renderRow = (item, depth = 0) => {
    const kids = children(item.id);
    const hasChildren = kids.length > 0;
    const isExpanded = expanded[item.id];

    return (
      <React.Fragment key={item.id}>
        <div
          className={`tree-row${depth > 0 ? ' tree-row-child' : ''}${dragId === item.id ? ' tree-row-dragging' : ''}`}
          style={{ paddingLeft: 16 + depth * 28 }}
          draggable
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={(e) => handleDragOver(e, item.id)}
          onDragEnd={handleDragEnd}
        >
          <div className="tree-row-left">
            <span className="tree-drag-handle">
              <GripVertical size={16} />
            </span>
            {hasChildren && (
              <button
                className="tree-toggle-btn"
                onClick={() => setExpanded(p => ({ ...p, [item.id]: !p[item.id] }))}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            )}
            {!hasChildren && depth === 0 && <span className="tree-dash">—</span>}
            <span className="tree-label">{item.label}</span>
            {item.url && <span className="tree-url">{item.url}</span>}
          </div>
          <div className="tree-row-actions">
            <button className="tree-btn tree-btn-sub" onClick={() => openCreate(item.id)} title="Tạo con">
              <Plus size={13} /> Tạo con
            </button>
            <button className="tree-btn tree-btn-edit" onClick={() => openEdit(item)} title="Chỉnh sửa">
              <Edit3 size={13} /> Chỉnh sửa
            </button>
            <button className="tree-btn tree-btn-delete" onClick={() => handleDelete(item.id)} title="Xóa">
              <Trash2 size={13} /> Xóa
            </button>
          </div>
        </div>
        {hasChildren && isExpanded && kids.map(child => renderRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <>
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MenuIcon size={22} />
            {title}
          </h1>
        </div>
        <div className="admin-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={toggleAll}>
            {allExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {allExpanded ? 'Thu gọn' : 'Mở rộng'}
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="tree-container">
        {roots.length === 0 && (
          <div className="tree-empty">
            Chưa có mục nào. Nhấn "{createLabel}" để thêm mới.
          </div>
        )}
        {roots.map(item => renderRow(item, 0))}

        {/* Footer actions */}
        <div className="tree-footer-actions">
          <button className="btn btn-primary" onClick={() => openCreate(null)}>
            <Edit3 size={15} /> {createLabel}
          </button>
          <button className="btn btn-secondary" onClick={handleReorder} disabled={reordering}>
            <Save size={15} /> {reordering ? 'Đang lưu...' : 'Cập nhật thứ tự'}
          </button>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{modal.mode === 'create' ? (modal.parentId ? 'Tạo mục con' : `Tạo ${createLabel.toLowerCase().replace('tạo ', '')}`) : 'Chỉnh sửa mục'}</h2>
              <button className="admin-modal-close" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="form-group">
                <label className="form-label">Tên hiển thị *</label>
                <input
                  className="form-input"
                  value={modal.label}
                  onChange={e => setModal(p => ({ ...p, label: e.target.value }))}
                  placeholder="VD: Trang chủ, Giới thiệu..."
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Đường dẫn (URL)</label>
                <input
                  className="form-input"
                  value={modal.url}
                  onChange={e => setModal(p => ({ ...p, url: e.target.value }))}
                  placeholder="VD: /, /about, /contact..."
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !modal.label.trim()}>
                <Save size={15} />
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
