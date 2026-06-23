import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import { http } from '../../api/client';

export default function PostDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    http.get(`/posts/${slug}`).then((res) => setPost(res.data)).catch(() => setError('Bài viết không tồn tại hoặc đã được ẩn.'));
  }, [slug]);

  if (error) return <main className="page-content"><div className="container empty-state"><h2>{error}</h2><Link className="btn btn-primary" to="/news">Về trang tin tức</Link></div></main>;
  if (!post) return <main className="page-content"><div className="loading"><div className="spinner" /></div></main>;

  return (
    <main className="page-content">
      <article className="container post-detail">
        <div className="breadcrumb"><Link to="/">Trang chủ</Link><ChevronRight size={14} /><Link to="/news">Tin tức</Link><ChevronRight size={14} /><span>{post.title}</span></div>
        <h1>{post.title}</h1>
        {post.createdAt && <div className="post-date"><Calendar size={15} /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</div>}
        {post.image && <img className="post-cover" src={post.image} alt={post.title} />}
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </main>
  );
}
