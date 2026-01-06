import React, { useRef } from "react";
import "./OtpInput.css";

const OtpInput = ({ value, onChange, length = 6 }) => {
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const digit = e.target.value.replace(/\D/g, "");
    if (!digit) return;

    const newValue = value.split("");
    newValue[index] = digit;
    onChange(newValue.join(""));

    if (index < length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newValue = value.split("");
      if (newValue[index]) {
        newValue[index] = "";
        onChange(newValue.join(""));
      } else if (index > 0) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(pasted)) return;

    onChange(pasted);
    inputsRef.current[pasted.length - 1]?.focus();
  };

  return (
    <div className="otp-container-login" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          maxLength="1"
          inputMode="numeric"
          className="otp-input"
          value={value[index] || ""}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
        />
      ))}
    </div>
  );
};

export default OtpInput;
