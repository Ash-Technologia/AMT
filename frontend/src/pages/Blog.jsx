import React from "react";

const Blog = () => {
  const posts = [
    {
      title: "Benefits of Health Therapy",
      content:
        "Discover how natural therapy products can boost your overall wellbeing.",
    },
    {
      title: "Top 5 Relaxation Products",
      content:
        "Our best picks for reducing stress and improving relaxation at home.",
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Blog</h1>
      {posts.map((post, index) => (
        <div key={index} className="mb-6">
          <h2 className="text-xl font-bold">{post.title}</h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
};

export default Blog;
