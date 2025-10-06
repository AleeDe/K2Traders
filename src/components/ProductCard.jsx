import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishContext.jsx';
import toast from 'react-hot-toast'; // ✅ NEW

const formatPrice = (v) => `Rs ${(Number(v) || 0).toFixed(0)}`;

const ProductCard = ({ product, onImageLoad }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const { addItem } = useCart();
  const navigate = useNavigate();

  const to = `/shop/${product.id}`;
  const image = useMemo(
    () =>
      product.image ||
      product.imageUrl ||
      (Array.isArray(product.images) ? product.images[0] : null) ||
      null,
    [product]
  );

  const price = product.price;
  const compareAt = product.compareAtPrice || product.oldPrice;
  const hasDiscount = compareAt && Number(compareAt) > Number(price);
  const rating = Number(product.rating) || 0;

  return (
    <article
      role="article"
      aria-labelledby={`prod-${product.id}-title`}
      className="group relative rounded-2xl border border-gray-100 bg-white/80 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-lg hover:ring-1 hover:ring-green-200 overflow-hidden "
    >
      {/* Wishlist Button */}
      <button
        type="button"
        title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        className={`absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full shadow-md ring-1 transition 
    ${inWishlist
            ? "bg-white text-rose-400 ring-white hover:scale-105"
            : "bg-white/90 text-gray-600 ring-gray-200 hover:text-rose-500 hover:scale-105"
          }`}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          if (inWishlist) {
            removeFromWishlist(product.id);
            toast(
              <span className="flex items-center gap-2 text-rose-500">
                <Heart className="h-5 w-5 fill-current" />
                Removed from wishlist
              </span>
            );
          } else {
            addToWishlist(product);
            toast(
              <span className="flex items-center gap-2 text-green-500">
                <Heart className="h-5 w-5 fill-current" />
                Added to wishlist
              </span>
            );
          }
        }}
        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
      </button>

      {/* Whole card is a link */}
      <Link to={to} className="block" aria-label={`View details for ${product.name || product.title}`}>
        <div className="relative h-56 w-full overflow-hidden bg-gray-50">
          {image ? (
            <img
              src={image}
              alt={product.name || product.title || 'Product image'}
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onLoad={onImageLoad}   // ✅ NEW
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-100 to-green-200 text-green-700">
              <span className="text-sm font-medium">No image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex items-center gap-2">
            {hasDiscount && (
              <span className="rounded-full bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white shadow">
                Sale
              </span>
            )}
            {(product.badge || product.featured) && (
              <span className="rounded-full bg-green-600/90 px-2.5 py-1 text-xs font-semibold text-white shadow">
                {product.badge || 'Featured'}
              </span>
            )}
          </div>

          {/* Hover actions */}
          <div className="pointer-events-none absolute inset-x-3 bottom-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="pointer-events-auto flex overflow-hidden rounded-xl shadow-lg">
              <button
                type="button"
                className="flex-1 bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addItem(product, 1);
                  toast(
                    <span className="flex items-center gap-2 text-green-600">
                      <ShoppingCart className="h-5 w-5" />
                      Added to cart
                    </span>
                  );
                }}
                title="Add to cart"
                aria-label={`Add ${product.name || 'product'} to cart`}
              >
                Add to cart
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-200"
                title="View details"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(to);
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                Details
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={to}
              id={`prod-${product.id}-title`}
              className="line-clamp-1 text-base font-semibold text-gray-900 hover:text-green-700 block"
              title={product.name || product.title}
              onClick={(e) => e.stopPropagation()}
            >
              {product.name || product.title || 'Product'}
            </Link>
            {product.category && (
              <p className="mt-0.5 text-xs text-gray-500">{product.category}</p>
            )}
          </div>

          {Number.isFinite(rating) && (
            <div className="flex items-center gap-1" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
              <span className="ml-1 text-xs text-gray-500">{rating}</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <p className="text-lg font-bold text-gray-900">{formatPrice(price)}</p>
          {hasDiscount && (
            <p className="text-sm font-medium text-gray-400 line-through">
              {formatPrice(compareAt)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

export default React.memo(ProductCard);
