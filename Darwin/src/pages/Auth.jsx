import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div className="auth-container">
            {isLogin ? (
                <LoginForm onSwitch={toggleForm} />
            ) : (
                <RegisterForm onSwitch={toggleForm} />
            )}
        </div>
    );
};

export default Auth;
