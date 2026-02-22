import Ig from "./assets/ig.png";
import Sms from "./assets/sms.png";
import X from "./assets/x.png"; 
import Fb from "./assets/fb.png";
import Call from "./assets/call.png";
import Bussiness from "./assets/business.png";
import Whatsapp from "./assets/whatsapp.png";
import Logo from "./assets/logo.svg";

function Page() {
  return (
    <>
    <div className="many">
        <img src={Ig} alt="instagram" className="platform platform-1" />
        <img src={X} alt="twitter" className="platform platform-2" />
        <img src={Fb} alt="facebook" className="platform platform-3" />
        <img src={Call} alt="phone call" className="platform platform-4" />
        <img src={Bussiness} alt="bussiness" className="platform platform-5" />
        <img src={Whatsapp} alt="whatsapp" className="platform platform-6" />
    </div>
    
    <div className="conne" id="sms">
        <img src={Sms} alt="message" className="sms-logo" />
    </div>
    
    <div className="mai-logo-container">
        <img src={Logo} alt="MAI Chat" className="mai-logo" />
    </div>
    
    </>
  );
}

export default Page;
