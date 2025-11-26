// src/navigation/MainNavigator.tsx
import React, { useContext } from "react";


import AuthNavigator from "./AuthNavigator";
import { AuthContext } from "../context/AuthContext";
import AppNavigator from "./AppNavigator";

export default function MainNavigator() {
  const { user } = useContext(AuthContext);

  return user ? <AppNavigator /> : <AuthNavigator />;
}