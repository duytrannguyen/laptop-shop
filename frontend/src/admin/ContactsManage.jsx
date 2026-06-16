import React, { useEffect, useState } from 'react';
import { MessageSquare, CheckCircle, Trash2 } from 'lucide-react';
import { http } from '../api/client';

export default function ContactsManage() {
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);

  const load = () => http.get('/admin/contacts').then((res) => setMessages(res.data));

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const toggleHandled = async (message) => {
    await http.put(`/admin/contacts/${message.id}/handled`, { handled: !message.handled });
    await load();
    setSelected((current) => current?.id === message.id ? { ...current, handled: !message.handled } : current);
  };

  const remove = async (message) => {
    if (!window.confirm(`Xóa tin nhắn của ${message.name}?`)) return;
    await http.delete(`/admin/contacts/${message.id}`);
    setSelected(null);
    await load();
  };

  return (
    <>
      <div className="admin-header"><h1><MessageSquare size={24} /> Tin nhắn liên hệ</h1></div>
      <div className="admin-table-wrap">
        <div className="admin-table-header"><h3>Danh sách tin nhắn ({messages.length})</h3></div>
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead><tr><th>Khách hàng</th><th>Điện thoại</th><th>Nội dung</th><th>Ngày gửi</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id}>
                  <td><button className="link-button" onClick={() => setSelected(message)}>{message.name}</button></td>
                  <td><a href={`tel:${message.phone}`}>{message.phone}</a></td>
                  <td className="truncate-cell">{message.content}</td>
                  <td>{message.createdAt ? new Date(message.createdAt).toLocaleString('vi-VN') : ''}</td>
                  <td><span className={`badge ${message.handled ? 'badge-success' : 'badge-warning'}`}>{message.handled ? 'Đã xử lý' : 'Chờ xử lý'}</span></td>
                  <td><button className="admin-btn-edit" onClick={() => toggleHandled(message)}><CheckCircle size={14} /> {message.handled ? 'Mở lại' : 'Hoàn tất'}</button></td>
                </tr>
              ))}
              {messages.length === 0 && <tr><td colSpan="6" className="table-empty">Chưa có tin nhắn nào</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-modal-header"><h2>Tin nhắn của {selected.name}</h2></div>
            <div className="admin-modal-body contact-detail">
              <p><strong>Điện thoại:</strong> <a href={`tel:${selected.phone}`}>{selected.phone}</a></p>
              <p><strong>Email:</strong> {selected.email || 'Không cung cấp'}</p>
              <p><strong>Nội dung:</strong></p>
              <div>{selected.content}</div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-delete" onClick={() => remove(selected)}><Trash2 size={14} /> Xóa</button>
              <button className="btn btn-primary btn-sm" onClick={() => toggleHandled(selected)}>{selected.handled ? 'Đánh dấu chưa xử lý' : 'Đánh dấu đã xử lý'}</button>
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
