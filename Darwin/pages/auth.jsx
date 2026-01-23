import React, { useState } from 'react';
import LoginForm from '../src/components/LoginForm';
import RegisterForm from '../src/components/RegisterForm';
import '../src/components/LoginForm.css';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div className="login-container">
            <div className="auth-card">
                {isLogin ? (
                    <LoginForm onSwitch={toggleAuthMode} />
                ) : (
                    <RegisterForm onSwitch={toggleAuthMode} />
                )}
            </div>
        </div>
    );
}