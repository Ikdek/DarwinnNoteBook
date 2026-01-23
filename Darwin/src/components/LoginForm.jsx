import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";

export default function LoginForm({ onSwitch }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.email || !formData.password) {
            setError("Veuillez remplir tous les champs.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur lors de la connexion.");
            }

            console.log("Login successful:", data);

            if (data.access_token) {
                localStorage.setItem("token", data.access_token);
                localStorage.setItem("user", JSON.stringify(data.user));
                navigate("/");
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form-container">
            <h2>Bon retour parmi nous</h2>
            <p className="auth-subtitle">Connectez-vous à votre compte</p>

            <form onSubmit={handleLogin} className="auth-form">
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="darwin@evolution.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Mot de passe</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Votre secret..."
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="auth-button" disabled={loading}>
                    {loading ? "Chargement..." : "Se connecter"}
                </button>
            </form>

            <div className="auth-footer">
                <p>Pas encore de compte ? <span onClick={onSwitch} className="auth-link">Créer un compte</span></p>
            </div>
        </div>
    );
}