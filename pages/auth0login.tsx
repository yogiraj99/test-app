// pages/login.tsx
import { useState } from 'react';

const LoginPage = () => {
    const [email, setEmail] = useState('');

    const handleLogin = () => {
        // You can replace this with real login logic
        const something = fetch('http://localhost:3000/api/auth/magicLink', {
            method: 'POST',
            body: JSON.stringify({email,lang:''}),
        }).then(res => res.json());
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded shadow-md w-80">
        <h1 className="text-xl font-bold mb-4 text-center">Login</h1>
            <input
    type="email"
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full p-2 mb-4 border rounded"
    />
    <button
        onClick={handleLogin}
    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
        Login
        </button>
        </div>
        </div>
);
};

export default LoginPage;
