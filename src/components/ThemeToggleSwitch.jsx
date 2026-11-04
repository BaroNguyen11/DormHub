import React, { useState, useEffect } from "react";
import styled from "styled-components";

export default function ThemeToggleSwitch() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <StyledWrapper>
      <label className="switch" aria-label="Toggle dark mode">
        <input
          type="checkbox"
          checked={isDark}
          onChange={(e) => setIsDark(e.target.checked)}
        />
        <span className="slider" />
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .switch {
    display: block;
    --width-of-switch: 3em;
    --height-of-switch: 1.5em;
    --size-of-icon: 1.1em; /* Giảm từ 1.4em xuống 1.1em để nằm vừa khung 1.5em */
    --slider-offset: 0.2em; /* Giảm khoảng lề vừa vặn */
    position: relative;
    width: var(--width-of-switch);
    height: var(--height-of-switch);
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-surface-2);
    transition: 0.4s;
    border-radius: 30px;
    border: 2px solid var(--color-line-strong);
  }


  .slider:before {
    position: absolute;
    content: "";
    height: var(--size-of-icon);
    width: var(--size-of-icon);
    border-radius: 50%;
    left: var(--slider-offset);
    top: 50%;
    transform: translateY(-50%);
    /* Đổi màu Gradient Mặt Trời ở đây */
    background: linear-gradient(40deg, #ff0080, #ff8c00 70%);
    transition: 0.4s;
  }

  input:checked + .slider {
    background-color: var(--color-surface-3);
  }

  input:checked + .slider:before {
    left: calc(
      100% - (var(--size-of-icon) + var(--slider-offset))
    );
    background: var(--color-surface-3);
    /* Đổi hình khuyết mặt trăng bằng shadow ở đây */
    box-shadow:
      inset -2px -2px 4px -1px #8983f7,
      inset -8px -3px 0 0 #a3dafb;
  }
`;