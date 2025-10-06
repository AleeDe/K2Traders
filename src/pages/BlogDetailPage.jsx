import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlogPosts } from '../hooks/useBlog.js';
import { ArrowLeft, Calendar, User, Tag, Share2 } from 'lucide-react';

const BlogDetailPage = () => {
  const { id } = useParams();
  const { posts } = useBlogPosts();
  const post = useMemo(() => (posts || []).find((p) => String(p.id) === String(id)), [posts, id]);

  // Update document title for basic SEO / UX
  useEffect(() => {
    if (post?.title) {
      const prev = document.title;
      document.title = `${post.title} — ${post?.author || 'Blog'}`;
      return () => { document.title = prev; };
    }
  }, [post]);

  const related = useMemo(() => {
    if (!post) return [];
    return (posts || [])
      .filter((p) => p.id !== post.id && p.category === post.category)
      .slice(0, 3);
  }, [post, posts]);

  const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard');
      }
    } catch {
      // silent
    }
  };

  if (!post) {
    return (
      <main className="min-h-screen py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
          <p className="text-gray-600 mb-6">The article you are looking for doesn't exist or was removed.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 text-green-600 font-semibold">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <article className="py-16 bg-gradient-to-b from-white via-green-50 to-white min-h-screen" aria-labelledby="post-title">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <Link to="/blog" className="inline-flex items-center gap-2 text-green-600 hover:underline mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>

          <img
            src={post.image}
            alt={post.title}
            className="w-full h-72 object-cover rounded-2xl shadow-lg mb-6"
            loading="lazy"
            decoding="async"
          />

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(post.published_at)}
            </span>
            <span className="inline-flex items-center gap-1">
              <User className="h-4 w-4" />
              {post.author}
            </span>
            {post.category && (
              <span className="inline-flex items-center gap-1">
                <Tag className="h-4 w-4" />
                {post.category}
              </span>
            )}
            <button
              onClick={handleShare}
              className="ml-auto inline-flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1 text-sm text-gray-700 shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              aria-label="Share this article"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>

          <h1 id="post-title" className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">{post.title}</h1>
          {post.excerpt && <p className="text-lg text-gray-700 mb-6">{post.excerpt}</p>}
        </header>

        <div className="prose prose-lg prose-green max-w-none text-gray-800">
          {post.content ? (
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <p>No content available.</p>
          )}
        </div>

        {related.length > 0 && (
          <aside className="mt-16">
            <h3 className="text-xl font-bold mb-4">Related posts</h3>
            <ul className="space-y-3">
              {related.map((r) => (
                <li key={r.id} className="p-4 rounded-lg bg-white/80 backdrop-blur border border-green-100 shadow-sm hover:shadow-md transition">
                  <Link to={`/blog/${r.id}`} className="flex items-center gap-4">
                    <img src={r.image} alt={r.title} className="w-20 h-12 object-cover rounded-md" loading="lazy" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{r.title}</div>
                      <div className="text-xs text-gray-500">{formatDate(r.published_at)}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </article>
  );
};

export default BlogDetailPage;