import React, { useEffect, useState } from "react";
import { Mountain, Heart, Sparkles } from "lucide-react";
import { useSettings } from "../hooks/useSettings.js";

// Simple Skeleton
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const BrandStory = () => {
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);

  // Scroll to top and simulate loading
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-green-50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="text-center mb-16">
            <Skeleton className="h-10 w-2/3 mx-auto mb-6" />
            <Skeleton className="h-5 w-1/2 mx-auto" />
          </div>

          {/* Story Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Left image skeleton */}
            <Skeleton className="w-full h-96 rounded-3xl shadow-2xl" />

            {/* Right text skeleton */}
            <div>
              <Skeleton className="h-8 w-2/3 mb-6" />
              <Skeleton className="h-5 w-full mb-3" />
              <Skeleton className="h-5 w-11/12 mb-3" />
              <Skeleton className="h-5 w-10/12 mb-3" />
              <Skeleton className="h-5 w-3/4 mb-3" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="brand-story"
      className="py-20 bg-gradient-to-b from-green-50 via-white to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight drop-shadow">
            Our Brand Story
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto text-lg">
            A journey that begins in the majestic peaks of Baltistan and
            connects hearts worldwide
          </p>
        </div>

        {/* Story Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-2 bg-gradient-to-br from-green-200/40 via-white/60 to-emerald-100/60 rounded-3xl blur-2xl z-0" />
            <img
              src={settings?.brand_image}
              alt="Baltistan Mountains"
              className="relative w-full h-96 object-cover rounded-3xl shadow-2xl border-4 border-white/80 z-10"
              loading="lazy"
            />
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg z-20">
              <Mountain className="h-12 w-12 text-white animate-bounce" />
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              {settings?.brand_title || 'Our Story'}
            </h3>
            <div className="prose prose-lg text-gray-700">
              {(settings?.brand_content || '')
                .split("\n\n")
                .map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>
        </div>

        {/* baqi tumhara content same hi rahega (process, values, etc) */}
      </div>
    </section>
  );
};

export default BrandStory;
