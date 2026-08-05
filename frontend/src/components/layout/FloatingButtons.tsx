import { useState, useEffect } from "react";
import { MessageCircle, Facebook } from "lucide-react";

export function FloatingButtons() {
  const [whatsappHover, setWhatsappHover] = useState(false);
  const [facebookHover, setFacebookHover] = useState(false);
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);

  // Replace with your actual numbers/links
  const whatsappNumber = "8801946664836"; // Format: country code + number (no + or spaces)
  const facebookPageUrl = "https://www.facebook.com/TheAsmodeus2607";

  useEffect(() => {
    const toggleScrollButtonVisibility = () => {
      if (window.scrollY > 300) {
        setIsScrollButtonVisible(true);
      } else {
        setIsScrollButtonVisible(false);
      }
    };

    window.addEventListener("scroll", toggleScrollButtonVisibility);

    return () => {
      window.removeEventListener("scroll", toggleScrollButtonVisibility);
    };
  }, []);

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=Hello! I would like to know more about Clinexa Hospital services.`, '_blank');
  };

  const handleFacebookClick = () => {
    window.open(facebookPageUrl, '_blank');
  };

  return (
    <div className={`fixed right-4 sm:right-6 z-40 flex flex-col gap-3 transition-all duration-300 ${isScrollButtonVisible ? 'bottom-20 sm:bottom-24' : 'bottom-4 sm:bottom-6'
      }`}>
      {/* WhatsApp Button */}
      <div className="relative group">
        <button
          onClick={handleWhatsAppClick}
          onMouseEnter={() => setWhatsappHover(true)}
          onMouseLeave={() => setWhatsappHover(false)}
          className="flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-[#25D366] hover:bg-[#1fb855] text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 animate-fade-in"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </button>

        {/* Tooltip - Hidden on mobile */}
        <div className={`hidden sm:block absolute right-16 top-1/2 -translate-y-1/2 transition-all duration-300 ${whatsappHover ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
          }`}>
          <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap shadow-lg">
            Chat with us on WhatsApp
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
              <div className="border-8 border-transparent border-l-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Facebook Button */}
      <div className="relative group">
        <button
          onClick={handleFacebookClick}
          onMouseEnter={() => setFacebookHover(true)}
          onMouseLeave={() => setFacebookHover(false)}
          className="flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-[#1877F2] hover:bg-[#145dbf] text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 animate-fade-in stagger-1"
          aria-label="Visit our Facebook page"
        >
          <Facebook className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor" />
        </button>

        {/* Tooltip - Hidden on mobile */}
        <div className={`hidden sm:block absolute right-16 top-1/2 -translate-y-1/2 transition-all duration-300 ${facebookHover ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
          }`}>
          <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap shadow-lg">
            Follow us on Facebook
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
              <div className="border-8 border-transparent border-l-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
