import { useEffect } from "react";
import Ig from "./assets/ig.png";
import Sms from "./assets/sms.png";
import X from "./assets/x.png"; 
import Fb from "./assets/fb.png";
import Call from "./assets/call.png";
import Bussiness from "./assets/business.png";
import Whatsapp from "./assets/whatsapp.png";
import Logo from "./assets/logo.svg";

function Page() {
  const platforms = [
    { id: "platform-ig", src: Ig, alt: "instagram" },
    { id: "platform-x", src: X, alt: "twitter" },
    { id: "platform-fb", src: Fb, alt: "facebook" },
    { id: "platform-call", src: Call, alt: "phone call" },
    { id: "platform-business", src: Bussiness, alt: "bussiness" },
    { id: "platform-whatsapp", src: Whatsapp, alt: "whatsapp" },
  ];

  useEffect(() => {
    const animateSequence = async () => {
      const smsElement = document.getElementById("sms");
      
      if (!smsElement) return;
      
      // Get SMS position
      const smsRect = smsElement.getBoundingClientRect();
      const smsCenterX = smsRect.left + smsRect.width / 2;
      const smsCenterY = smsRect.top + smsRect.height / 2;

      // Store platform original positions
      const platformPositions = platforms.map(p => {
        const el = document.getElementById(p.id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          id: p.id,
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2
        };
      }).filter(Boolean);

      // Animate each platform
      for (let i = 0; i < platformPositions.length; i++) {
        const pos = platformPositions[i];
        const platformEl = document.getElementById(pos.id);
        
        if (!platformEl) continue;

        // Calculate diagonal distance to SMS (oblique line)
        const moveX = smsCenterX - pos.centerX;
        const moveY = smsCenterY - pos.centerY;

        // Step 1: Platform moves diagonally/obliquely to SMS
        const movePlatformToSms = new Promise((resolve) => {
          platformEl.style.transition = "transform 1s ease-in-out";
          platformEl.style.zIndex = "1000";
          platformEl.style.transform = `translate(${moveX}px, ${moveY}px)`;
          
          setTimeout(() => {
            resolve();
          }, 1100);
        });

        await movePlatformToSms;
        
        // Step 2: SMS moves down to logo
        const moveSmsToLogo = new Promise((resolve) => {
          smsElement.style.transition = "transform 0.8s ease-in-out";
          smsElement.style.zIndex = "2000";
          smsElement.style.transform = "translateY(120px)";
          
          setTimeout(() => {
            resolve();
          }, 900);
        });

        await moveSmsToLogo;
        
        // Brief pause at logo
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Step 3: Platform returns to original position
        const returnPlatform = new Promise((resolve) => {
          platformEl.style.transition = "transform 0.6s ease-in-out";
          platformEl.style.transform = "translate(0, 0)";
          
          setTimeout(() => {
            platformEl.style.zIndex = "";
            platformEl.style.transition = "";
            platformEl.style.transform = "";
            resolve();
          }, 700);
        });

        await returnPlatform;
        
        // Step 4: SMS returns to original position
        const resetSms = new Promise((resolve) => {
          smsElement.style.transition = "transform 0.6s ease-in-out";
          smsElement.style.transform = "translateY(0)";
          
          setTimeout(() => {
            smsElement.style.zIndex = "";
            smsElement.style.transition = "";
            smsElement.style.transform = "";
            resolve();
          }, 700);
        });
        
        await resetSms;
        
        // Brief pause before next platform
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    };

    // Start animation after a short delay
    const timer = setTimeout(() => {
      animateSequence();
    }, 500);

    // Make animation infinite
    const totalCycleTime = 28000;
    const interval = setInterval(() => {
      animateSequence();
    }, totalCycleTime);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="page-wrapper">
      {/* Top corner buttons */}
      <div className="auth-buttons">
        <button className="btn-login">Login</button>
        <button className="btn-register">Register</button>
      </div>

      <div className="animation-container">
        <div className="platforms-row">
          {platforms.map((platform, index) => (
            <img 
              key={platform.id}
              id={platform.id}
              src={platform.src} 
              alt={platform.alt} 
              className={`platform platform-${index + 1}`} 
            />
          ))}
        </div>
        
        <div className="conne" id="sms">
          <img src={Sms} alt="message" className="sms-logo" />
        </div>
        
        <div className="mai-logo-container">
          <img src={Logo} alt="MAI Chat" className="mai-logo" />
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>ernestine@2026 chat</p>
      </footer>
    </div>
  );
}

export default Page;
