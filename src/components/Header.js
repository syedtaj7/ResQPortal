import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
// import resqportalImg from '../assets/images/resqlogo.png';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-48 bg-[#F5F5F5] text-black transition-transform z-50 shadow-[4px_0_10px_rgba(0,0,0,0.1)] md:translate-x-0 flex flex-col justify-center ${
          isOpen ? "translate-x-0" : "-translate-x-64"
        }`}
      >
        {/* Logo */}
        {/* <div className="p-5 text-center">
          <img
            src={resqportalImg}
            alt="ResQTech Logo"
            className="mt-0 w-58 h-48"
          />
        </div> */}

        <nav className="space-y-6 px-5">
          {" "}
          {/* Increase space between links */}
          <NavLink
            to="/welcome"
            className={({ isActive }) =>
              `block transition-colors relative ${
                isActive || location.pathname === "/"
                  ? "text-[#F6C708] font-semibold"
                  : ""
              } hover:text-[#F6C708] hover:bg-[#F6C70833] p-2 rounded-md`
            }
          >
            Welcome
          </NavLink>
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `block transition-colors relative ${
                isActive ? "text-[#F6C708] font-semibold" : ""
              } hover:text-[#F6C708] hover:bg-[#F6C70833] p-2 rounded-md`
            }
          >
            Disasters
          </NavLink>
          <NavLink
            to="/relocation"
            className={({ isActive }) =>
              `block transition-colors relative ${
                isActive ? "text-[#F6C708] font-semibold" : ""
              } hover:text-[#F6C708] hover:bg-[#F6C70833] p-2 rounded-md`
            }
          >
            Relocation
          </NavLink>
          <NavLink
            to="/community-help"
            className={({ isActive }) =>
              `block transition-colors relative ${
                isActive ? "text-[#F6C708] font-semibold" : ""
              } hover:text-[#F6C708] hover:bg-[#F6C70833] p-2 rounded-md`
            }
          >
            Alerts
          </NavLink>
          <NavLink
            to="/mitigation"
            className={({ isActive }) =>
              `block transition-colors relative ${
                isActive ? "text-[#F6C708] font-semibold" : ""
              } hover:text-[#F6C708] hover:bg-[#F6C70833] p-2 rounded-md`
            }
          >
            Mitigation
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `block transition-colors relative ${
                isActive ? "text-[#F6C708] font-semibold" : ""
              } hover:text-[#F6C708] hover:bg-[#F6C70833] p-2 rounded-md`
            }
          >
            Helplines
          </NavLink>
          <NavLink
            to="/donation"
            className={({ isActive }) =>
              `block transition-colors relative ${
                isActive ? "text-[#F6C708] font-semibold" : ""
              } hover:text-[#F6C708] hover:bg-[#F6C70833] p-2 rounded-md`
            }
          >
            Donation
          </NavLink>
        </nav>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-yellow-300 p-2 rounded-full text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
}

export default Header;
