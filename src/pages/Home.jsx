import React, { Suspense, lazy } from "react";

// Lazy load all components
const Hero = lazy(() => import("../components/Hero.jsx"));
const FeaturedProducts = lazy(() => import("../components/FeaturedProducts.jsx"));
const About = lazy(() => import("../components/About.jsx"));
const BrandStory = lazy(() => import("../components/BrandStory.jsx"));
const Blog = lazy(() => import("../components/Blog.jsx"));
const CheckIn = lazy(() => import("../components/CheckIn.jsx"));
const Wishlist = lazy(() => import("../components/WishList.jsx"));


// Loader Component (Skeleton for Hero Section)

const Loader = () => (
  <div className="relative min-h-screen bg-gray-100 animate-pulse">
    {/* Background Image Skeleton */}
    <div className="absolute inset-0 bg-gray-200" />

    <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-20 space-y-6">
      {/* Capsule */}
      <div className="h-8 w-40 bg-gray-300 rounded-full mb-6"></div>

      {/* Main Heading */}
      <div className="h-12 w-3/4 md:w-1/2 bg-gray-300 rounded-lg"></div>

      {/* Sub Heading */}
      <div className="h-4 w-2/3 md:w-1/3 bg-gray-300 rounded-lg mt-4"></div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-6xl px-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-200 h-40 rounded-2xl shadow-md"
          ></div>
        ))}
      </div>
    </div>
  </div>
);



const Home = React.memo(() => {
  return (
    <div>
      <Suspense fallback={<Loader />}>
        <Hero />

      <FeaturedProducts />

      <Wishlist />

      <About />

      <BrandStory />

      {/* <Blog /> */}

      <CheckIn />
      </Suspense>
    </div>
  );
});

export default Home;
