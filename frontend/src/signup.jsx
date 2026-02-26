import { useState } from "react";

function Signup({ onSwitchToLogin, onSignupSuccess }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch(`http://${window.location.hostname}:3001/api/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onSignupSuccess();
                }, 1500);
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Unable to connect to server');
        }
    };

    return(
    <div className="container">
        <form onSubmit={handleSubmit}>
           <div className="h1">
              <h1>Register</h1>
           </div>
           <div className="input">
            <div>
                <label>User name:</label>
                <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                />
            </div><br />
            <div>
                <label>Email:</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                />
            </div><br />
            <div>
                <label>Password:</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                />
            </div><br />
            {error && <p style={{color: "red"}}>{error}</p>}
            {success && <p style={{color: "green"}}>Registration successful! Redirecting...</p>}
            <div className="bt">
                <button type="submit">Register</button>
            </div>
            <div className="switch-link">
                <p>Already have an account? <span onClick={onSwitchToLogin}>Login</span></p>
            </div>
           </div>
        </form>
    </div>
    );
}
export default Signup
