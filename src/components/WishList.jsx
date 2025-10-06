import React from "react";
import { useWishlist } from "../context/WishContext.jsx";
import ProductCard from "./ProductCard.jsx";

const Wishlist = () => {
    const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();

    if (wishlist.length === 0) {
        return null;
    }

    return (
        <div className=" max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-b from-white via-green-50 to-white">
            <div className="mb-12">

                <h2 id="featured-heading" className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                    Your Wish List
                </h2>
                <p className="mt-3 text-gray-600 max-w-2xl">
                    Discover customer favorites sourced from the pristine valleys of Gilgit-Baltistan.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {wishlist.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                    />

                ))}
            </div>

        </div>
    );
};

export default Wishlist;
