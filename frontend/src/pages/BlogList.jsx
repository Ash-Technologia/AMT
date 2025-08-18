import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    api.get("/api/blog").then(res => setPosts(res.data)).catch(console.error);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Blog</h1>
      {posts.map(p => (
        <div key={p._id} className="mb-6">
          <Link to={`/blog/${p.slug}`} className="text-xl font-semibold text-green-700">{p.title}</Link>
          <p className="text-sm text-gray-600">{p.excerpt}</p>
        </div>
      ))}
    </div>
  );
};

export default BlogList;

