import React, { useState, useRef, useEffect } from "react";

import { URLS } from "../constants";
import { axios } from "../utils";

export const AuthUserContext = React.createContext(null);

export default function AuthUserProvider(props) {
  let isMounted = useRef(true);

  const getSessionFromStorage = () => {
    let authUser = localStorage.getItem("authUser");
    if (authUser) {
      return JSON.parse(authUser);
    }
    return null;
  };

  const [authUser, setAuthUser] = useState(getSessionFromStorage());

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

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
      isMounted.current && setAuthUser(response.admin);
      putSessionToStorage(response.admin);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    isMounted.current && setAuthUser(null);
    deleteSessionFromStorage();
  };

  const makeRequest = async (config) => {
    if (!authUser) {
      throw new Error("Unauthorized Access");
    }

    try {
      const response = await axios({
        ...config,
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      });
      return response;
    } catch (error) {
      if (error.message === "Unauthorized") {
        logout();
      }
      throw error;
    }
  };

  return (
    <AuthUserContext.Provider
      value={{
        data: authUser,
        login,
        logout,
        makeRequest,
      }}
    >
      {props.children}
    </AuthUserContext.Provider>
  );
}
