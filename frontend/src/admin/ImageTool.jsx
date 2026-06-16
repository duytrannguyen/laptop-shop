/**
 * ImageTool.jsx
 * Canvas-based image tool: custom frame template + logo watermark + bulk processing.
 *
 * Layer order (bottom → top):
 *   1. Frame image (PNG template, e.g. decorative border)  ← NEW
 *   2. Product image (centered inside "safe zone" of frame)
 *   3. Frame overlay (if frameMode === 'overlay')          ← NEW
 *   4. Logo watermark
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import JSZip from 'jszip';
import {
  Upload, Download, Layers, Settings2, Trash2,
  CheckCircle, AlertCircle, RotateCcw, Grid, Play,
  Image as ImageIcon, LayoutTemplate, X
} from 'lucide-react';
import { useSite } from '../context/SiteContext';

/* ─────────────── Constants ─────────────── */
const POSITIONS = [
  { id: 'bottom-right',  label: 'Dưới phải' },
  { id: 'bottom-left',   label: 'Dưới trái' },
  { id: 'top-right',     label: 'Trên phải' },
  { id: 'top-left',      label: 'Trên trái' },
  { id: 'center',        label: 'Giữa' },
  { id: 'bottom-center', label: 'Dưới giữa' },
];

const RATIOS = [
  { id: '1:1',  label: '1:1',  w: 1,  h: 1 },
  { id: '4:3',  label: '4:3',  w: 4,  h: 3 },
  { id: '16:9', label: '16:9', w: 16, h: 9 },
  { id: 'free', label: 'Gốc',  w: 0,  h: 0 },
];

const OUTPUT_W = 800;

/* ─────────────── Canvas core ─────────────── */
async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * processImage — composite layers on canvas
 *
 * opts:
 *   frameDataUrl   — PNG frame template (null = no frame)
 *   frameMode      — 'background' | 'overlay'
 *   framePaddingPct— safe zone inside frame where product is drawn (0-50%)
 *   bgColor        — fallback solid color when no frame (or frame is transparent bg)
 *   logoDataUrl    — watermark logo (null = skip)
 *   logoPosition   — string key
 *   logoSizePct    — 5-50
 *   logoOpacity    — 0-1
 *   ratio          — { w, h }
 *   outputWidth    — px
 */
async function processImage(srcDataUrl, opts) {
  const {
    frameDataUrl   = null,
    frameMode      = 'background',
    framePaddingPct = 10,
    bgColor        = '#ffffff',
    logoDataUrl    = null,
    logoPosition   = 'bottom-right',
    logoSizePct    = 22,
    logoOpacity    = 0.9,
    ratio          = { w: 1, h: 1 },
    outputWidth    = OUTPUT_W,
  } = opts;

  const srcImg = await loadImage(srcDataUrl);

  /* Canvas size */
  let canvasW, canvasH;
  if (ratio.w && ratio.h) {
    canvasW = outputWidth;
    canvasH = Math.round(outputWidth * ratio.h / ratio.w);
  } else {
    canvasW = outputWidth;
    canvasH = Math.round(outputWidth * srcImg.height / srcImg.width);
  }

  const canvas = document.createElement('canvas');
  canvas.width  = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');

  // ── Layer 1: solid background ──────────────────────────
  if (bgColor === 'transparent') {
    ctx.clearRect(0, 0, canvasW, canvasH);
  } else {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  // ── Layer 2: Frame as BACKGROUND (drawn under product) ──
  let frameImg = null;
  if (frameDataUrl) {
    frameImg = await loadImage(frameDataUrl);
    if (frameMode === 'background') {
      ctx.drawImage(frameImg, 0, 0, canvasW, canvasH);
    }
  }

  // ── Layer 3: Product image (centred in safe zone) ───────
  const pad = Math.round(Math.min(canvasW, canvasH) * framePaddingPct / 100);
  const safe = { x: pad, y: pad, w: canvasW - pad * 2, h: canvasH - pad * 2 };
  const scale = Math.min(safe.w / srcImg.width, safe.h / srcImg.height);
  const dw = srcImg.width  * scale;
  const dh = srcImg.height * scale;
  const dx = safe.x + (safe.w - dw) / 2;
  const dy = safe.y + (safe.h - dh) / 2;
  ctx.drawImage(srcImg, dx, dy, dw, dh);

  // ── Layer 4: Frame as OVERLAY (drawn over product) ──────
  if (frameImg && frameMode === 'overlay') {
    ctx.drawImage(frameImg, 0, 0, canvasW, canvasH);
  }

  // ── Layer 5: Logo watermark ──────────────────────────────
  if (logoDataUrl) {
    const logo = await loadImage(logoDataUrl);
    const logoW  = Math.round(canvasW * logoSizePct / 100);
    const logoH  = Math.round(logoW * logo.height / logo.width);
    const margin = Math.round(Math.min(canvasW, canvasH) * 0.03);

    let lx, ly;
    switch (logoPosition) {
      case 'bottom-right':  lx = canvasW - logoW - margin; ly = canvasH - logoH - margin; break;
      case 'bottom-left':   lx = margin;                   ly = canvasH - logoH - margin; break;
      case 'top-right':     lx = canvasW - logoW - margin; ly = margin;                   break;
      case 'top-left':      lx = margin;                   ly = margin;                   break;
      case 'center':        lx = (canvasW - logoW) / 2;    ly = (canvasH - logoH) / 2;   break;
      case 'bottom-center': lx = (canvasW - logoW) / 2;    ly = canvasH - logoH - margin; break;
      default:              lx = canvasW - logoW - margin; ly = canvasH - logoH - margin;
    }

    ctx.globalAlpha = logoOpacity;
    ctx.drawImage(logo, lx, ly, logoW, logoH);
    ctx.globalAlpha = 1;
  }

  return canvas.toDataURL('image/jpeg', 0.93);
}

/* ─────────────── Helpers ─────────────── */
function readFileAsDataUrl(file) {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target.result);
    r.readAsDataURL(file);
  });
}

