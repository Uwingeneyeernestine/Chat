import { useState, useEffect, useRef } from "react";
import Ig from "./assets/ig.png";
import Sms from "./assets/sms.png";
import X from "./assets/x.png"; 
import Fb from "./assets/fb.png";
import Call from "./assets/call.png";
import Bussiness from "./assets/business.png";
import Whatsapp from "./assets/whatsapp.png";
import Logo from "./assets/logo.svg";
import Login from "./sign.jsx";
import Signup from "./signup.jsx";
import { Header, Footer, Bar } from "./Layout.jsx";

function Page({ onLoginSuccess }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const loginRef = useRef(null);
  
  const platforms = [
    { id: "platform-ig", src: Ig, alt: "instagram" },
    { id: "platform-x", src: X, alt: "twitter" },
    { id: "platform-fb", src: Fb, alt: "facebook" },
    { id: "platform-call", src: Call, alt: "phone call" },
    { id: "platform-business", src: Bussiness, alt: "bussiness" },
    { id: "platform-whatsapp", src: Whatsapp, alt: "whatsapp" },
  ];

  // Handle click outside to close login/register
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (loginRef.current && !loginRef.current.contains(event.target)) {
        setShowLogin(false);
        setShowRegister(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLoginClick = () => {
    setShowLogin(true);
    setShowRegister(false);
  };

  const handleRegisterClick = () => {
    setShowRegister(true);
    setShowLogin(false);
  };

  const handleSwitchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  useEffect(() => {
    const animateSequence = async () => {
      const smsElement = document.getElementById("sms");
      const logoElement = document.querySelector(".mai-logo");
      
      if (!smsElement || !logoElement) return;
      
      // Get positions
      const smsRect = smsElement.getBoundingClientRect();
      const logoRect = logoElement.getBoundingClientRect();
      const smsCenterX = smsRect.left + smsRect.width / 2;
      const smsCenterY = smsRect.top + smsRect.height / 2;
      const logoCenterX = logoRect.left + logoRect.width / 2;
      const logoCenterY = logoRect.top + logoRect.height / 2;

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

        // Calculate
        const moveX = smsCenterX - pos.centerX;
        const moveY = smsCenterY - pos.centerY;

        // Step 1: Platform moves diagonally to SMS
        const movePlatformToSms = new Promise((resolve) => {
          platformEl.style.transition = "transform 1s ease-in-out";
          platformEl.style.zIndex = "1000";
          platformEl.style.transform = `translate(${moveX}px, ${moveY}px)`;
          
          setTimeout(() => {
            resolve();
          }, 1100);
        });

        await movePlatformToSms;
        
        // Step 2: SMS moves to logo using transform (keeps document flow)
        const moveSmsToLogo = new Promise((resolve) => {
          // Calculate the offset from SMS to logo
          const smsToLogoX = logoCenterX - smsCenterX;
          const smsToLogoY = logoCenterY - smsCenterY;
          
          smsElement.style.transition = "transform 0.8s ease-in-out";
          smsElement.style.zIndex = "2000";
          smsElement.style.transform = `translate(${smsToLogoX}px, ${smsToLogoY}px)`;
          
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
        
        // Step 4: SMS returns to original position using transform
        const resetSms = new Promise((resolve) => {
          smsElement.style.transition = "transform 0.6s ease-in-out";
          smsElement.style.transform = "translate(0, 0)";
          
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
      <div className="auth-buttons" ref={loginRef}>
        <button className="btn-login" onClick={handleLoginClick}>Login</button>
        {showLogin && (
          <div className="login-popup">
            <Login onSwitchToRegister={handleSwitchToRegister} onLoginSuccess={onLoginSuccess} />
          </div>
        )}
        <button className="btn-register" onClick={handleRegisterClick}>Register</button>
        {showRegister && (
          <div className="login-popup register-popup">
            <Signup onSwitchToLogin={handleSwitchToLogin} onSignupSuccess={() => {
              setShowRegister(false);
              setShowLogin(true);
            }} />
          </div>
        )}
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
        
        {/* SMS is now above logo */}
        <div className="conne" id="sms">
          <img src={Sms} alt="message" className="sms-logo" />
        </div>
        
        {/* Logo is now at the bottom */}
        <div className="mai-logo-container">
          <img src={Logo} alt="MAI Chat" className="mai-logo" />
        </div>
      </div>

      {/* Footer component */}
      <Footer />
    </div>
  );
}

export default Page;
