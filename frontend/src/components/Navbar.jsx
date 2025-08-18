import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-green-600 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">
        AMT
      </Link>
      <div className="space-x-6">
        <Link to="/" className="hover:text-gray-200">Home</Link>
        <Link to="/about" className="hover:text-gray-200">About</Link>
        <Link to="/contact" className="hover:text-gray-200">Contact</Link>
        <Link to="/blog" className="hover:text-gray-200">Blog</Link>
        <Link to="/cart" className="hover:text-gray-200">Cart</Link>
      </div>
    </nav>
  );
};

export default Navbar;
