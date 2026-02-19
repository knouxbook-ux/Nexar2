// Copyright © Knoux. All rights reserved.
import { ScrollView, Text, View, Pressable, Switch } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useEffect } from "react";
import { cloudSyncService, SyncStatus } from "@/lib/services/cloud-sync-service";
import { useLanguage } from "@/lib/language-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";

export default function CloudSyncScreen() {
  const colors = useColors();
  const { t } = useLanguage();
  const [status, setStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    syncedFiles: 0,
    totalFiles: 0,
    storageUsed: 0,
    encryptionEnabled: true,
  });
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(30);

  useEffect(() => {
    const initialStatus = cloudSyncService.getStatus();
    setStatus(initialStatus);

    const statusListener = (newStatus: SyncStatus) => {
      setStatus(newStatus);
    };

    cloudSyncService.on("syncCompleted", statusListener);
    cloudSyncService.on("syncFailed", statusListener);

    return () => {
      cloudSyncService.off("syncCompleted", statusListener);
      cloudSyncService.off("syncFailed", statusListener);
    };
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return t.cloudSync.never;
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const handleStartSync = async () => {
    try {
      await cloudSyncService.startSync();
    } catch (error) {
      console.error("Sync failed:", error);
    }
  };

  const handleUpdateOptions = async () => {
    await cloudSyncService.updateSyncOptions({
      autoSync,
      syncInterval,
    });
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">{t.cloudSync.title}</Text>
            <Text className="text-base text-muted">{t.cloudSync.subtitle}</Text>
          </View>

          {/* Status Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">{t.cloudSync.syncStatus}</Text>
              {status.isSyncing ? (
                <View className="flex-row items-center gap-2">
                  <View className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  <Text className="text-sm font-semibold text-primary">{t.cloudSync.syncing}</Text>
                </View>
              ) : (
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="check-circle" size={20} color={colors.success} />
                  <Text className="text-sm font-semibold text-success">{t.cloudSync.ready}</Text>
                </View>
              )}
            </View>

            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">{t.cloudSync.lastSync}</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {formatDate(status.lastSyncTime)}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">{t.cloudSync.storageUsed}</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {formatFileSize(status.storageUsed)}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">{t.cloudSync.filesSynced}</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {status.syncedFiles} / {status.totalFiles}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">{t.cloudSync.encryption}</Text>
                <View className="flex-row items-center gap-1">
                  <MaterialIcons
                    name="lock"
                    size={16}
                    color={status.encryptionEnabled ? colors.success : colors.error}
                  />
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color: status.encryptionEnabled ? colors.success : colors.error,
                    }}
                  >
                    {status.encryptionEnabled ? t.cloudSync.enabled : t.cloudSync.disabled}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Settings */}
          <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
            <Text className="text-lg font-semibold text-foreground">{t.cloudSync.settings}</Text>

            {/* Auto Sync Toggle */}
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted">{t.cloudSync.autoSync}</Text>
              <Switch
                value={autoSync}
                onValueChange={(value) => {
                  setAutoSync(value);
                  handleUpdateOptions();
                }}
                disabled={status.isSyncing}
              />
            </View>

            {/* Sync Interval */}
            {autoSync && (
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">{t.cloudSync.syncInterval}</Text>
                  <Text className="text-sm font-semibold text-foreground">{syncInterval} min</Text>
                </View>
                <View className="flex-row gap-2">
                  {[15, 30, 60, 120].map((interval) => (
                    <Pressable
                      key={interval}
                      onPress={() => {
                        setSyncInterval(interval);
                        cloudSyncService.updateSyncOptions({ syncInterval: interval });
                      }}
                      className={`flex-1 py-2 px-2 rounded-lg border ${
                        syncInterval === interval
                          ? "bg-primary border-primary"
                          : "bg-background border-border"
                      }`}
                      disabled={status.isSyncing}
                    >
                      <Text
                        className={`text-center text-xs font-semibold ${
                          syncInterval === interval ? "text-background" : "text-foreground"
                        }`}
                      >
                        {interval}m
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <Pressable
              onPress={handleStartSync}
              disabled={status.isSyncing}
              className={`py-4 px-6 rounded-full flex-row items-center justify-center gap-2 ${
                status.isSyncing ? "bg-muted" : "bg-primary active:opacity-80"
              }`}
            >
              <MaterialIcons
                name="cloud-upload"
                size={20}
                color={colors.background}
              />
              <Text className="text-center text-base font-semibold text-background">
                {status.isSyncing ? t.cloudSync.syncing : t.cloudSync.syncNow}
              </Text>
            </Pressable>
          </View>

          {/* Info Card */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <View className="flex-row gap-3">
              <MaterialIcons name="info" size={20} color={colors.primary} />
              <Text className="flex-1 text-xs text-muted leading-relaxed">
                {t.cloudSync.info}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
