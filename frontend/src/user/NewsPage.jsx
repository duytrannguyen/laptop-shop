import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Calendar } from 'lucide-react';
import { http } from '../api/client';

export default function NewsPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    http.get('/posts').then((r) => setPosts(r.data)).catch(() => {});
  }, []);

  return (
    <main className="page-content">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <ChevronRight size={14} className="separator" />
          <span>Tin tức</span>
        </div>

        <div className="section-heading" style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '24px' }}>Tin tức & Khuyến mãi</h1>
        </div>

        {posts.length > 0 ? (
          <div className="grid-3">
            {posts.map((post) => (
              <article className="card" key={post.id}>
                <Link to={`/news/${post.slug}`} style={{
                  height: '200px',
                  display: 'block',
                  overflow: 'hidden',
                  borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
                }}>
                  <img
                    src={post.image}
                    alt={post.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Link>
                <div style={{ padding: '20px' }}>
                  {post.createdAt && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px'
                    }}>
                      <Calendar size={14} />
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                  <h3 style={{ fontSize: '16px', marginBottom: '8px', lineHeight: '1.4' }}><Link to={`/news/${post.slug}`}>{post.title}</Link></h3>
                  <p style={{
                    fontSize: '14px', color: 'var(--text-secondary)',
                    lineHeight: '1.6', display: '-webkit-box',
                    WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {post.content?.replace(/<[^>]+>/g, '')}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Chưa có bài viết nào</h3>
            <p>Các bài viết sẽ được cập nhật sớm</p>
          </div>
        )}
      </div>
    </main>
  );
}
