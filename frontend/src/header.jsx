import Logo from './assets/title.svg'

function Header({ onLoginClick }){
    return(
       <div className="logo" id='start' style={{ height: '60px', display: 'flex', alignItems: 'center' }}>
        <img src={Logo} alt="Logo" style={{ height: '40px' }} />
        {onLoginClick && (
          <button className="header-login-btn" onClick={onLoginClick}>Logout</button>
        )}
       </div>
    );
};
export default Header
