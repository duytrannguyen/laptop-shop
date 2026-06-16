import React, { useEffect, useRef, useState } from 'react';
import {
  Settings as SettingsIcon, Save, Globe, Phone,
  Image as ImageIcon, Share2, Code, Bell,
  CheckCircle, AlertCircle, EyeOff, ExternalLink,
  Wand2, Upload, X
} from 'lucide-react';
import { http } from '../api/client';
import { useSite } from '../context/SiteContext';
import ImageTool from './ImageTool';

/* ── Default values ── */
const EMPTY = {
  storeName: '', shortName: '', slogan: '', hotline: '', email: '', supportEmail: '',
  address: '', openingHours: '', mapUrl: '',
  logoUrl: '', faviconUrl: '', logoFooterUrl: '',
  facebookUrl: '', facebookGroupUrl: '', zaloUrl: '', zaloGroupUrl: '',
  youtubeUrl: '', tiktokUrl: '', instagramUrl: '',
  googleTagScript: '', metaDescription: '',
  maintenanceMode: false, popupEnabled: false, popupImageUrl: '', popupLinkUrl: '',
};

/* ── Reusable sub-components ── */
function SectionCard({ icon: Icon, title, color = 'var(--primary)', children }) {
  return (
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
}

function FormField({ label, hint, children, span }) {
  return (
    <div className={`settings-field${span ? ' settings-field-span' : ''}`}>
      <label className="form-label">
        {label}
        {hint && <span className="settings-field-hint">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="settings-toggle-row">
      <div className="settings-toggle-info">
        <span className="settings-toggle-label">{label}</span>
        {description && <span className="settings-toggle-desc">{description}</span>}
      </div>
      <div className="toggle-switch">
        <input
          type="checkbox"
          checked={!!checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-slider" />
      </div>
    </label>
  );
}

/** MediaField with inline file upload */
function MediaField({ label, hint, value, onChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await http.post('/admin/uploads', fd, { params: { folder: 'logo' } });
      onChange(res.data.url || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="settings-media-item">
      <div className="settings-media-preview">
        {value
          ? <img src={value} alt={label} />
          : <div className="settings-media-placeholder"><ImageIcon size={28} /><span>{label}</span></div>
        }
      </div>
      <div className="settings-media-info">
        <div className="form-label" style={{ marginBottom: 4 }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{hint}</div>}
        <input
          className="form-input"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nhập URL hoặc upload..."
          style={{ fontSize: 13, marginBottom: 6 }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ flex: 1, fontSize: 12 }}
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <Upload size={13} />
            {uploading ? 'Đang tải...' : 'Upload ảnh'}
          </button>
          {value && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ color: '#dc2626', borderColor: '#fecaca', padding: '0 10px' }}
              onClick={() => onChange('')}
            >
              <X size={13} />
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function SettingsPage() {
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [notice, setNotice]     = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const { refresh } = useSite();

  useEffect(() => {
    http.get('/admin/settings')
      .then((res) => setForm({ ...EMPTY, ...res.data }))
      .catch(() => {});
  }, []);

  /* Generic setter — handles both events and raw values */
  const set = (field) => (e) => {
    const val = (e && e.target !== undefined) ? e.target.value : e;
    setForm((f) => ({ ...f, [field]: val }));
  };

  /* Toggle setter (boolean) */
  const toggle = (field) => (bool) => {
    setForm((f) => ({ ...f, [field]: bool }));
  };

  const save = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const res = await http.put('/admin/settings', form);
      setForm({ ...EMPTY, ...res.data });
      await refresh();
      setNotice({ type: 'success', text: 'Đã lưu cài đặt thành công!' });
      setTimeout(() => setNotice(null), 4000);
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.message || 'Không thể lưu cài đặt.' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Thông tin chung', icon: Globe },
    { id: 'media',   label: 'Hình ảnh & Logo', icon: ImageIcon },
    { id: 'social',  label: 'Mạng xã hội',     icon: Share2 },
    { id: 'seo',     label: 'SEO & Tracking',   icon: Code },
    { id: 'feature', label: 'Tính năng',        icon: Bell },
    { id: 'imgtool', label: 'Công cụ ảnh',      icon: Wand2 },
  ];

  const isConfigTab = activeTab !== 'imgtool';

  return (
    <>
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SettingsIcon size={22} />
            Cấu hình website
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Quản lý thông tin, hình ảnh, mạng xã hội và công cụ chỉnh ảnh.
          </p>
        </div>
        {isConfigTab && (
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            <Save size={16} />
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        )}
      </div>

      {/* Notice bar */}
      {notice && isConfigTab && (
        <div className={`settings-notice-bar ${notice.type}`}>
          {notice.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {notice.text}
        </div>
      )}

      <div className="settings-layout" style={activeTab === 'imgtool' ? { gridTemplateColumns: '200px 1fr' } : {}}>
        {/* Sidebar Tabs */}
        <div className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {activeTab === 'imgtool' ? (
          <ImageTool />
        ) : (
          <form className="settings-content" onSubmit={save}>

            {/* ─ GENERAL ─ */}
            {activeTab === 'general' && (
              <>
                <SectionCard icon={Globe} title="Thông tin cơ bản" color="#7c3aed">
                  <div className="settings-grid-2">
                    <FormField label="Tên cửa hàng" hint="Tên đầy đủ">
                      <input className="form-input" value={form.storeName || ''} onChange={set('storeName')} placeholder="Laptop Shop - Laptop cũ Cần Thơ" />
                    </FormField>
                    <FormField label="Tên ngắn" hint="Dùng trong logo, tiêu đề">
                      <input className="form-input" value={form.shortName || ''} onChange={set('shortName')} placeholder="Laptop Shop" />
                    </FormField>
                    <FormField label="Slogan" span>
                      <input className="form-input" value={form.slogan || ''} onChange={set('slogan')} placeholder="Laptop cũ chất lượng, giá minh bạch..." />
                    </FormField>
                  </div>
                </SectionCard>

                <SectionCard icon={Phone} title="Liên hệ" color="#2563eb">
                  <div className="settings-grid-2">
                    <FormField label="Hotline">
                      <input className="form-input" value={form.hotline || ''} onChange={set('hotline')} placeholder="0xxx xxx xxx" />
                    </FormField>
                    <FormField label="Giờ mở cửa">
                      <input className="form-input" value={form.openingHours || ''} onChange={set('openingHours')} placeholder="08:30 - 20:00 hàng ngày" />
                    </FormField>
                    <FormField label="Email">
                      <input className="form-input" type="email" value={form.email || ''} onChange={set('email')} placeholder="contact@shop.vn" />
                    </FormField>
                    <FormField label="Email hỗ trợ">
                      <input className="form-input" type="email" value={form.supportEmail || ''} onChange={set('supportEmail')} placeholder="support@shop.vn" />
                    </FormField>
                    <FormField label="Địa chỉ" span>
                      <textarea className="form-textarea" rows={2} value={form.address || ''} onChange={set('address')} placeholder="Số nhà, đường, phường, quận, thành phố..." style={{ minHeight: 70, resize: 'vertical' }} />
                    </FormField>
                    <FormField label="Đường dẫn Google Maps" span>
                      <div style={{ position: 'relative' }}>
                        <input className="form-input" value={form.mapUrl || ''} onChange={set('mapUrl')} placeholder="https://maps.google.com/embed?..." style={{ paddingRight: 42 }} />
                        {form.mapUrl && (
                          <a href={form.mapUrl} target="_blank" rel="noreferrer" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }}>
                            <ExternalLink size={15} />
                          </a>
                        )}
                      </div>
                    </FormField>
                  </div>
                </SectionCard>
              </>
            )}

            {/* ─ MEDIA ─ */}
            {activeTab === 'media' && (
              <SectionCard icon={ImageIcon} title="Hình ảnh & Logo" color="#059669">
                <div className="settings-media-grid">
                  <MediaField label="Logo chính"   hint="Dùng ở header"                     value={form.logoUrl}       onChange={(v) => setForm((f) => ({ ...f, logoUrl: v }))}       />
                  <MediaField label="Favicon"       hint="Icon tab trình duyệt (32×32)"      value={form.faviconUrl}    onChange={(v) => setForm((f) => ({ ...f, faviconUrl: v }))}    />
                  <MediaField label="Logo footer"   hint="Dùng ở cuối trang (màu trắng)"     value={form.logoFooterUrl} onChange={(v) => setForm((f) => ({ ...f, logoFooterUrl: v }))} />
                </div>
              </SectionCard>
            )}

            {/* ─ SOCIAL ─ */}
            {activeTab === 'social' && (
              <SectionCard icon={Share2} title="Mạng xã hội" color="#db2777">
                <div className="settings-grid-2">
                  <FormField label="Facebook Page">
                    <input className="form-input" value={form.facebookUrl || ''} onChange={set('facebookUrl')} placeholder="https://facebook.com/..." />
                  </FormField>
                  <FormField label="Facebook Group">
                    <input className="form-input" value={form.facebookGroupUrl || ''} onChange={set('facebookGroupUrl')} placeholder="https://facebook.com/groups/..." />
                  </FormField>
                  <FormField label="Zalo OA">
                    <input className="form-input" value={form.zaloUrl || ''} onChange={set('zaloUrl')} placeholder="https://zalo.me/..." />
                  </FormField>
                  <FormField label="Zalo Group">
                    <input className="form-input" value={form.zaloGroupUrl || ''} onChange={set('zaloGroupUrl')} placeholder="https://zalo.me/g/..." />
                  </FormField>
                  <FormField label="Youtube">
                    <input className="form-input" value={form.youtubeUrl || ''} onChange={set('youtubeUrl')} placeholder="https://youtube.com/c/..." />
                  </FormField>
                  <FormField label="TikTok">
                    <input className="form-input" value={form.tiktokUrl || ''} onChange={set('tiktokUrl')} placeholder="https://tiktok.com/@..." />
                  </FormField>
                  <FormField label="Instagram" span>
                    <input className="form-input" value={form.instagramUrl || ''} onChange={set('instagramUrl')} placeholder="https://instagram.com/..." />
                  </FormField>
                </div>

                <div className="settings-social-preview">
                  {[
                    { label: 'Facebook', value: form.facebookUrl, color: '#1877f2' },
                    { label: 'Zalo',     value: form.zaloUrl,     color: '#0068ff' },
                    { label: 'Youtube',  value: form.youtubeUrl,  color: '#ff0000' },
                    { label: 'TikTok',   value: form.tiktokUrl,   color: '#111' },
                  ].map((s) => (
                    <div key={s.label} className="settings-social-item" style={{ borderLeftColor: s.color }}>
                      <span className="settings-social-name" style={{ color: s.color }}>{s.label}</span>
                      <span className="settings-social-url">{s.value || '— chưa cài đặt'}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* ─ SEO ─ */}
            {activeTab === 'seo' && (
              <SectionCard icon={Code} title="SEO & Tracking" color="#0891b2">
                <div className="settings-grid-2">
                  <FormField label="Meta Description (SEO)" span hint="Mô tả ngắn cho Google, tối đa 160 ký tự">
                    <textarea
                      className="form-textarea"
                      rows={3}
                      value={form.metaDescription || ''}
                      onChange={set('metaDescription')}
                      maxLength={160}
                      placeholder="Mô tả ngắn về website, hiển thị trên Google..."
                      style={{ minHeight: 80 }}
                    />
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>
                      {(form.metaDescription || '').length}/160
                    </div>
                  </FormField>
                  <FormField label="Google Tag / Analytics Script" span hint="Dán toàn bộ thẻ <script> từ Google Tag Manager">
                    <textarea
                      className="form-textarea"
                      rows={6}
                      value={form.googleTagScript || ''}
                      onChange={set('googleTagScript')}
                      placeholder={'<script async src="https://www.googletagmanager.com/..."></script>'}
                      style={{ minHeight: 140, fontFamily: 'monospace', fontSize: 13 }}
                    />
                  </FormField>
                </div>
              </SectionCard>
            )}

            {/* ─ FEATURES ─ */}
            {activeTab === 'feature' && (
              <>
                <SectionCard icon={EyeOff} title="Chế độ bảo trì" color="#dc2626">
                  <Toggle
                    checked={form.maintenanceMode}
                    onChange={toggle('maintenanceMode')}
                    label="Bật chế độ bảo trì"
                    description="Khi bật, khách truy cập sẽ thấy trang thông báo bảo trì thay vì nội dung website."
                  />
                </SectionCard>

                <SectionCard icon={Bell} title="Popup quảng cáo" color="#d97706">
                  <Toggle
                    checked={form.popupEnabled}
                    onChange={toggle('popupEnabled')}
                    label="Bật Popup quảng cáo"
                    description="Hiển thị popup khi khách vào trang chủ lần đầu."
                  />

                  {form.popupEnabled && (
                    <div className="settings-grid-2" style={{ marginTop: 20 }}>
                      <FormField label="Hình ảnh Popup" span>
                        <input
                          className="form-input"
                          value={form.popupImageUrl || ''}
                          onChange={set('popupImageUrl')}
                          placeholder="URL hình ảnh popup..."
                        />
                        {form.popupImageUrl && (
                          <div className="settings-popup-preview">
                            <img src={form.popupImageUrl} alt="Popup preview" />
                          </div>
                        )}
                      </FormField>
                      <FormField label="Đường dẫn khi click Popup">
                        <input
                          className="form-input"
                          value={form.popupLinkUrl || ''}
                          onChange={set('popupLinkUrl')}
                          placeholder="https://..."
                        />
                      </FormField>
                    </div>
                  )}
                </SectionCard>
              </>
            )}

            {/* Bottom Save */}
            <div className="settings-footer-actions">
              {notice && (
                <div className={`settings-inline-notice ${notice.type}`}>
                  {notice.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                  {notice.text}
                </div>
              )}
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} />
                {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
