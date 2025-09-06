"use client"
// This needs to be moved elsewhere

import React, { createContext, useState, useContext, ReactNode } from "react";

// 1. Define the shape of your context value
type LoginContextType = {
  login: boolean;
  setLogin: (value: boolean) => void;
};

// 2. Create the context with a default value (or undefined)
const LoginContext = createContext<LoginContextType | undefined>(undefined);

// 3. Create the provider
type LoginProviderProps = {
  children: ReactNode;
};

export const LoginProvider = ({ children }: LoginProviderProps) => {
  const [login, setLogin] = useState<boolean>(false);

  return (
    <LoginContext.Provider value={{ login, setLogin }}>
      {children}
    </LoginContext.Provider>
  );
};

// 4. Create a custom hook to use the context
export const useLogin = (): LoginContextType => {
  const context = useContext(LoginContext);
  if (context === undefined) {
    throw new Error("useLogin must be used within a LoginProvider");
  }
  return context;
};