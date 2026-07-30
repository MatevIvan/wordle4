import React, { useEffect, useRef } from "react";

const Popup = ({ message, onClose, title = "Check your guess" }) => {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!message) return;

    const previousFocus = document.activeElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [message, onClose]);

  if (!message) return null;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="popup-backdrop" onMouseDown={handleBackdropClick}>
      <section
        className="popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        aria-describedby="popup-message"
      >
        <h2 id="popup-title">{title}</h2>
        <p id="popup-message">{message}</p>
        <button ref={closeButtonRef} className="popup-close" onClick={onClose}>
          Continue
        </button>
      </section>
    </div>
  );
};

export default Popup;
