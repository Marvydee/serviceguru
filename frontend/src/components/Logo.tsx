import React from "react";
import styles from "../styles/Logo.module.css";

const Logo: React.FC = () => {
  return (
    <div className={styles.logo}>
      <img
        src="https://i.postimg.cc/BnsNF1SR/logo-black-removebg-preview-1.png"
        alt="ServiceGuru Logo"
        className={styles.logoImage}
        loading="lazy"
      />
    </div>
  );
};

export default Logo;
