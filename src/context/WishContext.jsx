import React, { createContext, useContext, useEffect, useState } from "react";

const WishContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const stored = localStorage.getItem("wishlist");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

    const isInWishlist = (id) => wishlist.some((item) => item.id === id);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product) => {
    setWishlist((prev) => {
      if (prev.find((item) => item.id === product.id)) return prev; // already added
      return [...prev, product];
    });
  };

  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const clearWishlist = () => setWishlist([]);

  return (
    <WishContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, clearWishlist , isInWishlist }}>
      {children}
    </WishContext.Provider>
  );
};

export const useWishlist = () => useContext(WishContext);
