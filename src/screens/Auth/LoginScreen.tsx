import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { useLogin } from "../../hooks/auth/useLogin";
import AuthForm from "../../components/auth/AuthForm";


export default function LoginScreen() {
  const navigation: any = useNavigation();



  const loginQuery = useLogin();
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");


  //(handleLogin function remains the same)
const handleLogin = async () => {
  const authData = await loginQuery.login(username, password);

  if (authData) {
    await login(authData); // now expects { token, user }
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
      error={loginQuery.error}
      loading={loginQuery.loading}
    />
  );
}