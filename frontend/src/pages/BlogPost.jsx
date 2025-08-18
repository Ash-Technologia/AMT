import React, { useEffect, useState } from "react";
import api from "../api";
import { useParams } from "react-router-dom";

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    api.get(`/api/blog/${slug}`).then(res => setPost(res.data)).catch(console.error);
  }, [slug]);

  if (!post) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      {post.coverImage && <img src={post.coverImage} alt={post.title} className="w-full h-64 object-cover rounded mb-4" />}
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
};

export default BlogPost;
