import Logo from './assets/title.svg'

function Header(){
    return(
       <div className="logo" id='start'>
        <img src={Logo} alt="Logo" />
       </div>
    );
};
export default Header