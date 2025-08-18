import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product", error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-96 object-cover rounded"
      />
      <h1 className="text-3xl font-bold mt-4">{product.name}</h1>
      <p className="text-gray-700 mt-2">{product.description}</p>
      <p className="text-green-600 font-bold mt-2">₹{product.price}</p>
      <button className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
        Add to Cart
      </button>
    </div>
  );
};

export default ProductPage;
