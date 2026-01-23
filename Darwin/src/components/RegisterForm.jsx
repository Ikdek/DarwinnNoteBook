import React, { useState } from "react";
import "./LoginForm.css";

export default function RegisterForm({ onSwitch }) {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.email || !formData.password || !formData.confirmPassword) {
            setError("Veuillez remplir tous les champs.");
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Erreur lors de l'inscription.");
            }

            console.log("Registration successful:", data);
            onSwitch();
            alert("Compte créé avec succès ! Veuillez vous connecter.");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form-container">
            <h2>Créer un compte</h2>
            <p className="auth-subtitle">Rejoignez l'aventure Darwin</p>

            <form onSubmit={handleRegister} className="auth-form">
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

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Répétez votre secret..."
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="auth-button" disabled={loading}>
                    {loading ? "Chargement..." : "S'inscrire"}
                </button>
            </form>

            <div className="auth-footer">
                <p>Déjà un compte ? <span onClick={onSwitch} className="auth-link">Se connecter</span></p>
            </div>
        </div>
    );
}
