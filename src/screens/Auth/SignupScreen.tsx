import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "react-native-paper";
import { useSignup } from "../../hooks/auth/useSignup";
import AuthForm from "../../components/auth/AuthForm";


export default function SignupScreen() {
  const navigation: any = useNavigation();
  const { login } = useContext(AuthContext);
  const theme = useTheme();


  const { signupRequest, loading, errorMsg } = useSignup();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");


  const handleSignup = async () => {
    const user = await signupRequest(username, password);
    if (user) login(user);
  };

    return (
    <AuthForm
      title="Sign Up"
      icon="account-plus"
      username={username}
      password={password}
      onChangeUsername={setUsername}
      onChangePassword={setPassword}
      submitLabel="Sign Up"
      footerLabel="Already have an account? Log in"
      onSubmit={handleSignup}
      onFooterPress={() => navigation.navigate("Login")}
      errorMsg={errorMsg}
      loading={loading}
    />
  );
}