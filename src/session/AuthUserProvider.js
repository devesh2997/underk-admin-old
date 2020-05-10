import React, { useState } from "react";

import { URLS } from "../constants";
import { axios } from "../utils";

export const AuthUserContext = React.createContext(null);

export default function AuthUserProvider(props) {
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
      const response = await axios({
        method: "POST",
        url: URLS.ADMIN_LOGIN_URL,
        data: {
          alias,
          password,
        },
      });
      setAuthUser(response.admin);
      putSessionToStorage(response.admin);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setAuthUser(null);
    deleteSessionFromStorage();
  };

  return (
    <AuthUserContext.Provider
      value={{
        data: authUser,
        login,
        logout,
      }}
    >
      {props.children}
    </AuthUserContext.Provider>
  );
}
