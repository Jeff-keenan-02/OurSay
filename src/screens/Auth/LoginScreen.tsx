import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { useLogin } from "../../hooks/auth/useLogin";
import AuthForm from "../../components/auth/AuthForm";
import { API_BASE_URL } from "../../config/api";

export default function LoginScreen() {
  const navigation: any = useNavigation();

  const API = API_BASE_URL;

  const { loginRequest, loading, errorMsg } = useLogin(API);
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");


  //(handleLogin function remains the same)
const handleLogin = async () => {
  const user = await loginRequest(username, password);

  if (user) {
    login(user); // store in context
  }
};

 return (
    <AuthForm
      title="Login"
      icon="account-lock"
      username={username}
      password={password}
      onChangeUsername={setUsername}
      onChangePassword={setPassword}
      submitLabel="Login"
      footerLabel="Create an account"
      onSubmit={handleLogin}
      onFooterPress={() => navigation.navigate("Signup")}
      errorMsg={errorMsg}
      loading={loading}
    />
  );
}