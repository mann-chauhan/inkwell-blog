import React, { useState } from "react";

const AuthContext = React.createContext({
  userName: "",
  authorities: [],
  token: "",
  isLoggedIn: false,
  login: (loginResponse) => {},
  logout: () => {},
  hasRole: (role) => false,
  ROLES: {},
});

const getAuthoritiesFromStorage = () => {
  const stored = sessionStorage.getItem("authorities");
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : String(parsed).split(",").map((role) => role.trim()).filter(Boolean);
  } catch {
    return String(stored).split(",").map((role) => role.trim()).filter(Boolean);
  }
};

export const AuthContextProvider = (props) => {
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [userName, setUserName] = useState(sessionStorage.getItem("userName"));
  const [authorities, setAuthorities] = useState(getAuthoritiesFromStorage);

  const userIsLoggedIn = !!token;

  const normalizeAuthorities = (rawAuthorities) => {
    if (Array.isArray(rawAuthorities)) return rawAuthorities;
    if (typeof rawAuthorities === "string") {
      return rawAuthorities.split(",").map((role) => role.trim()).filter(Boolean);
    }
    return [];
  };

  const loginHandler = ({ userName, authorities: rawAuthorities, jwt }) => {
    const resolvedAuthorities = normalizeAuthorities(rawAuthorities);
    setUserName(userName);
    setAuthorities(resolvedAuthorities);
    setToken(jwt);
    sessionStorage.setItem("userName", userName);
    sessionStorage.setItem("authorities", JSON.stringify(resolvedAuthorities));
    sessionStorage.setItem("token", jwt);
  };

  const logoutHandler = () => {
    setUserName("");
    setAuthorities([]);
    setToken("");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("authorities");
    sessionStorage.removeItem("token");
  };

  const contextValue = {
    userName,
    authorities,
    token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
    hasRole: (role) => authorities.includes(role),
    ROLES: {
      admin: "ROLE_ADMIN",
      user: "ROLE_USER",
    },
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
