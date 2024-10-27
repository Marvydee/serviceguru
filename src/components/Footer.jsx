import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();
  console.log(currentYear);

  return (
    <>
      <div className="container">
        <footer className="py-3 my-4">
          <ul className="nav justify-content-center border-bottom pb-3 mb-3">
            <li>
              <Link to="/" className="nav-link px-2 text-secondary">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="nav-link px-2 text-secondary">
                About
              </Link>
            </li>
          </ul>
          <p className="text-center text-body-secondary">
            © {currentYear} Serviceguru
          </p>
        </footer>
      </div>
    </>
  );
}

export default Footer;

