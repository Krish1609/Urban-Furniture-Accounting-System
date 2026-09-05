import { useState } from "react";
import { signIn, signUp } from "../services/auth";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        await signIn(email, password);
        setMessage("Login successful!");
      } else {
        await signUp(email, password);
        setMessage("Account created successfully!");
      }
    } catch (error) {
      setMessage(error.message);
    }

    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f5f5f5"
    }}>
      <div style={{
        width: "400px",
        padding: "40px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.1)"
      }}>
        <h1>Urban Furniture</h1>

        <p>
          {isLogin
            ? "Sign in to your account"
            : "Create your account"}
        </p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        {message && <p>{message}</p>}

        <p style={{ textAlign: "center" }}>
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
            }}
            style={switchStyle}
          >
            {isLogin ? " Sign Up" : " Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "12px",
  margin: "8px 0 20px",
  boxSizing: "border-box"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  cursor: "pointer"
};

const switchStyle = {
  border: "none",
  background: "none",
  color: "#2563eb",
  cursor: "pointer"
};