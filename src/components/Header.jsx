import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/img/logo-no-background.png";

function Header() {
  return (
    <>
      <header className="p-3 text-bg-dark">
        <div className="container">
          <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
            <Link
              to="/"
              className="d-flex align-items-center mb-2 mb-lg-0 text-white text-decoration-none"
            >
              <img src={logo} alt="service" width="200" />
            </Link>

            <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
              <li>
                <Link to="/" className="nav-link px-2 text-secondary">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="nav-link px-2 text-white">
                  About
                </Link>
              </li>
            </ul>
            <div className="text-end">
              <a href="./public/register.html">
                <button type="button" className="btn btn-warning">
                  Get started
                </button>
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;

