// src/navigation/MainNavigator.tsx
import React, { useContext } from "react";


import AuthNavigator from "./AuthNavigator";
import { AuthContext } from "../context/AuthContext";
import AppNavigator from "./AppNavigator";
import DrawerNavigator from "./DrawerNavigator";

export default function MainNavigator() {
  const { user } = useContext(AuthContext);

  return user ? <DrawerNavigator /> : <AuthNavigator />;
}