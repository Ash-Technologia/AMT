import React from "react";

const ProductCard = ({ product }) => {
  if (!product) return null;

  return (
    <div className="product-card">
      <img
        src={product.image || "/placeholder.jpg"}
        alt={product.name || "Product"}
        className="product-image"
      />
      <h3 className="product-name">{product.name}</h3>
      <p className="product-price">₹{product.price}</p>
      <button
        className="product-btn"
        onClick={() => alert(`Added ${product.name} to cart!`)}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
