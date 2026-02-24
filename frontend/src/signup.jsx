function Signup({ onSwitchToLogin }) {
    return(
    <div className="container">
        <form action="">
           <div className="h1">
              <h1>Register</h1>
           </div>
           <div className="input">
            <div>
                <label>User name:</label>
                <input type="text" />
            </div><br />
            <div>
                <label>Email:</label>
                <input type="email" />
            </div><br />
            <div>
                <label>Password:</label>
                <input type="password" />
            </div><br />
            <div className="bt">
                <button>Register</button>
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
