// src/screens/admin/ChangePasswordScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export const ChangePasswordScreen: React.FC = () => {
  const { changePassword } = useAuth();
  const { theme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("الرجاء تعبئة جميع الحقول");
      return;
    }

    if (newPassword.length < 6) {
      setError("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("كلمتا المرور الجديدتان غير متطابقتين");
      return;
    }

    if (currentPassword === newPassword) {
      setError("كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية");
      return;
    }

    try {
      setError("");
      setLoading(true);

      await changePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      Alert.alert("تم", "تم تغيير كلمة المرور بنجاح");
    } catch (err: any) {
      let message = "حدث خطأ أثناء تغيير كلمة المرور";

      if (
        err?.code === "auth/wrong-password" ||
        err?.code === "auth/invalid-credential"
      ) {
        message = "كلمة المرور الحالية غير صحيحة";
      } else if (err?.code === "auth/weak-password") {
        message = "كلمة المرور الجديدة ضعيفة";
      } else if (err?.code === "auth/too-many-requests") {
        message = "عدد المحاولات كبير، حاول لاحقًا";
      } else if (err?.code === "auth/requires-recent-login") {
        message = "يرجى تسجيل الدخول مرة أخرى ثم إعادة المحاولة";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.surface,
            borderColor: theme.lightGray,
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.darkText }]}>
          تغيير كلمة المرور
        </Text>

        <Text style={[styles.subtitle, { color: theme.lightText }]}>
          أدخل كلمة المرور الحالية ثم اختر كلمة مرور جديدة
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              color: theme.darkText,
              borderColor: theme.mediumGray,
              backgroundColor: theme.surfaceVariant,
            },
          ]}
          placeholder="كلمة المرور الحالية"
          placeholderTextColor={theme.lightText}
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
          textAlign="right"
        />

        <TextInput
          style={[
            styles.input,
            {
              color: theme.darkText,
              borderColor: theme.mediumGray,
              backgroundColor: theme.surfaceVariant,
            },
          ]}
          placeholder="كلمة المرور الجديدة"
          placeholderTextColor={theme.lightText}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          textAlign="right"
        />

        <TextInput
          style={[
            styles.input,
            {
              color: theme.darkText,
              borderColor: theme.mediumGray,
              backgroundColor: theme.surfaceVariant,
            },
          ]}
          placeholder="تأكيد كلمة المرور الجديدة"
          placeholderTextColor={theme.lightText}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          textAlign="right"
        />

        {!!error && (
          <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: loading ? theme.mediumGray : theme.goldPrimary,
            },
          ]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.white} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.white }]}>
              تغيير كلمة المرور
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14,
    fontSize: 16,
  },
  error: {
    fontSize: 14,
    textAlign: "right",
    marginBottom: 14,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});