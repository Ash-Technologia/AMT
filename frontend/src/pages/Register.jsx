import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { name, email, password, confirmPassword } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      alert('Registered successfully! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 border border-gray-300 rounded-lg shadow-lg bg-white">
      <h2 className="text-3xl font-semibold mb-6 text-center text-green-700">Register</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1 font-medium">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 font-medium">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block mb-1 font-medium">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            minLength={6}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block mb-1 font-medium">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            minLength={6}
          />
        </div>
        {error && <p className="mb-4 text-red-600 font-semibold">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded text-white font-semibold ${
            loading ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          } transition`}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p className="mt-6 text-center">
        Already have an account?{' '}
        <button
          onClick={() => navigate('/login')}
          className="text-green-600 font-semibold hover:underline"
        >
          Login here
        </button>
      </p>
    </div>
  );
};

export default Register;
