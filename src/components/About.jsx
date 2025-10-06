import React, { useState, useEffect } from "react";
import { Leaf, Users, Award, Globe } from "lucide-react";
import { useSettings } from "../hooks/useSettings.js";

const iconMap = {
  Leaf,
  Mountain: Users,
  Package: Award,
  Shield: Globe,
};

// ✅ Skeleton Loader
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const About = () => {
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);

   // 👇 Scroll to Top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    // Simulate content loading (API / image fetch)
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white via-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Left */}
            <div>
              <Skeleton className="h-10 w-2/3 mb-6" />
              <Skeleton className="h-5 w-full mb-4" />
              <Skeleton className="h-5 w-5/6 mb-4" />
              <Skeleton className="h-5 w-3/4 mb-8" />
              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
            {/* Right Image */}
            <Skeleton className="h-96 w-full rounded-3xl" />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>

          {/* Mission */}
          <Skeleton className="h-40 w-full rounded-3xl" />
        </div>
      </section>
    );
  }

  // ✅ Real About content
  return (
    <section
      id="about"
      className="py-20 bg-gradient-to-b from-white via-green-50 to-white"
      aria-labelledby="about-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2
              id="about-heading"
              className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight drop-shadow-sm"
            >
              About K2 Traders
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {settings?.description || ''}
            </p>
            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              We specialize in authentic, organic, and handcrafted Balti products—sourced
              directly from local farmers, artisans, and communities in the heart of the
              Himalayas and Karakoram.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 bg-white/80 backdrop-blur-lg rounded-2xl border border-green-100 shadow hover:shadow-xl transition-all">
                <div className="text-3xl font-extrabold text-green-600 drop-shadow">
                  500+
                </div>
                <div className="text-gray-600 font-medium">Happy Customers</div>
              </div>
              <div className="text-center p-6 bg-white/80 backdrop-blur-lg rounded-2xl border border-green-100 shadow hover:shadow-xl transition-all">
                <div className="text-3xl font-extrabold text-green-600 drop-shadow">
                  50+
                </div>
                <div className="text-gray-600 font-medium">Premium Products</div>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-2 bg-gradient-to-br from-green-200/40 via-white/60 to-emerald-100/60 rounded-3xl blur-2xl z-0" />
            <img
              src="https://images.pexels.com/photos/1915182/pexels-photo-1915182.jpeg"
              alt="Gilgit-Baltistan Mountains"
              className="relative w-full h-96 object-cover rounded-3xl shadow-2xl border-4 border-white/80 z-10"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-green-900/30 to-transparent rounded-3xl z-20 pointer-events-none" />
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {(Array.isArray(settings?.features) ? settings.features : []).map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || Leaf;
            return (
              <div
                key={index}
                className="text-center p-8 bg-white/80 backdrop-blur-lg rounded-2xl border border-green-100 shadow hover:shadow-2xl hover:-translate-y-1 transition-all group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform">
                  <IconComponent className="h-8 w-8 text-white drop-shadow-lg animate-pulse group-hover:animate-none" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Mission */}
        <div className="mt-20 text-center bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 rounded-3xl p-12 text-white shadow-xl">
          <h3 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight drop-shadow">
            Our Mission
          </h3>
          <p className="text-lg leading-relaxed max-w-3xl mx-auto opacity-90 font-medium">
            To bring the authentic flavors and traditional crafts of Gilgit-Baltistan to
            the world, while supporting local communities and preserving our natural
            heritage for future generations.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
