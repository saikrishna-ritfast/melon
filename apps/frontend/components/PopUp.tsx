import React, { useEffect } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import styles from './PopUp.module.css';

interface PopUpProps {
  children: React.ReactNode;
  modelOpen: boolean;
  setModelOpen: (value: boolean) => void;
}

const Form = ({ children, modelOpen, setModelOpen }: PopUpProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modelOpen) {
        setModelOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modelOpen, setModelOpen]);

  if (!modelOpen) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) setModelOpen(false);
      }}
    >
      <div className={styles.content}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => setModelOpen(false)}
          aria-label="Close modal"
        >
          <IoCloseSharp className="text-xl" />
        </button>
        <div className="flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Form;