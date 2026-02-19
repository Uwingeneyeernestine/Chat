

function Login(){
    return(
    <div className="container">
        <form action="">
           <div className="h1">
              <h1>sign up</h1>
           </div>
           <div className="input">
            <div>
                <label>User name:</label>
                <input type="text" />
            </div><br />
            <div>
                <label>Password:</label>
                <input type="password" />
            </div><br />
            <div className="bt">
                <button>sign up</button>
            </div>
           </div>
        </form>
    </div>
    );
}
export default Login