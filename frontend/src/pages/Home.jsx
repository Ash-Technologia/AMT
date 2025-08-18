import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import api from "../api";
import styles from "../styles/HomeModern.module.css";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/api/products");
        let productList = [];

        if (Array.isArray(data)) {
          productList = data;
        } else if (Array.isArray(data.products)) {
          productList = data.products;
        } else if (Array.isArray(data.data)) {
          productList = data.data;
        } else if (data.data?.products && Array.isArray(data.data.products)) {
          productList = data.data.products;
        }

        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleQuantityChange = (productId, value) => {
    let qty = parseInt(value, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    else if (qty > 100) qty = 100;
    setQuantities((prev) => ({ ...prev, [productId]: qty }));
  };

  const addToCartHandler = (product) => {
    const qty = quantities[product._id] || 1;
    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty,
      })
    );
    alert(`${product.name} (Qty: ${qty}) added to cart!`);
  };

  if (loading) {
    return (
      <div className="text-center mt-8 text-lg font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* HERO */}
      <section className={styles.heroNoImage}>
        <div className={styles.heroInner}>
          <img src="/assets/darklogo.jpg" alt="AMT Logo" className={styles.logo}/>
          <p className={styles.heroSubtitle}>
            Health therapy products at your doorsteps
          </p>
          <div className={styles.heroCtas}>
            <a href="/shop" className={styles.btnPrimary}>Shop Now</a>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionHead}>
          <span className={styles.kicker}>Best Picks</span>
          <h2 className={styles.title}>Featured Products</h2>
        </div>

        <div className={styles.productList}>
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product._id} className={styles.card}>
                <Link
                  to={`/product/${product._id}`}
                  className={styles.cardImageWrap}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className={styles.cardImage}
                  />
                </Link>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{product.name}</h3>
                  <p className={styles.cardDesc}>{product.name}</p>
                  <div className={styles.cardBottom}>
                    <span className={styles.price}>₹{product.price}</span>
                  </div>

                  {/* Quantity Selector */}
                  <div className={styles.qtySelector}>
                    <label htmlFor={`qty-${product._id}`} className={styles.qtyLabel}>
                      Qty:
                    </label>
                    <input
                      id={`qty-${product._id}`}
                      type="number"
                      min="1"
                      max="100"
                      value={quantities[product._id] || 1}
                      onChange={(e) =>
                        handleQuantityChange(product._id, e.target.value)
                      }
                      className={styles.qtyInput}
                    />
                  </div>

                  <button
                    className={styles.btnPrimary}
                    onClick={() => addToCartHandler(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.empty}>No products available</p>
          )}
        </div>
      </section>

      {/* CTA BUBBLE */}
      <section className={styles.bubbleCta}>
        <div className={styles.bubbleInner}>
          <h3>Ready to start your wellness journey?</h3>
          <p>Shop now and bring this products into your daily routine.</p>
          <a href="/shop" className={styles.btnPrimary}>
            Explore Products
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
