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
import { registerAccount } from "../services/auth";

export default function Register() {
  const { colors } = useTheme();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError("");
    setSuccess("");

    if (!displayName.trim() || !email.trim() || !password) {
      setError("Name, email, and password are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await registerAccount({
        display_name: displayName.trim(),
        email: email.trim(),
        password,
      });

      setSuccess("Account created successfully.");
      setTimeout(() => {
        router.replace("/Login");
      }, 700);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Registration failed.",
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
        <Text
          style={[
            styles.heading,
            { color: colors.baseFont },
          ]}
        >
          Create Account
        </Text>

        <Text
          style={[
            styles.subtitle,
            { color: colors.muted },
          ]}
        >
          Join Campus Connect
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
          placeholder="Display name"
          placeholderTextColor={colors.placeholder}
          value={displayName}
          onChangeText={setDisplayName}
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

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        {success ? (
          <Text style={styles.success}>{success}</Text>
        ) : null}

        {loading ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <TouchableOpacity
            onPress={handleRegister}
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
              Create Account
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => router.replace("/Login")}>
          <Text
            style={[
              styles.link,
              { color: colors.link },
            ]}
          >
            Already have an account? Log in
          </Text>
        </TouchableOpacity>
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

  success: {
    color: "#2E8B57",
    fontWeight: "600",
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
