import React, { useState } from "react";
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";
import { signup, login } from "@/api/auth";
import { ApiError } from "@/api/client";
import { useTheme } from "@/theme/ThemeContext";
import { ColorTheme } from "@/theme/themes";
import { Keyboard, TouchableWithoutFeedback } from "react-native";

export default function LoginScreen({ navigation }: any) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = getStyles(colors);

  const [isSignupMode, setIsSignupMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSignup = async () => {
    setErrorMessage("");
    setVerificationSent(false);

    if (!email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      await signup(email.trim(), password);
      // Backend signs the user in immediately (returns tokens), so go to Home.
      navigation.replace("Home");
    } catch (error: any) {
      if (error instanceof ApiError && error.status === 409) {
        setErrorMessage("This email is already in use.");
      } else if (error instanceof ApiError && error.status === 400) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Signup failed. Please try again.");
      }
    }
  };

  const handleLogin = async () => {
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      await login(email.trim(), password);
      navigation.replace("Home");
    } catch (error: any) {
      if (error instanceof ApiError && error.status === 401) {
        setErrorMessage("Invalid email or password.");
      } else {
        setErrorMessage("Login failed. Please try again.");
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>
          {isSignupMode ? "Create Account" : "Welcome Back"}
        </Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="grey"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="grey"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        {isSignupMode && (
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="grey"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
          />
        )}

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {verificationSent && (
          <Text style={styles.verificationText}>
            Verification email sent. Please check your inbox before logging in.
          </Text>
        )}

        {isSignupMode ? (
          <Pressable onPress={handleSignup} style={styles.button}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </Pressable>
        ) : (
          <Pressable onPress={handleLogin} style={styles.button}>
            <Text style={styles.buttonText}>Login</Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => {
            setIsSignupMode(!isSignupMode);
            setErrorMessage("");
            setVerificationSent(false);
          }}
          style={styles.toggleWrapper}
        >
          <Text style={styles.toggleText}>
            {isSignupMode
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up!"}
          </Text>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
}

const getStyles = (colors: ColorTheme["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 30,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 32,
      color: colors.primary,
      fontFamily: "Futura",
      textAlign: "center",
      marginBottom: 30,
    },
    input: {
      height: 50,
      borderWidth: 2,
      borderColor: colors.primary,
      paddingHorizontal: 15,
      borderRadius: 12,
      marginBottom: 15,
      color: colors.text,
      fontFamily: "Futura",
      backgroundColor: colors.card,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 10,
    },
    buttonText: {
      color: "#1e1e1e",
      fontSize: 18,
      fontFamily: "Futura",
    },
    toggleWrapper: {
      marginTop: 20,
      alignItems: "center",
    },
    toggleText: {
      color: colors.primary,
      fontFamily: "Futura",
      fontSize: 16,
      textDecorationLine: "underline",
    },
    errorText: {
      color: "red",
      fontSize: 14,
      textAlign: "center",
      marginBottom: 10,
      fontFamily: "Futura",
    },
    verificationText: {
      color: "limegreen",
      fontSize: 14,
      textAlign: "center",
      marginTop: 10,
      fontFamily: "Futura",
    },
  });
