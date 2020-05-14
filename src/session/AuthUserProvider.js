import React, { useState, useRef, useEffect } from "react";

import { URLS, HTTPMethods } from "../constants";
import {
  axios,
  isPlainObjectWithKeys,
  HTTPResponses,
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
      if (HTTPResponses.isSuccessful(response.status)) {
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

  async function makeRequest(config) {
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
      if (HTTPResponses.isSuccessful(response.status)) {
        return objectify(response.data);
      } else {
        if (HTTPResponses.isUnauthorized(response.status)) {
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
        makeRequest,
      }}
    >
      {props.children}
    </AuthUserContext.Provider>
  );
}
