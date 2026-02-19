// Copyright © Knoux. All rights reserved.
import type { Language } from "@/lib/i18n";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Switch,
  Alert,
  Linking,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { useColors } from "@/hooks/use-colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";


export default function SettingsScreen() {
  const { t, language, setLanguage } = useLanguage();
  const colors = useColors();
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [highQualityDefault, setHighQualityDefault] = useState(false);
  const [recordingNotifications, setRecordingNotifications] = useState(true);
  const [completionNotifications, setCompletionNotifications] = useState(true);

  const languages: { code: Language; label: string; nativeLabel: string }[] = [
    { code: "ar", label: "Arabic", nativeLabel: "العربية" },
    { code: "en", label: "English", nativeLabel: "English" },
    { code: "fr", label: "French", nativeLabel: "Français" },
  ];

  const handleLanguageSelect = async (lang: Language) => {
    await setLanguage(lang);
  };

  const handleClearCache = () => {
    Alert.alert(
      t.settings.clearCache,
      language === "ar"
        ? "هل أنت متأكد من مسح الذاكرة المؤقتة؟"
        : language === "fr"
          ? "Voulez-vous vider le cache ?"
          : "Are you sure you want to clear the cache?",
      [
        {
          text: t.common.cancel,
          style: "cancel",
        },
        {
          text: t.common.delete,
          style: "destructive",
          onPress: () => {
            Alert.alert(
              t.common.success,
              language === "ar"
                ? "تم مسح الذاكرة المؤقتة بنجاح"
                : language === "fr"
                  ? "Cache vidé avec succès"
                  : "Cache cleared successfully"
            );
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      t.settings.resetSettings,
      language === "ar"
        ? "سيؤدي ذلك إلى إعادة جميع الإعدادات إلى الوضع الافتراضي. هل تريد المتابعة؟"
        : language === "fr"
          ? "Cela réinitialisera tous les paramètres. Continuer ?"
          : "This will reset all settings to defaults. Continue?",
      [
        { text: t.common.cancel, style: "cancel" },
        {
          text:
            language === "ar"
              ? "إعادة تعيين"
              : language === "fr"
                ? "Réinitialiser"
                : "Reset",
          style: "destructive",
          onPress: () => {
            setDarkMode(false);
            setNotificationsEnabled(true);
            setAutoBackup(true);
            setHighQualityDefault(false);
            setRecordingNotifications(true);
            setCompletionNotifications(true);
          },
        },
      ]
    );
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <Text className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 mt-2">
      {title}
    </Text>
  );

  const SettingRow = ({
    icon,
    title,
    subtitle,
    right,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    right: React.ReactNode;
  }) => (
    <View className="flex-row items-center gap-3 py-3 border-b border-border last:border-b-0">
      <View
        className="w-9 h-9 rounded-lg items-center justify-center"
        style={{ backgroundColor: colors.primary + "20" }}
      >
        <MaterialIcons name={icon as any} size={20} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">{title}</Text>
        {subtitle && (
          <Text className="text-xs text-muted mt-0.5">{subtitle}</Text>
        )}
      </View>
      {right}
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2 pb-8">
          {/* Header */}
          <View className="gap-1 mb-4">
            <Text className="text-3xl font-bold text-foreground">
              {t.settings.title}
            </Text>
            <Text className="text-base text-muted">{t.settings.subtitle}</Text>
          </View>

          {/* Language */}
          <SectionHeader title={t.settings.language} />
          <View className="bg-surface rounded-2xl px-4 border border-border">
            <View className="py-3 border-b border-border">
              <Text className="text-sm font-semibold text-foreground mb-3">
                {t.settings.selectLanguage}
              </Text>
              <View className="gap-2">
                {languages.map((lang) => (
                  <Pressable
                    key={lang.code}
                    onPress={() => handleLanguageSelect(lang.code)}
                    className={`flex-row items-center justify-between p-3 rounded-xl border ${
                      language === lang.code
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background"
                    }`}
                  >
                    <View className="flex-row items-center gap-3">
                      <Text className="text-xl">
                        {lang.code === "ar"
                          ? "🇦🇪"
                          : lang.code === "en"
                            ? "🇺🇸"
                            : "🇫🇷"}
                      </Text>
                      <View>
                        <Text
                          className={`text-sm font-semibold ${
                            language === lang.code
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {lang.nativeLabel}
                        </Text>
                        <Text className="text-xs text-muted">{lang.label}</Text>
                      </View>
                    </View>
                    {language === lang.code && (
                      <MaterialIcons
                        name="check-circle"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Display */}
          <SectionHeader title={t.settings.display} />
          <View className="bg-surface rounded-2xl px-4 border border-border">
            <SettingRow
              icon="dark-mode"
              title={t.settings.darkMode}
              right={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{
                    false: colors.border,
                    true: colors.primary + "80",
                  }}
                  thumbColor={darkMode ? colors.primary : colors.muted}
                />
              }
            />
          </View>

          {/* Notifications */}
          <SectionHeader title={t.settings.notifications} />
          <View className="bg-surface rounded-2xl px-4 border border-border">
            <SettingRow
              icon="notifications"
              title={t.settings.enableNotifications}
              right={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{
                    false: colors.border,
                    true: colors.primary + "80",
                  }}
                  thumbColor={
                    notificationsEnabled ? colors.primary : colors.muted
                  }
                />
              }
            />
            <SettingRow
              icon="fiber-manual-record"
              title={
                language === "ar"
                  ? "إشعارات التسجيل"
                  : language === "fr"
                    ? "Notifs. d'enregistrement"
                    : "Recording Notifications"
              }
              right={
                <Switch
                  value={recordingNotifications && notificationsEnabled}
                  onValueChange={setRecordingNotifications}
                  disabled={!notificationsEnabled}
                  trackColor={{
                    false: colors.border,
                    true: colors.primary + "80",
                  }}
                  thumbColor={
                    recordingNotifications ? colors.primary : colors.muted
                  }
                />
              }
            />
            <SettingRow
              icon="check-circle"
              title={
                language === "ar"
                  ? "إشعارات الإنجاز"
                  : language === "fr"
                    ? "Notifs. de complétion"
                    : "Completion Notifications"
              }
              right={
                <Switch
                  value={completionNotifications && notificationsEnabled}
                  onValueChange={setCompletionNotifications}
                  disabled={!notificationsEnabled}
                  trackColor={{
                    false: colors.border,
                    true: colors.primary + "80",
                  }}
                  thumbColor={
                    completionNotifications ? colors.primary : colors.muted
                  }
                />
              }
            />
          </View>

          {/* Recording */}
          <SectionHeader title={t.settings.recording} />
          <View className="bg-surface rounded-2xl px-4 border border-border">
            <SettingRow
              icon="backup"
              title={t.settings.autoBackup}
              subtitle={
                language === "ar"
                  ? "نسخ التسجيلات تلقائياً للسحابة"
                  : language === "fr"
                    ? "Sauvegarder automatiquement"
                    : "Auto backup recordings to cloud"
              }
              right={
                <Switch
                  value={autoBackup}
                  onValueChange={setAutoBackup}
                  trackColor={{
                    false: colors.border,
                    true: colors.primary + "80",
                  }}
                  thumbColor={autoBackup ? colors.primary : colors.muted}
                />
              }
            />
            <SettingRow
              icon="hd"
              title={t.settings.highQualityDefault}
              subtitle={
                language === "ar"
                  ? "استخدام 4K افتراضياً"
                  : language === "fr"
                    ? "Utiliser 4K par défaut"
                    : "Use 4K resolution by default"
              }
              right={
                <Switch
                  value={highQualityDefault}
                  onValueChange={setHighQualityDefault}
                  trackColor={{
                    false: colors.border,
                    true: colors.primary + "80",
                  }}
                  thumbColor={
                    highQualityDefault ? colors.primary : colors.muted
                  }
                />
              }
            />
          </View>

          {/* Storage */}
          <SectionHeader title={t.settings.storage} />
          <View className="bg-surface rounded-2xl px-4 border border-border">
            <View className="py-3 border-b border-border">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-semibold text-foreground">
                  {t.settings.usedSpace}
                </Text>
                <Text className="text-sm font-bold text-primary">0 MB</Text>
              </View>
              <View className="bg-background rounded-full h-2 overflow-hidden">
                <View
                  className="bg-primary h-full rounded-full"
                  style={{ width: "5%" }}
                />
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className="text-xs text-muted">0 MB used</Text>
                <Text className="text-xs text-muted">
                  {t.settings.available}: 500 MB
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleClearCache}
              className="flex-row items-center gap-3 py-3"
            >
              <View
                className="w-9 h-9 rounded-lg items-center justify-center"
                style={{ backgroundColor: colors.warning + "20" }}
              >
                <MaterialIcons
                  name="cleaning-services"
                  size={20}
                  color={colors.warning}
                />
              </View>
              <Text className="flex-1 text-sm font-semibold text-foreground">
                {t.settings.clearCache}
              </Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
            </Pressable>
          </View>

          {/* Account */}
          <SectionHeader
            title={
              language === "ar"
                ? "الحساب"
                : language === "fr"
                  ? "Compte"
                  : "Account"
            }
          />
          <View className="bg-surface rounded-2xl px-4 border border-border">
            <Pressable
              onPress={() => router.push("/(tabs)/subscriptions")}
              className="flex-row items-center gap-3 py-3 border-b border-border"
            >
              <View
                className="w-9 h-9 rounded-lg items-center justify-center"
                style={{ backgroundColor: "#FFD700" + "20" }}
              >
                <MaterialIcons name="star" size={20} color="#FFD700" />
              </View>
              <Text className="flex-1 text-sm font-semibold text-foreground">
                {language === "ar"
                  ? "إدارة الاشتراك"
                  : language === "fr"
                    ? "Gérer l'abonnement"
                    : "Manage Subscription"}
              </Text>
              <View className="bg-primary/20 px-2 py-1 rounded-full">
                <Text className="text-xs font-semibold text-primary">Free</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => router.push("/(tabs)/payment")}
              className="flex-row items-center gap-3 py-3 border-b border-border"
            >
              <View
                className="w-9 h-9 rounded-lg items-center justify-center"
                style={{ backgroundColor: colors.success + "20" }}
              >
                <MaterialIcons
                  name="credit-card"
                  size={20}
                  color={colors.success}
                />
              </View>
              <Text className="flex-1 text-sm font-semibold text-foreground">
                {language === "ar"
                  ? "طرق الدفع"
                  : language === "fr"
                    ? "Méthodes de paiement"
                    : "Payment Methods"}
              </Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => router.push("/(tabs)/customer-support")}
              className="flex-row items-center gap-3 py-3"
            >
              <View
                className="w-9 h-9 rounded-lg items-center justify-center"
                style={{ backgroundColor: colors.error + "20" }}
              >
                <MaterialIcons
                  name="support-agent"
                  size={20}
                  color={colors.error}
                />
              </View>
              <Text className="flex-1 text-sm font-semibold text-foreground">
                {language === "ar"
                  ? "الدعم الفني"
                  : language === "fr"
                    ? "Support technique"
                    : "Technical Support"}
              </Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
            </Pressable>
          </View>

          {/* About */}
          <SectionHeader title={t.settings.about} />
          <View className="bg-surface rounded-2xl px-4 border border-border">
            <View className="py-3 border-b border-border flex-row justify-between items-center">
              <Text className="text-sm text-muted">{t.settings.appName}</Text>
              <Text className="text-sm font-semibold text-foreground">
                Knoux Nexar Pro
              </Text>
            </View>
            <View className="py-3 border-b border-border flex-row justify-between items-center">
              <Text className="text-sm text-muted">{t.settings.version}</Text>
              <Text className="text-sm font-semibold text-foreground">
                2.0.0
              </Text>
            </View>
            <View className="py-3 border-b border-border flex-row justify-between items-center">
              <Text className="text-sm text-muted">{t.settings.developer}</Text>
              <Text className="text-sm font-semibold text-foreground">
                م. صادق الجزار
              </Text>
            </View>

            <Pressable
              onPress={() =>
                Linking.openURL("mailto:contact@knoux.io?subject=Feedback")
              }
              className="flex-row items-center gap-3 py-3 border-b border-border"
            >
              <Text className="flex-1 text-sm text-muted">
                {language === "ar"
                  ? "إرسال ملاحظات"
                  : language === "fr"
                    ? "Envoyer des commentaires"
                    : "Send Feedback"}
              </Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() =>
                Linking.openURL(
                  "https://wa.me/971503281920?text=Privacy%20Policy"
                )
              }
              className="flex-row items-center gap-3 py-3"
            >
              <Text className="flex-1 text-sm text-muted">
                {language === "ar"
                  ? "سياسة الخصوصية"
                  : language === "fr"
                    ? "Politique de confidentialité"
                    : "Privacy Policy"}
              </Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
            </Pressable>
          </View>

          {/* Reset */}
          <Pressable
            onPress={handleResetSettings}
            className="bg-error/10 border border-error rounded-2xl p-4 items-center mt-2 active:opacity-70"
          >
            <Text className="text-base font-semibold text-error">
              {t.settings.resetSettings}
            </Text>
          </Pressable>

          <Text className="text-center text-xs text-muted mt-2">
            Knoux Nexar Pro v2.0.0 © 2025 Knoux.io
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
