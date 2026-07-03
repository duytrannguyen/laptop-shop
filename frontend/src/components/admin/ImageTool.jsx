import React, { useEffect, useRef, useState } from 'react';
import {
  Upload, Layers, CheckCircle, LayoutTemplate, X
} from 'lucide-react';
import { http } from '../../api/client';
import { useSite } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';

const POSITIONS = [
  { id: 'bottom-right', label: 'Dưới phải' },
  { id: 'bottom-left', label: 'Dưới trái' },
  { id: 'top-right', label: 'Trên phải' },
  { id: 'top-left', label: 'Trên trái' },
  { id: 'center', label: 'Giữa' },
  { id: 'bottom-center', label: 'Dưới giữa' },
];

const RATIOS = [
  { id: '1:1', label: '1:1', w: 1, h: 1 },
  { id: '4:3', label: '4:3', w: 4, h: 3 },
  { id: '16:9', label: '16:9', w: 16, h: 9 },
  { id: 'free', label: 'Gốc', w: 0, h: 0 },
];

export default function ImageTool({ form, setForm }) {
  const { settings } = useSite();
  const { showToast } = useToast();

  /* Frame state */
  const [frameSrc, setFrameSrc] = useState(form?.frameUrl || null);
  const [frameMode, setFrameMode] = useState(form?.frameMode || 'background');

  /* Logo state */
  const [logoSrc, setLogoSrc] = useState(form?.watermarkLogoUrl || '');

  /* Options */
  const [opts, setOpts] = useState({
    framePaddingPct: form?.framePaddingPct ?? 10,
    bgColor: '#ffffff',
    ratio: RATIOS[0],
    logoPosition: form?.watermarkPosition ?? 'bottom-right',
    logoSizePct: form?.watermarkSizePct ?? 22,
    logoOpacity: form?.watermarkOpacity ?? 0.9,
  });

  const logoRef = useRef(null);
  const frameRef = useRef(null);

  /* Auto-load logo from site settings */
  useEffect(() => {
    if (form?.watermarkLogoUrl && !logoSrc) setLogoSrc(form.watermarkLogoUrl);
    else if (settings?.logoUrl && !logoSrc) setLogoSrc(settings.logoUrl);
  }, [settings, form]);

  /* Sync with form */
  useEffect(() => {
    if (!setForm) return;
    setForm(f => ({
      ...f,
      frameUrl: frameSrc,
      frameMode: frameMode,
      framePaddingPct: opts.framePaddingPct,
      watermarkLogoUrl: logoSrc,
      watermarkPosition: opts.logoPosition,
      watermarkSizePct: opts.logoSizePct,
      watermarkOpacity: opts.logoOpacity,
    }));
  }, [frameSrc, frameMode, opts.framePaddingPct, logoSrc, opts.logoPosition, opts.logoSizePct, opts.logoOpacity]);

  const setOpt = (key) => (val) => setOpts((o) => ({ ...o, [key]: val }));

  const handleFrameFile = async (file) => {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await http.post('/admin/uploads', fd, { params: { folder: 'frame' } });
      const url = res.data.url || res.data;
      setFrameSrc(url);
    } catch {
      showToast('Lỗi upload khung');
    }
    if (frameRef.current) frameRef.current.value = '';
  };

  const handleLogoFile = async (file) => {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await http.post('/admin/uploads', fd, { params: { folder: 'logo' } });
      const url = res.data.url || res.data;
      setLogoSrc(url);
    } catch {
      showToast('Lỗi upload logo');
    }
    if (logoRef.current) logoRef.current.value = '';
  };

  /* ── Reusable Sub-components to match SettingsPage ── */
  const SectionCard = ({ icon: Icon, title, color = 'var(--primary)', children }) => (
    <div className="settings-section-card">
      <div className="settings-section-header">
        <div className="settings-section-icon" style={{ background: `${color}18`, color }}>
          <Icon size={18} />
        </div>
        <h2 className="settings-section-title">{title}</h2>
      </div>
      <div className="settings-section-body">{children}</div>
    </div>
  );

  const FormField = ({ label, children }) => (
    <div className="settings-field">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ── FRAME TEMPLATE ── */}
      <SectionCard icon={LayoutTemplate} title="Khung ảnh (Frame)" color="#dc2626">
        <div className="settings-grid-2" style={{ alignItems: 'start' }}>
          
          {/* Left Column: Upload */}
          <div>
            <div
              className={`imgtool-frame-drop${frameSrc ? ' has-frame' : ''}`}
              onClick={() => frameRef.current?.click()}
              style={{ minHeight: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              {frameSrc ? (
                <>
                  <img src={frameSrc} alt="Frame" style={{ maxHeight: '220px', width: 'auto', maxWidth: '100%', margin: '0 auto', display: 'block', borderRadius: 'var(--radius-sm)' }} />
                  <div className="imgtool-frame-overlay">
                    <span>Thay khung</span>
                  </div>
                </>
              ) : (
                <>
                  <LayoutTemplate size={28} strokeWidth={1.5} style={{ opacity: 0.4, margin: '0 auto' }} />
                  <p style={{ margin: '8px 0 0', fontSize: 13, fontWeight: 600 }}>Upload ảnh khung</p>
                  <span style={{ fontSize: 11.5, opacity: 0.6 }}>PNG có nền trong suốt tốt nhất</span>
                </>
              )}
            </div>
            <input ref={frameRef} type="file" accept="image/*" hidden onChange={(e) => handleFrameFile(e.target.files?.[0])} />

            {frameSrc && (
              <button
                className="btn btn-outline btn-sm"
                style={{ marginTop: 12, width: '100%', fontSize: 12, color: '#dc2626', borderColor: '#fecaca' }}
                onClick={() => setFrameSrc(null)}
                type="button"
              >
                <X size={13} /> Xóa khung
              </button>
            )}
          </div>

          {/* Right Column: Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {frameSrc && (
              <FormField label="Vị trí khung">
                <div style={{ display: 'flex', gap: 6 }}>
                  {[
                    { id: 'background', label: '📐 Nền dưới', desc: 'Khung dưới sản phẩm' },
                    { id: 'overlay', label: '🖼️ Phủ trên', desc: 'Khung phủ lên sản phẩm' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`imgtool-mode-btn${frameMode === m.id ? ' active' : ''}`}
                      onClick={() => setFrameMode(m.id)}
                      title={m.desc}
                      style={{ flex: 1 }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 8 }}>
                  {frameMode === 'overlay'
                    ? '⚠️ Dùng PNG trong suốt ở giữa để sản phẩm hiển thị qua khung'
                    : 'Khung làm nền, sản phẩm đặt bên trên'}
                </div>
              </FormField>
            )}

            <FormField label={frameSrc ? 'Vùng an toàn trong khung' : 'Padding viền'}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sát viền</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{opts.framePaddingPct}%</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nhiều khoảng trống</span>
              </div>
              <input
                type="range" min={0} max={40} value={opts.framePaddingPct}
                onChange={(e) => setOpt('framePaddingPct')(+e.target.value)}
                className="imgtool-range"
              />
            </FormField>

            <FormField label="Màu nền phía sau">
              <div className="imgtool-bg-grid" style={{ gap: '8px' }}>
                {[
                  { color: '#ffffff', label: 'Trắng' },
                  { color: '#f5f5f5', label: 'Xám nhạt' },
                  { color: '#f0f5ff', label: 'Xanh nhạt' },
                  { color: '#fff9f0', label: 'Kem' },
                ].map((bg) => (
                  <button
                    key={bg.color}
                    type="button"
                    className={`imgtool-bg-btn${opts.bgColor === bg.color ? ' active' : ''}`}
                    style={{ background: bg.color, width: '36px', height: '36px' }}
                    onClick={() => setOpt('bgColor')(bg.color)}
                    title={bg.label}
                  >
                    {opts.bgColor === bg.color && <CheckCircle size={14} color="#555" />}
                  </button>
                ))}
                <input
                  type="color"
                  value={opts.bgColor}
                  onChange={(e) => setOpt('bgColor')(e.target.value)}
                  className="imgtool-color-picker"
                  style={{ width: '36px', height: '36px', padding: 0 }}
                  title="Tùy chỉnh"
                />
              </div>
            </FormField>

            <FormField label="Tỉ lệ output">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {RATIOS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`btn btn-sm btn-${opts.ratio.id === r.id ? 'primary' : 'outline'}`}
                    style={{ fontSize: 12, padding: '6px 14px' }}
                    onClick={() => setOpt('ratio')(r)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </FormField>
          </div>

        </div>
      </SectionCard>

      {/* ── LOGO WATERMARK ── */}
      <SectionCard icon={Layers} title="Logo Watermark" color="#2563eb">
        <div className="settings-grid-2" style={{ alignItems: 'start' }}>
          
          {/* Left Column: Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormField label="Logo">
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  value={logoSrc.startsWith('data:') ? '[Ảnh đã upload]' : logoSrc}
                  onChange={(e) => setLogoSrc(e.target.value)}
                  placeholder="URL hoặc upload..."
                  style={{ flex: 1 }}
                  readOnly={logoSrc.startsWith('data:')}
                />
                <button type="button" className="btn btn-outline" style={{ padding: '0 12px' }} onClick={() => logoRef.current?.click()}><Upload size={16} /></button>
                {logoSrc && (
                  <button type="button" className="btn btn-outline" style={{ padding: '0 12px', color: '#dc2626', borderColor: '#fecaca' }} onClick={() => setLogoSrc('')}>
                    <X size={16} />
                  </button>
                )}
              </div>
              <input ref={logoRef} type="file" accept="image/*" hidden onChange={(e) => handleLogoFile(e.target.files?.[0])} />
            </FormField>

            {logoSrc && (
              <div style={{ padding: '16px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', background: '#f8f9fa', display: 'flex', justifyContent: 'center' }}>
                <img src={logoSrc} alt="Logo" style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain' }} />
              </div>
            )}

            {settings?.logoUrl && !logoSrc && (
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%' }}
                onClick={() => setLogoSrc(settings.logoUrl)}
              >
                Dùng logo mặc định của website
              </button>
            )}
          </div>

          {/* Right Column: Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormField label="Vị trí logo">
              <div className="imgtool-pos-grid">
                {POSITIONS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`imgtool-pos-btn${opts.logoPosition === p.id ? ' active' : ''}`}
                    onClick={() => setOpt('logoPosition')(p.id)}
                    title={p.label}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Kích thước logo">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nhỏ</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{opts.logoSizePct}%</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Lớn</span>
              </div>
              <input type="range" min={5} max={50} value={opts.logoSizePct} onChange={(e) => setOpt('logoSizePct')(+e.target.value)} className="imgtool-range" />
            </FormField>

            <FormField label="Độ mờ (Opacity)">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mờ</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{Math.round(opts.logoOpacity * 100)}%</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Rõ ràng</span>
              </div>
              <input type="range" min={10} max={100} value={Math.round(opts.logoOpacity * 100)} onChange={(e) => setOpt('logoOpacity')(e.target.value / 100)} className="imgtool-range" />
            </FormField>
          </div>

        </div>
      </SectionCard>

    </div>
  );
}
