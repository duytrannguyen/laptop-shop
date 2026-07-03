import React from 'react';
import { Settings } from 'lucide-react';
import { useSite } from '../../context/SiteContext';

export default function MaintenancePage() {
  const { settings } = useSite();

  return (
    <main className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8f9fa' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '600px', padding: '40px 20px' }}>
        <div style={{ marginBottom: '24px' }}>
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.storeName || 'Logo'} style={{ height: '60px', objectFit: 'contain' }} />
          ) : (
            <h1 style={{ fontSize: '32px', color: 'var(--primary)' }}>{settings?.storeName || 'Tech Shop'}</h1>
          )}
        </div>
        
        <Settings size={80} style={{ color: 'var(--primary)', marginBottom: '24px', animation: 'spin 4s linear infinite' }} />
        
        <h2 style={{ fontSize: '28px', marginBottom: '16px', color: '#111' }}>Website đang bảo trì</h2>
        
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '32px' }}>
          Chúng tôi đang thực hiện một số nâng cấp hệ thống để mang lại trải nghiệm tốt hơn cho bạn. 
          Vui lòng quay lại sau một thời gian ngắn. Xin lỗi vì sự bất tiện này!
        </p>

        {settings?.hotline && (
          <p style={{ fontSize: '15px', color: '#555' }}>
            Liên hệ hỗ trợ khẩn cấp: <strong style={{ color: 'var(--primary)' }}>{settings.hotline}</strong>
          </p>
        )}
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
