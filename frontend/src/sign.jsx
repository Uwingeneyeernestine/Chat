import { useState } from "react";

function Login({ onSwitchToRegister, onLoginSuccess }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            const response = await fetch(`http://${window.location.hostname}:3001/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Login successful - redirect to Layout with username
                onLoginSuccess(data.username || username);
            } else {
                setError(data.error || 'Invalid username or password');
            }
        } catch (err) {
            setError('Server error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return(
    <div className="container">
        <form onSubmit={handleLogin}>
           <div className="h1">
              <h1>Login</h1>
           </div>
           <div className="input">
            <div>
                <label>User name:</label>
                <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                />
            </div><br />
            <div>
                <label>Password:</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                />
            </div><br />
            {error && <p style={{color: "red"}}>{error}</p>}
            <div className="bt">
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </div>
            <div className="switch-link">
                <p>Don't have an account? <span onClick={onSwitchToRegister}>Register</span></p>
            </div>
           </div>
        </form>
    </div>
    );
}

// LoginButton component - the button that opens the login form
function LoginButton({ onClick }) {
    return (
        <button className="btn-login" onClick={onClick}>Login</button>
    );
}

export { LoginButton };
export default Login;
