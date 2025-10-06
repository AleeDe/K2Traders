import React, { useState, useEffect } from "react";
import { Calendar, User, ArrowRight } from "lucide-react";
import { useBlogPosts } from "../hooks/useBlog.js";
import { Link } from "react-router-dom";

// Skeleton box
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const Blog = () => {
  const [loading, setLoading] = useState(true);

  // 👇 Scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500); // simulate load
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white via-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading Skeleton */}
          <div className="text-center mb-16">
            <Skeleton className="h-10 w-2/3 mx-auto mb-4" />
            <Skeleton className="h-5 w-1/2 mx-auto mb-2" />
            <Skeleton className="h-5 w-2/3 mx-auto" />
          </div>

          {/* 3 Card Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-lg rounded-2xl border border-green-100 shadow-xl p-6"
              >
                <Skeleton className="h-56 w-full mb-4 rounded-xl" />
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-4" />
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            ))}
          </div>

          {/* Button Skeleton */}
          <div className="text-center mt-14">
            <Skeleton className="h-12 w-40 mx-auto rounded-xl" />
          </div>
        </div>
      </section>
    );
  }

  // ✅ Real Blog content
  const { posts: blogPosts } = useBlogPosts();
  return (
    <section
      id="blog"
      className="py-20 bg-gradient-to-b from-white via-green-50 to-white"
      aria-labelledby="blog-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            id="blog-heading"
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight drop-shadow"
          >
            Latest From Our Blog
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto text-lg">
            Stay updated with the latest news, tips, and stories from the world
            of organic Baltistan products.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {(blogPosts || []).map((post) => (
            <article
              key={post.id}
              className="group bg-white/80 backdrop-blur-lg rounded-2xl border border-green-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Featured Image */}
              <div className="relative overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    {post.category}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent z-0 pointer-events-none" />
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col h-full">
                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.published_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-200">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-700 mb-4 line-clamp-3 flex-1">
                  {post.excerpt}
                </p>

                {/* Read More */}
                <button
                  className="group/btn inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 px-5 py-2.5 font-bold text-white shadow-lg hover:from-green-600 hover:to-emerald-600 transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                  aria-label={`Read more about ${post.title}`}
                >
                  Read More
                  <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-14">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 px-8 py-4 font-bold text-white shadow-lg hover:from-green-600 hover:to-emerald-600 transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 text-lg"
          >
            View All Posts
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Blog;
