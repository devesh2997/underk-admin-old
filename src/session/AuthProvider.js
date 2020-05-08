import React, { useState } from "react";
import axios from "axios";

export const AuthContext = React.createContext(null);

export default function AuthProvider(props) {
  const getSessionFromStorage = () => {
    let authUser = localStorage.getItem("authUser");
    if (authUser) {
      return JSON.parse(authUser);
    }
    return null;
  };

  const [authUser, setAuthUser] = useState(getSessionFromStorage());

  const putSessionToStorage = (value) => {
    localStorage.setItem("authUser", JSON.stringify(value));
  };

  const deleteSessionFromStorage = () => {
    localStorage.removeItem("authUser");
  };

  const login = async (alias, password) => {
    try {
      const ADMIN_LOGIN_URL = "http://localhost:400/v1/admin-login";
      const response = await axios.post(ADMIN_LOGIN_URL, {
        alias,
        password,
      });
      setAuthUser(response.data.admin);
      putSessionToStorage(response.data.admin);
    } catch (err) {
      if (err.response) {
        throw new Error(err.response.data.error);
      }
      if (err.request) {
        throw new Error(JSON.stringify(err.request));
      }
      throw err;
    }
  };

  const logout = () => {
    setAuthUser(null);
    deleteSessionFromStorage();
  };

  return (
    <AuthContext.Provider
      value={{
        user: authUser,
        login,
        logout,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
