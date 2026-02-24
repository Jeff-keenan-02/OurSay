// src/navigation/MainNavigator.tsx
import React, { useContext } from "react";
import AuthNavigator from "./AuthNavigator";
import { AuthContext } from "../context/AuthContext";
import DrawerNavigator from "./DrawerNavigator";

export default function MainNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null; // or ActivityIndicator
  }

  return user ? <DrawerNavigator /> : <AuthNavigator />;
}