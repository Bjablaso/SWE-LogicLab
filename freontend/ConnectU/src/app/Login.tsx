import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import { useTheme } from "@/hooks/use-theme";
import {
  loginAccount,
  saveSession,
} from "../services/auth";

export default function Login() {
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const session = await loginAccount({
        email: email.trim(),
        password,
      });

      await saveSession(session);
      router.replace("/Discover");
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Login failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.heading, { color: colors.baseFont }]}>
          Campus Connect
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Sign in to your account
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              color: colors.baseFont,
              borderColor: colors.border,
              backgroundColor: colors.input,
            },
          ]}
          placeholder="Towson email"
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={[
            styles.input,
            {
              color: colors.baseFont,
              borderColor: colors.border,
              backgroundColor: colors.input,
            },
          ]}
          placeholder="Password"
          placeholderTextColor={colors.placeholder}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <TouchableOpacity
            onPress={handleLogin}
            style={[
              styles.primaryButton,
              { backgroundColor: colors.accent },
            ]}
          >
            <Text
              style={[
                styles.primaryButtonText,
                { color: colors.onAccent },
              ]}
            >
              Log In
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.register}>
          <TouchableOpacity onPress={() => router.push("/Register")}>
            <Text style={[styles.link, { color: colors.link }]}>
              Don&apos;t have an account? Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 24,
    padding: 28,
    gap: 16,
  },
  heading: {
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  error: {
    color: "#D14343",
    fontWeight: "600",
  },
  register: {
    marginTop: 16,
  },
  primaryButton: {
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  link: {
    textAlign: "center",
    fontWeight: "600",
    marginTop: 4,
  },
});
