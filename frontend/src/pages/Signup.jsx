// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple form validation
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    // Handle signup logic
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">Signup</h1>
      <form onSubmit={handleSubmit} className="mt-4">
        <div>
          <label htmlFor="name" className="block text-lg">Name</label>
          <input
            type="text"
            id="name"
            className="mt-1 p-2 border rounded-md w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mt-4">
          <label htmlFor="email" className="block text-lg">Email</label>
          <input
            type="email"
            id="email"
            className="mt-1 p-2 border rounded-md w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mt-4">
          <label htmlFor="password" className="block text-lg">Password</label>
          <input
            type="password"
            id="password"
            className="mt-1 p-2 border rounded-md w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mt-4">
          <label htmlFor="confirmPassword" className="block text-lg">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            className="mt-1 p-2 border rounded-md w-full"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;