/* ─────────────── Component ─────────────── */
export default function ImageTool() {
  const { settings } = useSite();

  /* Frame state */
  const [frameSrc,   setFrameSrc]   = useState(null);   // dataURL or URL
  const [frameMode,  setFrameMode]  = useState('background'); // 'background' | 'overlay'

  /* Logo state */
  const [logoSrc, setLogoSrc] = useState('');

  /* Options */
  const [opts, setOpts] = useState({
    framePaddingPct: 10,
    bgColor:         '#ffffff',
    ratio:           RATIOS[0],
    logoPosition:    'bottom-right',
    logoSizePct:     22,
    logoOpacity:     0.9,
  });

  /* Queue */
  const [queue,      setQueue]      = useState([]);
  const [processing, setProcessing] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(null);

  const dropRef  = useRef(null);
  const fileRef  = useRef(null);
  const logoRef  = useRef(null);
  const frameRef = useRef(null);

  /* Auto-load logo from site settings */
  useEffect(() => {
    if (settings?.logoUrl && !logoSrc) setLogoSrc(settings.logoUrl);
  }, [settings]);

  const setOpt = (key) => (val) => setOpts((o) => ({ ...o, [key]: val }));

  /* ── File readers ── */
  const readFiles = useCallback((files) => {
    Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .forEach(async (file) => {
        const src = await readFileAsDataUrl(file);
        setQueue((q) => [...q, { name: file.name, src, result: null, status: 'pending' }]);
      });
  }, []);

  const handleFrameFile = async (file) => {
    if (!file) return;
    const src = await readFileAsDataUrl(file);
    setFrameSrc(src);
    if (frameRef.current) frameRef.current.value = '';
  };

  const handleLogoFile = async (file) => {
    if (!file) return;
    const src = await readFileAsDataUrl(file);
    setLogoSrc(src);
    if (logoRef.current) logoRef.current.value = '';
  };

  /* ── Drag & Drop ── */
  const onDrop = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-active');
    readFiles(e.dataTransfer.files);
  }, [readFiles]);

  /* ── Process all ── */
  const processAll = async () => {
    setProcessing(true);
    const processOpts = {
      frameDataUrl:    frameSrc || null,
      frameMode,
      framePaddingPct: opts.framePaddingPct,
      bgColor:         opts.bgColor,
      logoDataUrl:     logoSrc || null,
      logoPosition:    opts.logoPosition,
      logoSizePct:     opts.logoSizePct,
      logoOpacity:     opts.logoOpacity,
      ratio:           opts.ratio,
    };

    const updated = [...queue];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status === 'done') continue;
      updated[i] = { ...updated[i], status: 'processing' };
      setQueue([...updated]);
      try {
        const result = await processImage(updated[i].src, processOpts);
        updated[i] = { ...updated[i], result, status: 'done' };
      } catch (err) {
        console.error(err);
        updated[i] = { ...updated[i], status: 'error' };
      }
      setQueue([...updated]);
    }
    setProcessing(false);
  };

  /* Reprocess all done items with new settings */
  const reprocessAll = async () => {
    setQueue((q) => q.map((item) => ({ ...item, result: null, status: 'pending' })));
    await new Promise((r) => setTimeout(r, 50));
    processAll();
  };

  /* ── Download ── */
  const downloadOne = (item) => {
    const a = document.createElement('a');
    a.href = item.result;
    a.download = item.name.replace(/\.[^.]+$/, '') + '_frame.jpg';
    a.click();
  };

  const downloadAll = async () => {
    const done = queue.filter((i) => i.status === 'done');
    if (!done.length) return;
    const zip = new JSZip();
    done.forEach((item) => {
      const base64 = item.result.split(',')[1];
      zip.file(item.name.replace(/\.[^.]+$/, '') + '_frame.jpg', base64, { base64: true });
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'product_images.zip';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const clearAll   = () => { setQueue([]); setPreviewIdx(null); };
  const removeItem = (i) => setQueue((q) => q.filter((_, idx) => idx !== i));

  const doneCount  = queue.filter((i) => i.status === 'done').length;
  const totalCount = queue.length;

  return (
    <div className="imgtool-root">

      {/* ════════════ LEFT: SETTINGS ════════════ */}
      <div className="imgtool-settings">

        {/* ── FRAME TEMPLATE ── */}
        <div className="imgtool-panel">
          <div className="imgtool-panel-header">
            <LayoutTemplate size={16} /> Khung ảnh (Frame)
          </div>

          <div className="form-group">
            {/* Frame Upload Drop Zone */}
            <div
              className={`imgtool-frame-drop${frameSrc ? ' has-frame' : ''}`}
              onClick={() => frameRef.current?.click()}
            >
              {frameSrc ? (
                <>
                  <img src={frameSrc} alt="Frame" className="imgtool-frame-thumb" />
                  <div className="imgtool-frame-overlay">
                    <span>Thay khung</span>
                  </div>
                </>
              ) : (
                <>
                  <LayoutTemplate size={28} strokeWidth={1.5} style={{ opacity: 0.4 }} />
                  <p style={{ margin: '8px 0 0', fontSize: 13, fontWeight: 600 }}>Upload ảnh khung</p>
                  <span style={{ fontSize: 11.5, opacity: 0.6 }}>PNG có nền trong suốt tốt nhất</span>
                </>
              )}
            </div>
            <input ref={frameRef} type="file" accept="image/*" hidden onChange={(e) => handleFrameFile(e.target.files?.[0])} />

            {frameSrc && (
              <button
                className="btn btn-outline btn-sm"
                style={{ marginTop: 8, width: '100%', fontSize: 12, color: '#dc2626', borderColor: '#fecaca' }}
                onClick={() => setFrameSrc(null)}
              >
                <X size={13} /> Xóa khung
              </button>
            )}
          </div>

          {/* Frame Mode */}
          {frameSrc && (
            <div className="form-group">
              <label className="form-label">Vị trí khung</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { id: 'background', label: '📐 Nền dưới', desc: 'Khung dưới sản phẩm' },
                  { id: 'overlay',    label: '🖼️ Phủ trên', desc: 'Khung phủ lên sản phẩm' },
                ].map((m) => (
                  <button
                    key={m.id}
                    className={`imgtool-mode-btn${frameMode === m.id ? ' active' : ''}`}
                    onClick={() => setFrameMode(m.id)}
                    title={m.desc}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6 }}>
                {frameMode === 'overlay'
                  ? '⚠️ Dùng PNG trong suốt ở giữa để sản phẩm hiển thị qua khung'
                  : 'Khung làm nền, sản phẩm đặt bên trên'}
              </div>
            </div>
          )}

          {/* Padding / Safe Zone */}
          <div className="form-group">
            <label className="form-label">
              {frameSrc ? 'Vùng an toàn trong khung' : 'Padding viền'}
              {' '}<span style={{ color: 'var(--primary)', fontWeight: 700 }}>{opts.framePaddingPct}%</span>
            </label>
            <input
              type="range" min={0} max={40} value={opts.framePaddingPct}
              onChange={(e) => setOpt('framePaddingPct')(+e.target.value)}
              className="imgtool-range"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              <span>Sát viền</span><span>Nhiều khoảng trống</span>
            </div>
          </div>

          {/* BG Color — only shown when no frame or frame has transparency */}
          <div className="form-group">
            <label className="form-label">Màu nền phía sau</label>
            <div className="imgtool-bg-grid">
              {[
                { color: '#ffffff', label: 'Trắng' },
                { color: '#f5f5f5', label: 'Xám nhạt' },
                { color: '#f0f5ff', label: 'Xanh nhạt' },
                { color: '#fff9f0', label: 'Kem' },
              ].map((bg) => (
                <button
                  key={bg.color}
                  className={`imgtool-bg-btn${opts.bgColor === bg.color ? ' active' : ''}`}
                  style={{ background: bg.color }}
                  onClick={() => setOpt('bgColor')(bg.color)}
                  title={bg.label}
                >
                  {opts.bgColor === bg.color && <CheckCircle size={13} color="#555" />}
                </button>
              ))}
              <input
                type="color"
                value={opts.bgColor}
                onChange={(e) => setOpt('bgColor')(e.target.value)}
                className="imgtool-color-picker"
                title="Tùy chỉnh"
              />
            </div>
          </div>

          {/* Output Ratio */}
          <div className="form-group">
            <label className="form-label">Tỉ lệ output</label>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {RATIOS.map((r) => (
                <button
                  key={r.id}
                  className={`btn btn-sm btn-${opts.ratio.id === r.id ? 'primary' : 'outline'}`}
                  style={{ fontSize: 12, padding: '5px 10px' }}
                  onClick={() => setOpt('ratio')(r)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── LOGO WATERMARK ── */}
        <div className="imgtool-panel">
          <div className="imgtool-panel-header"><Layers size={16} /> Logo Watermark</div>

          <div className="form-group">
            <label className="form-label">Logo</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                className="form-input"
                value={logoSrc.startsWith('data:') ? '[Ảnh đã upload]' : logoSrc}
                onChange={(e) => setLogoSrc(e.target.value)}
                placeholder="URL hoặc upload..."
                style={{ flex: 1, fontSize: 12 }}
                readOnly={logoSrc.startsWith('data:')}
              />
              <button className="btn btn-outline btn-sm" onClick={() => logoRef.current?.click()}><Upload size={13} /></button>
              {logoSrc && (
                <button className="btn btn-outline btn-sm" style={{ color: '#dc2626', borderColor: '#fecaca' }} onClick={() => setLogoSrc('')}>
                  <X size={13} />
                </button>
              )}
            </div>
            <input ref={logoRef} type="file" accept="image/*" hidden onChange={(e) => handleLogoFile(e.target.files?.[0])} />

            {logoSrc && (
              <div className="imgtool-logo-preview">
                <img src={logoSrc} alt="Logo" />
              </div>
            )}

            {settings?.logoUrl && !logoSrc && (
              <button
                className="btn btn-outline btn-sm"
                style={{ marginTop: 8, width: '100%', fontSize: 12 }}
                onClick={() => setLogoSrc(settings.logoUrl)}
              >
                Dùng logo website
              </button>
            )}
          </div>

          {/* Logo Position */}
          <div className="form-group">
            <label className="form-label">Vị trí logo</label>
            <div className="imgtool-pos-grid">
              {POSITIONS.map((p) => (
                <button
                  key={p.id}
                  className={`imgtool-pos-btn${opts.logoPosition === p.id ? ' active' : ''}`}
                  onClick={() => setOpt('logoPosition')(p.id)}
                  title={p.label}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Logo Size */}
          <div className="form-group">
            <label className="form-label">Kích thước <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{opts.logoSizePct}%</span></label>
            <input type="range" min={5} max={50} value={opts.logoSizePct} onChange={(e) => setOpt('logoSizePct')(+e.target.value)} className="imgtool-range" />
          </div>

          {/* Opacity */}
          <div className="form-group">
            <label className="form-label">Độ mờ <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{Math.round(opts.logoOpacity * 100)}%</span></label>
            <input type="range" min={10} max={100} value={Math.round(opts.logoOpacity * 100)} onChange={(e) => setOpt('logoOpacity')(e.target.value / 100)} className="imgtool-range" />
          </div>
        </div>

      </div>{/* end .imgtool-settings */}

      {/* ════════════ RIGHT: UPLOAD & QUEUE ════════════ */}
      <div className="imgtool-main">

        {/* Drop Zone */}
        <div
          ref={dropRef}
          className="image-upload-area"
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-active'); }}
          onDragLeave={(e) => e.currentTarget.classList.remove('drag-active')}
          onClick={() => fileRef.current?.click()}
          style={{ cursor: 'pointer' }}
        >
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => readFiles(e.target.files)} />
          <Upload size={36} />
          <p>Kéo thả ảnh sản phẩm vào đây</p>
          <span>JPG, PNG, WEBP — nhiều ảnh cùng lúc</span>
        </div>

        {/* Status summary */}
        {(frameSrc || logoSrc) && totalCount === 0 && (
          <div className="imgtool-config-summary">
            {frameSrc && <span className="imgtool-config-tag frame">🖼️ Có khung ảnh</span>}
            {logoSrc  && <span className="imgtool-config-tag logo">💠 Có logo</span>}
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>— Upload ảnh sản phẩm để bắt đầu</span>
          </div>
        )}

        {/* Toolbar */}
        {totalCount > 0 && (
          <div className="imgtool-toolbar">
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong>{totalCount}</strong> ảnh&nbsp;•&nbsp;<strong style={{ color: 'var(--success)' }}>{doneCount}</strong> đã xử lý
            </span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-sm" onClick={processAll} disabled={processing}>
                <Play size={13} /> {processing ? 'Đang xử lý...' : 'Xử lý tất cả'}
              </button>
              {doneCount > 0 && (
                <>
                  <button className="btn btn-outline btn-sm" onClick={reprocessAll} disabled={processing} title="Áp dụng lại cài đặt mới">
                    <RotateCcw size={13} /> Làm lại
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={downloadAll}>
                    <Download size={13} /> Tải ZIP ({doneCount})
                  </button>
                </>
              )}
              <button className="btn btn-outline btn-sm" style={{ color: '#dc2626', borderColor: '#fecaca' }} onClick={clearAll}>
                <X size={13} /> Xóa hết
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        {totalCount > 0 && (
          <div className="imgtool-grid">
            {queue.map((item, idx) => (
              <div key={idx} className={`imgtool-card status-${item.status}`}>
                <div className="imgtool-card-img" onClick={() => setPreviewIdx(idx)} style={{ cursor: 'zoom-in' }}>
                  <img src={item.result || item.src} alt={item.name} />
                  {item.status === 'processing' && (
                    <div className="imgtool-card-overlay"><div className="spinner" style={{ width: 26, height: 26 }} /></div>
                  )}
                  {item.status === 'done'  && <div className="imgtool-card-badge done"><CheckCircle size={11} /> Xong</div>}
                  {item.status === 'error' && <div className="imgtool-card-badge error"><AlertCircle size={11} /> Lỗi</div>}
                </div>
                <div className="imgtool-card-footer">
                  <span className="imgtool-card-name" title={item.name}>{item.name}</span>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {item.result && (
                      <button className="btn btn-outline btn-sm" style={{ padding: '3px 7px' }} onClick={() => downloadOne(item)} title="Tải về">
                        <Download size={11} />
                      </button>
                    )}
                    <button className="btn btn-outline btn-sm" style={{ padding: '3px 7px', color: '#dc2626', borderColor: '#fecaca' }} onClick={() => removeItem(idx)}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalCount === 0 && (
          <div className="empty-state" style={{ marginTop: 8 }}>
            <Grid size={44} />
            <p>Hàng đợi trống</p>
            <p style={{ fontSize: 13 }}>Kéo thả ảnh sản phẩm vào vùng trên</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {previewIdx !== null && (
        <div className="admin-modal-overlay" onClick={() => setPreviewIdx(null)}>
          <div style={{ position: 'relative', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewIdx(null)}
              style={{ position: 'absolute', top: -12, right: -12, zIndex: 10, width: 34, height: 34, borderRadius: '50%', background: '#fff', border: 'none', fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
            >✕</button>
            <img
              src={queue[previewIdx]?.result || queue[previewIdx]?.src}
              alt="Preview"
              style={{ maxWidth: '85vw', maxHeight: '85vh', borderRadius: 10, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', display: 'block' }}
            />
            <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: 10, fontSize: 13 }}>
              {queue[previewIdx]?.name} — {queue[previewIdx]?.status === 'done' ? '✅ Đã xử lý' : '🖼️ Bản gốc'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
