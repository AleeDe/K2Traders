import React, { useState, useMemo, useEffect } from "react";
import { Calendar, User, ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useBlogPosts } from "../hooks/useBlog.js";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { posts: blogPosts, loading } = useBlogPosts();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = useMemo(() => {
    return [
      "all",
      ...Array.from(new Set((blogPosts || []).map((p) => p.category).filter(Boolean))),
    ];
  }, [blogPosts]);

  const filteredPosts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
  return (blogPosts || []).filter((post) => {
      const matchesSearch =
        !q ||
        (post.title && post.title.toLowerCase().includes(q)) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(q)) ||
        (post.content && post.content.toLowerCase().includes(q));
      const matchesCategory =
        selectedCategory === "all" || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [blogPosts, searchTerm, selectedCategory]);

  if (loading) {
    // 🔹 Skeleton Loader
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-green-50 to-white pt-24 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="h-10 w-64 bg-gray-200 mx-auto rounded mb-4"></div>
            <div className="h-4 w-96 bg-gray-200 mx-auto rounded mb-2"></div>
            <div className="h-4 w-80 bg-gray-200 mx-auto rounded"></div>
          </div>

          {/* Search & Filters */}
          <section className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="h-12 w-full bg-gray-200 rounded"></div>
              <div className="flex gap-2 flex-wrap">
                {Array(4)
                  .fill("")
                  .map((_, idx) => (
                    <div
                      key={idx}
                      className="h-10 w-20 bg-gray-200 rounded-lg"
                    ></div>
                  ))}
              </div>
            </div>
          </section>

          {/* Featured Article Skeleton */}
          <section className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-64 bg-gray-200"></div>
              <div className="p-8 space-y-4">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-6 w-64 bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded mt-6"></div>
              </div>
            </div>
          </section>

          {/* Grid of posts skeleton */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6)
              .fill("")
              .map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 w-40 bg-gray-200 rounded"></div>
                    <div className="h-5 w-56 bg-gray-200 rounded"></div>
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded mt-4"></div>
                  </div>
                </div>
              ))}
          </section>

          {/* Newsletter CTA Skeleton */}
          <section className="mt-16 bg-green-100 rounded-2xl p-8 text-center">
            <div className="h-6 w-56 bg-gray-200 mx-auto rounded mb-4"></div>
            <div className="h-4 w-96 bg-gray-200 mx-auto rounded mb-6"></div>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="h-12 flex-1 bg-gray-200 rounded"></div>
              <div className="h-12 w-32 bg-gray-200 rounded"></div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  // 🔹 Real Content
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-green-50 to-white pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Our Blog
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Stories, tips and insights about organic products and the culture of
            Gilgit-Baltistan.
          </p>
        </header>

        {/* Search & Filters */}
        <section className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                aria-label="Search articles"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 capitalize ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-green-50"
                  }`}
                  aria-pressed={selectedCategory === category}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured */}
        {filteredPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Featured Article
            </h2>
            <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <Link
                  to={`/blog/${filteredPosts[0].id}`}
                  className="relative h-64 lg:h-auto block"
                  aria-label={`Read featured article ${filteredPosts[0].title}`}
                >
                  <img
                    src={filteredPosts[0].image}
                    alt={filteredPosts[0].title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      {filteredPosts[0].category}
                    </span>
                  </div>
                </Link>

                <div className="p-8 flex flex-col">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(filteredPosts[0].published_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {filteredPosts[0].author}
                    </div>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    <Link
                      to={`/blog/${filteredPosts[0].id}`}
                      className="hover:text-green-600"
                    >
                      {filteredPosts[0].title}
                    </Link>
                  </h3>

                  <p className="text-gray-600 mb-6 flex-1">
                    {filteredPosts[0].excerpt}
                  </p>

                  <div className="mt-auto">
                    <Link
                      to={`/blog/${filteredPosts[0].id}`}
                      className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold"
                    >
                      Read Full Article <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          </section>
        )}

        {/* Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.slice(1).map((post) => (
            <article
              key={post.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-transform duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              <Link to={`/blog/${post.id}`} className="block">
                <div className="relative overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
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

                  <h4 className="text-xl font-semibold text-gray-900 mb-2 hover:text-green-600">
                    {post.title}
                  </h4>

                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

                  <div>
                    <Link
                      to={`/blog/${post.id}`}
                      className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                      aria-label={`Read more about ${post.title}`}
                    >
                      Read More <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </section>

        {filteredPosts.length === 0 && (
          <section className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No articles found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or choose a different category.
            </p>
          </section>
        )}

        {/* Newsletter CTA */}
        <section className="mt-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated</h3>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            Subscribe for the latest articles and product updates from
            Baltistan.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <label htmlFor="bp-news" className="sr-only">
              Email
            </label>
            <input
              id="bp-news"
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <button
              type="button"
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-200"
            >
              Subscribe
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default BlogPage;
