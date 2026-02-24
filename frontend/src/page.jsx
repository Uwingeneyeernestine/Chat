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
      
      // Get initial positions
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

        // Step 1: Platform moves to SMS - COVERS it
        const movePlatformToSms = new Promise((resolve) => {
          platformEl.style.position = "fixed";
          platformEl.style.left = `${pos.x}px`;
          platformEl.style.top = `${pos.y}px`;
          platformEl.style.transform = "translate(-50%, -50%)";
          platformEl.style.zIndex = "1000";
          
          // Trigger reflow
          platformEl.offsetHeight;
          
          // Move to SMS (covers it)
          platformEl.style.transition = "all 0.8s ease-in-out";
          platformEl.style.left = `${smsCenter.x}px`;
          platformEl.style.top = `${smsCenter.y}px`;
          
          setTimeout(() => {
            resolve();
          }, 900);
        });

        await movePlatformToSms;
        
        // Step 2: SMS moves to logo - COVERS it (same as platform covers SMS)
        const moveSmsToLogo = new Promise((resolve) => {
          smsElement.style.position = "fixed";
          smsElement.style.left = `${smsCenter.x}px`;
          smsElement.style.top = `${smsCenter.y}px`;
          smsElement.style.transform = "translate(-50%, -50%)";
          smsElement.style.zIndex = "1000"; // COVERS logo (same as platform covers SMS)
          smsElement.style.transition = "all 0.8s ease-in-out";
          
          // Trigger reflow
          smsElement.offsetHeight;
          
          // Move to logo (covers it)
          smsElement.style.left = `${logoCenter.x}px`;
          smsElement.style.top = `${logoCenter.y}px`;
          
          setTimeout(() => {
            resolve();
          }, 900);
        });

        await moveSmsToLogo;
        
        // Brief pause at logo
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Step 3: Platform returns
        const returnPlatform = new Promise((resolve) => {
          platformEl.style.transition = "all 0.6s ease-in-out";
          platformEl.style.left = `${pos.x}px`;
          platformEl.style.top = `${pos.y}px`;
          
          setTimeout(() => {
            // Reset platform styles
            platformEl.style.position = "";
            platformEl.style.left = "";
            platformEl.style.top = "";
            platformEl.style.transform = "";
            platformEl.style.zIndex = "";
            platformEl.style.transition = "";
            resolve();
          }, 700);
        });

        await returnPlatform;
        
        // Step 4: SMS resets
        const resetSms = new Promise((resolve) => {
          smsElement.style.transition = "all 0.5s ease-in-out";
          smsElement.style.left = `${smsCenter.x}px`;
          smsElement.style.top = `${smsCenter.y}px`;
          smsElement.style.transform = "translate(-50%, -50%)";
          
          setTimeout(() => {
            // Reset SMS styles
            smsElement.style.position = "";
            smsElement.style.left = "";
            smsElement.style.top = "";
            smsElement.style.transform = "";
            smsElement.style.zIndex = "";
            smsElement.style.transition = "";
            resolve();
          }, 600);
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
    const totalCycleTime = 24000;
    const interval = setInterval(() => {
      animateSequence();
    }, totalCycleTime);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
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
  );
}

export default Page;
