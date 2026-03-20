
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Login = ({ onLoginSuccess, onLoginFailure }) => {
    const onSuccess = (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            console.log('Login Success:', decoded);

            // Send data to backend to log in Excel
            fetch('http://localhost:3001/api/log-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: decoded.name,
                    email: decoded.email,
                    googleId: decoded.sub,
                    picture: decoded.picture,
                }),
            })
                .then(response => response.json())
                .then(data => console.log('Backend logging result:', data))
                .catch(error => console.error('Error logging to backend:', error));

            if (onLoginSuccess) {
                onLoginSuccess(decoded);
            }
        } catch (error) {
            console.error('Error decoding token:', error);
            if (onLoginFailure) onLoginFailure(error);
        }
    };

    const onError = () => {
        console.log('Login Failed');
        if (onLoginFailure) onLoginFailure();
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Welcome to ESP</h1>
                <p className="mb-8 text-gray-600 dark:text-gray-300">Please sign in with Google to continue</p>
                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={onSuccess}
                        onError={onError}
                        useOneTap
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;
