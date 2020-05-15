import React, { useState, useRef, useEffect } from "react";

import { URLS, HTTPMethods } from "../constants";
import {
  axios,
  isPlainObjectWithKeys,
  getResponseStatus,
  objectify,
  stringify,
} from "../utils";

export const AuthUserContext = React.createContext(null);

export default function AuthUserProvider(props) {
  let isMounted = useRef(true);

  const [authUser, setAuthUser] = useState(getSessionFromStorage());

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  function getSessionFromStorage() {
    let authUser = localStorage.getItem("authUser");
    if (authUser) {
      return JSON.parse(authUser);
    }
    return null;
  }

  function putSessionToStorage(value) {
    localStorage.setItem("authUser", JSON.stringify(value));
  }

  function deleteSessionFromStorage() {
    localStorage.removeItem("authUser");
  }

  async function login(alias, password) {
    try {
      const response = await axios({
        method: HTTPMethods.POST,
        url: URLS.ADMIN_LOGIN_URL,
        data: {
          alias,
          password,
        },
      });
      const responseStatus = getResponseStatus(response.status);
      if (responseStatus.isSuccessful) {
        isMounted.current && setAuthUser(objectify(response.data).admin);
        putSessionToStorage(objectify(response.data).admin);
      } else {
        throw new Error(
          (isPlainObjectWithKeys(response.data) &&
            stringify(response.data.error)) ||
            response.statusText
        );
      }
    } catch (error) {
      throw error;
    }
  }

  function logout() {
    isMounted.current && setAuthUser(null);
    deleteSessionFromStorage();
  }

  async function doRequest(config) {
    if (!authUser) {
      throw new Error("Not Authenticated");
    }

    try {
      const response = await axios({
        ...config,
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      });
      const responseStatus = getResponseStatus(response.status);
      if (responseStatus.isSuccessful) {
        return objectify(response.data);
      } else {
        if (responseStatus.isUnauthorized) {
          logout();
        }
        throw new Error(
          (isPlainObjectWithKeys(response.data) &&
            stringify(response.data.error)) ||
            response.statusText
        );
      }
    } catch (error) {
      throw error;
    }
  }

  return (
    <AuthUserContext.Provider
      value={{
        data: authUser,
        login,
        logout,
        doRequest,
      }}
    >
      {props.children}
    </AuthUserContext.Provider>
  );
}
