import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const navigation: any = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMsg("Both fields required");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error);
        return;
      }

      console.log("Login success:", data);
      navigation.navigate("Home");
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {errorMsg !== "" && <Text style={styles.error}>{errorMsg}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.link}>Create an account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 30 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 15 },
  button: { backgroundColor: "#3949ab", padding: 15, borderRadius: 8 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  error: { color: "red", marginBottom: 10 },
  link: { marginTop: 15, color: "#3949ab", textAlign: "center" }
});