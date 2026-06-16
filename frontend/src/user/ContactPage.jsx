import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ChevronRight, MessageCircle, CheckCircle } from 'lucide-react';
import { http } from '../api/client';
import { useSite } from '../context/SiteContext';

const EMPTY = { name: '', phone: '', email: '', content: '' };

export default function ContactPage() {
  const { settings } = useSite();
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await http.post('/contacts', form);
      setForm(EMPTY);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-content">
      <div className="container">
        <div className="breadcrumb"><Link to="/">Trang chủ</Link><ChevronRight size={14} /><span>Liên hệ</span></div>
        <h1 className="page-title">Liên hệ {settings.shortName}</h1>

        <div className="grid-2 contact-grid">
          <div className="card contact-card">
            <h2>Thông tin liên hệ</h2>
            <div className="contact-info-list">
              <div className="contact-info-item"><div className="policy-icon"><MapPin size={22} /></div><div><h4>Địa chỉ</h4><p>{settings.address}</p></div></div>
              <div className="contact-info-item"><div className="policy-icon"><Phone size={22} /></div><div><h4>Hotline</h4><a href={`tel:${settings.hotline}`}>{settings.hotline}</a></div></div>
              <div className="contact-info-item"><div className="policy-icon"><Mail size={22} /></div><div><h4>Email</h4><a href={`mailto:${settings.email}`}>{settings.email}</a></div></div>
              <div className="contact-info-item"><div className="policy-icon"><Clock size={22} /></div><div><h4>Giờ làm việc</h4><p>{settings.openingHours}</p></div></div>
            </div>
          </div>

          <div className="card contact-card">
            <h2><MessageCircle size={22} /> Gửi tin nhắn</h2>
            {sent && <div className="form-success"><CheckCircle size={18} /> Tin nhắn đã được gửi. Chúng tôi sẽ liên hệ lại sớm.</div>}
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={submit}>
              <div className="form-group"><label className="form-label">Họ và tên *</label><input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength="160" /></div>
              <div className="form-group"><label className="form-label">Số điện thoại *</label><input className="form-input" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required pattern="(\+84|0)[0-9]{9,10}" /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Nội dung *</label><textarea className="form-textarea" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required maxLength="3000" /></div>
              <button className="btn btn-primary btn-lg full-width" disabled={submitting}>{submitting ? 'Đang gửi...' : 'Gửi tin nhắn'}</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
