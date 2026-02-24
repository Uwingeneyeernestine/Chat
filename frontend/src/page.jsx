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
      const logoElement = document.querySelector(".mai-logo");
      
      if (!smsElement || !logoElement) return;
      
      // Get positions
      const smsRect = smsElement.getBoundingClientRect();
      const logoRect = logoElement.getBoundingClientRect();
      const smsCenter = {
        x: smsRect.left + smsRect.width / 2,
        y: smsRect.top + smsRect.height / 2
      };
      const logoCenter = {
        x: logoRect.left + logoRect.width / 2,
        y: logoRect.top + logoRect.height / 2
      };

      // Calculate delta (how far to move)
      const smsToLogoDelta = {
        x: logoCenter.x - smsCenter.x,
        y: logoCenter.y - smsCenter.y
      };

      // Store original positions for all platforms
      const platformPositions = platforms.map(p => {
        const el = document.getElementById(p.id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          id: p.id,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      }).filter(Boolean);

      // Animate each platform
      for (let i = 0; i < platformPositions.length; i++) {
        const pos = platformPositions[i];
        const platformEl = document.getElementById(pos.id);
        
        if (!platformEl) continue;

        // Calculate platform to SMS delta
        const platformToSmsDelta = {
          x: smsCenter.x - pos.x,
          y: smsCenter.y - pos.y
        };

        // Step 1: Platform moves to SMS center using transform
        const movePlatformToSms = new Promise((resolve) => {
          platformEl.style.transition = "transform 0.8s ease-in-out";
          platformEl.style.zIndex = "1000";
          platformEl.style.transform = `translate(calc(-50% + ${platformToSmsDelta.x}px), calc(-50% + ${platformToSmsDelta.y}px))`;
          
          setTimeout(() => {
            resolve();
          }, 900);
        });

        await movePlatformToSms;
        
        // Step 2: SMS moves to logo using transform (doesn't affect layout)
        const moveSmsToLogo = new Promise((resolve) => {
          smsElement.style.transition = "transform 0.8s ease-in-out";
          smsElement.style.zIndex = "2000";
          smsElement.style.transform = `translate(calc(-50% + ${smsToLogoDelta.x}px), calc(-50% + ${smsToLogoDelta.y}px))`;
          
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
          platformEl.style.transform = "translate(-50%, -50%)";
          
          setTimeout(() => {
            // Reset platform styles
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
          smsElement.style.transform = "translate(-50%, -50%)";
          
          setTimeout(() => {
            // Reset SMS styles
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
    const totalCycleTime = 26000;
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
