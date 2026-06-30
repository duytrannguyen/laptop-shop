import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  GripVertical, Plus, Edit3, Trash2, X, Save,
  Menu as MenuIcon, Link as LinkIcon, ChevronRight, ChevronDown, FolderPlus
} from 'lucide-react';
import { http } from '../../api/client';
import { useToast } from '../../context/ToastContext';

/* ─────────── THIẾT LẬP MENU ─────────── */
export default function MenuManage() {
  return <TreeManager type="MENU" title="Thiết lập Menu" icon={<MenuIcon size={22} />} createLabel="Thêm mục" />;
}

/* ─────────── CONSTANTS ─────────── */
const INDENT = 28;
const MAX_LEVEL = 1;

/* ─────────── FLATTEN / BUILD PAYLOAD ─────────── */
/** items = flat list [{id, parentId, sortOrder, label, url}]
 *  trả về flat list có _level */
function flattenItems(items) {
  const result = [];
  const roots = items.filter(i => !i.parentId).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const addNode = (item, level) => {
    result.push({ ...item, _level: level });
    const kids = items.filter(i => i.parentId === item.id).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    kids.forEach(k => addNode(k, level + 1));
  };
  roots.forEach(r => addNode(r, 0));
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

/* ─────────── Shared Tree Manager ─────────── */
export function TreeManager({ type, title, icon, createLabel }) {
  const { showToast, confirm } = useToast();
  const [flat, setFlat] = useState([]);          // display flat list with _level
  const [rawItems, setRawItems] = useState([]);   // original from server
  const [expandedIds, setExpandedIds] = useState([]); // Array of expanded item ids
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // Drag state
  const draggingIdx = useRef(null);
  const [dropIndicator, setDropIndicator] = useState(null); // {afterIdx, level}
  const containerRef = useRef(null);

  /* ── Load ── */
  const load = useCallback(() => {
    http.get(`/admin/menu-items?type=${type}`).then(r => {
      setRawItems(r.data);
      setFlat(flattenItems(r.data));
    }).catch(() => {});
  }, [type]);

  useEffect(() => { load(); }, [load]);

  /* ── Modal helpers ── */
  const openCreate = (parentId = null) => {
    setModal({ mode: 'create', parentId, label: '', url: '' });
  };

  const openEdit = item => {
    setModal({ mode: 'edit', item, label: item.label, url: item.url || '' });
  };

  const closeModal = () => setModal(null);

  const handleSave = async () => {
    if (!modal || !modal.label.trim()) return;
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        const siblings = rawItems.filter(i => (i.parentId || null) === (modal.parentId || null));
        const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(i => i.sortOrder || 0)) + 1 : 0;
        await http.post('/admin/menu-items', {
          label: modal.label.trim(), url: modal.url.trim() || null,
          type, parentId: modal.parentId || null, sortOrder: maxOrder,
        });
      } else {
        await http.put(`/admin/menu-items/${modal.item.id}`, {
          label: modal.label.trim(), url: modal.url.trim() || null,
        });
      }
      load();
      closeModal();
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async id => {
    if (!await confirm('Bạn có chắc muốn xóa mục này? Các mục con cũng sẽ bị xóa.')) return;
    try {
      await http.delete(`/admin/menu-items/${id}`);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi xóa');
    }
  };

  /* ────────────────────────────────────────────
     DRAG & DROP — nested (kéo ngang đổi cấp)
  ──────────────────────────────────────────── */
  const handleDragStart = (e, idx) => {
    draggingIdx.current = idx;
    e.dataTransfer.effectAllowed = 'move';
    // Ẩn ghost
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
    // X < 60px → level 0 (root), X >= 60px → level 1 (child)
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
    const [moved] = newFlat.splice(srcIdx, 1);
    let insertIdx = dropIdx;
    if (srcIdx < dropIdx) insertIdx--;
    insertIdx = Math.max(0, Math.min(newFlat.length, insertIdx + 1));

    const updated = { ...moved, _level: dropIndicator.level };
    newFlat.splice(insertIdx, 0, updated);

    setFlat(newFlat);
    handleDragEnd();

    // Auto-save
    setSavingOrder(true);
    try {
      const payload = buildPayload(newFlat);
      const res = await http.put('/admin/menu-items/reorder', payload);
      setRawItems(res.data);
      setFlat(flattenItems(res.data));
    } catch (err) {
      showToast('Lỗi cập nhật thứ tự');
      load(); // rollback
    } finally {
      setSavingOrder(false);
    }
  };

  const rootCount = flat.filter(i => i._level === 0).length;
  const childCount = flat.filter(i => i._level > 0).length;

  return (
    <>
      {/* ── HEADER ── */}
      <div className="admin-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {icon} {title}
          {savingOrder && (
            <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '500', marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '14px', height: '14px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
              Đang lưu...
            </span>
          )}
        </h1>
        <div className="admin-header-actions">
          <button className="btn btn-primary btn-sm" onClick={() => openCreate(null)}>
            <Plus size={15} /> {createLabel}
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { count: rootCount, label: 'Mục chính', color: 'var(--primary)' },
          { count: childCount, label: 'Mục con', color: '#10b981' },
          { count: flat.length, label: 'Tổng cộng', color: '#f59e0b' },
        ].map(({ count, label, color }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 18px', minWidth: '110px' }}>
            <div style={{ fontSize: '22px', fontWeight: '700', color }}>{count}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── TREE CONTAINER ── */}
      <div className="tree-container">
        {/* Hint bar */}
        <div style={{ padding: '8px 16px', background: 'linear-gradient(90deg,#eff6ff,#f0fdf4)', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '12px', color: '#555' }}>
          <span>⬅️ Kéo sang trái → lên cấp cha</span>
          <span>➡️ Kéo sang phải → xuống cấp con</span>
          <span>⬆️⬇️ Kéo lên/xuống → đổi vị trí</span>
        </div>

        {/* List */}
        <div ref={containerRef} style={{ minHeight: '80px', padding: '4px 0' }}>
          {flat.length === 0 ? (
            <div className="tree-empty">
              Chưa có mục nào. Nhấn "<strong>{createLabel}</strong>" để thêm mới.
            </div>
          ) : (
            (() => {
              let hideUntilLevel = null;
              return flat.map((item, idx) => {
                if (hideUntilLevel !== null) {
                  if (item._level <= hideUntilLevel) {
                    hideUntilLevel = null;
                  } else {
                    return null; // hide child
                  }
                }

                const nextItem = flat[idx + 1];
                const hasChildren = nextItem && nextItem._level > item._level;
                const isCollapsed = !expandedIds.includes(item.id);

                if (hasChildren && isCollapsed) {
                  hideUntilLevel = item._level;
                }

                const isRoot = item._level === 0;
                const isDragging = draggingIdx.current === idx;
                const showDrop = dropIndicator?.afterIdx === idx;

                return (
                  <React.Fragment key={item.id}>
                  {/* Drop indicator line */}
                  {showDrop && (
                    <div style={{
                      height: '3px',
                      background: 'var(--primary)',
                      marginLeft: `${dropIndicator.level * INDENT + 44}px`,
                      marginRight: '16px',
                      borderRadius: '2px',
                      boxShadow: '0 0 6px rgba(208,0,22,0.4)',
                      transition: 'margin-left 0.1s',
                    }} />
                  )}

                  <div
                    className={`tree-row${!isRoot ? ' tree-row-child' : ''}${isDragging ? ' tree-row-dragging' : ''}`}
                    style={{ paddingLeft: `${item._level * INDENT + 12}px`, opacity: isDragging ? 0.5 : 1 }}
                    draggable
                    onDragStart={e => handleDragStart(e, idx)}
                    onDragOver={e => handleDragOver(e, idx)}
                    onDrop={e => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                  >
                    {/* Left: handle + label */}
                    <div className="tree-row-left">
                      <span className="tree-drag-handle"><GripVertical size={16} /></span>

                      {/* Expand/Collapse Toggle */}
                      <div 
                        onClick={(e) => {
                          if (hasChildren) {
                            e.stopPropagation();
                            setExpandedIds(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
                          }
                        }}
                        style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          width: '20px', height: '20px', cursor: hasChildren ? 'pointer' : 'default', 
                          flexShrink: 0 
                        }}
                      >
                        {hasChildren ? (
                          isCollapsed ? <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />
                        ) : (
                          <div style={{ width: '16px' }} />
                        )}
                      </div>

                      {/* Level indicator */}
                      {!isRoot && (
                        <ChevronRight size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                      )}

                      <span className="tree-label" style={{ fontWeight: isRoot ? '700' : '500' }}>
                        {item.label}
                      </span>

                      {item.url && (
                        <span className="tree-url" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <LinkIcon size={11} />{item.url}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="tree-row-actions">
                      {isRoot && (
                        <button className="tree-btn tree-btn-sub" onClick={() => openCreate(item.id)} title="Tạo mục con">
                          <FolderPlus size={13} /> Tạo con
                        </button>
                      )}
                      <button className="tree-btn tree-btn-edit" onClick={() => openEdit(item)}>
                        <Edit3 size={13} /> Chỉnh sửa
                      </button>
                      <button className="tree-btn tree-btn-delete" onClick={() => handleDelete(item.id)}>
                        <Trash2 size={13} /> Xóa
                      </button>
                    </div>
                  </div>
                  </React.Fragment>
                );
              })
            })()
          )}

          {/* Drop zone cuối */}
          {dropIndicator?.afterIdx === flat.length && (
            <div style={{ height: '3px', background: 'var(--primary)', margin: `0 16px 0 ${dropIndicator.level * INDENT + 44}px`, borderRadius: '2px' }} />
          )}
          <div style={{ height: '40px' }}
            onDragOver={e => { e.preventDefault(); setDropIndicator({ afterIdx: flat.length, level: 0 }); }}
            onDrop={e => handleDrop(e, flat.length)}
          />
        </div>

        {/* Footer add button */}
        <div className="tree-footer-actions">
          <button className="btn btn-primary btn-sm" onClick={() => openCreate(null)}>
            <Plus size={15} /> {createLabel}
          </button>
        </div>
      </div>

      {/* ── MODAL ── */}
      {modal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{modal.mode === 'create'
                ? (modal.parentId ? 'Tạo mục con' : createLabel)
                : 'Chỉnh sửa mục'}</h2>
              <button className="admin-modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Tên hiển thị *</label>
                <input className="form-input" value={modal.label}
                  onChange={e => setModal(p => ({ ...p, label: e.target.value }))}
                  placeholder="VD: Trang chủ, Giới thiệu..."
                  autoFocus onKeyDown={e => e.key === 'Enter' && handleSave()} />
              </div>
              <div className="form-group">
                <label className="form-label">Đường dẫn (URL)</label>
                <input className="form-input" value={modal.url}
                  onChange={e => setModal(p => ({ ...p, url: e.target.value }))}
                  placeholder="VD: /, /about, /products..."
                  onKeyDown={e => e.key === 'Enter' && handleSave()} />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-outline btn-sm" onClick={closeModal}>Hủy</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}
                disabled={saving || !modal.label.trim()}>
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
