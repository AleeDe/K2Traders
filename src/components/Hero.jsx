import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Truck, Shield, Leaf } from 'lucide-react';
import { useSettings } from '../hooks/useSettings.js';

const Hero = React.memo(() => {
  const [currentImage, setCurrentImage] = useState(0);
  const { settings } = useSettings();
  const heroImages = useMemo(() => settings?.hero_images || [], [settings]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden py-20">
      {/* Background Images with Parallax Effect */}
      <div className="absolute inset-0 z-0">
        {(heroImages.length ? heroImages : [
          'https://images.pexels.com/photos/1562/italian-landscape-mountains-nature.jpg',
        ]).map((image, index) => (
          <div
            key={index}
            className={`absolute z-0 inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              currentImage === index ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
      </div>

      <div className="absolute w-full h-full z-10 bg-gradient-to-r from-green-900/80 via-green-800/60 to-green-900/80" />

      {/* Floating Elements Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-green-300 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-green-200 rounded-full opacity-40 animate-ping"></div>
        <div className="absolute bottom-32 left-40 w-3 h-3 bg-green-400 rounded-full opacity-50 animate-bounce"></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-20">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-green-500/70 border border-green-400/70 rounded-full text-green-50 text-sm font-medium mb-8 backdrop-blur-sm">
            <Leaf className="w-4 h-4 mr-2" />
            Authentic Products from Gilgit-Baltistan
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight z-20">
            <span className="block">Nature from the</span>
            <span className="block bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
              Peaks of Baltistan
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-green-100 mb-8 max-w-2xl z-20 mx-auto leading-relaxed">
            Discover authentic organic products and handcrafted treasures from the majestic valleys of Gilgit-Baltistan, where K2 touches the sky.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              to="/shop"
              className="group bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center"
            >
              Explore Products
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link 
              to="/brand-story"
              className="bg-transparent border-2 border-green-400 text-green-100 hover:bg-green-500 hover:text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-center"
            >
              Learn Our Story
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-green-400/20">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
                <Leaf className="h-6 w-6 text-green-300" />
              </div>
              <h3 className="text-white font-semibold mb-2">100% Organic</h3>
              <p className="text-green-200 text-sm text-center">Naturally grown in pristine mountain valleys</p>
            </div>

            <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-green-400/20">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
                <Truck className="h-6 w-6 text-green-300" />
              </div>
              <h3 className="text-white font-semibold mb-2">Direct Sourcing</h3>
              <p className="text-green-200 text-sm text-center">From local farmers and artisans</p>
            </div>

            <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-green-400/20">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-green-300" />
              </div>
              <h3 className="text-white font-semibold mb-2">Quality Assured</h3>
              <p className="text-green-200 text-sm text-center">Carefully selected and tested</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-green-300 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-green-300 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
});

export default Hero;
