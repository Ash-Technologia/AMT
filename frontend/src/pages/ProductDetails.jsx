import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import styles from "../styles/ProductDetails.module.css";
import api from "../api";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setProduct(data);
        setMainImage(data.image || (data.additionalImages?.[0] || ""));
      } catch (err) {
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const increaseQty = () => {
    if (qty < 100) setQty(qty + 1);
  };
  const decreaseQty = () => {
    if (qty > 1) setQty(qty - 1);
  };

  const addToCartHandler = () => {
    if (!product) return;
    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: mainImage,
        qty,
        shippingType: product.shippingType || "free",
        shippingCharge:
          product.shippingType === "cod" ? product.shippingCharge || 0 : 0,
      })
    );
    alert(`${product.name} (Qty: ${qty}) added to cart!`);
  };

  if (loading) return <p className={styles.loading}>Loading...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!product) return null;

  const thumbnails = [product.image, ...(product.additionalImages || [])].filter(
    Boolean
  );

  return (
    <div className={styles.detailsContainer}>
      <div className={styles.grid}>
        {/* Left: Images */}
        <div className={styles.left}>
          <img
            src={mainImage || product.image}
            alt={product.name}
            className={styles.mainImage}
          />
          {thumbnails.length > 1 && (
            <div className={styles.thumbnails}>
              {thumbnails.map((img, idx) => (
                <div
                  key={idx}
                  className={`${styles.thumb} ${
                    mainImage === img ? styles.activeThumb : ""
                  }`}
                  onClick={() => setMainImage(img)}
                  onMouseEnter={() => setMainImage(img)}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className={styles.right}>
          <h1>{product.name}</h1>
          <p className={styles.description}>{product.description}</p>

          {product.youtubeLink && (
            <a
              href={product.youtubeLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.youtubeLink}
            >
              🎥 Watch on YouTube
            </a>
          )}

          <p className={styles.price}>₹{product.price}</p>

          <div className={styles.qtySelector}>
            <button onClick={decreaseQty}>-</button>
            <input
              type="number"
              value={qty}
              min="1"
              max="100"
              onChange={(e) =>
                setQty(Math.max(1, Math.min(100, Number(e.target.value))))
              }
            />
            <button onClick={increaseQty}>+</button>
          </div>

          <button className={styles.btnPrimary} onClick={addToCartHandler}>
            🛒 Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
