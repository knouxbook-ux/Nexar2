// Copyright © Knoux. All rights reserved.
/**
 * KNOUX NEXAR PRO — Ultimate Merged Tabs Layout v3.0
 * 6 visible tabs + all hidden screens accessible from Home/NEXAR dashboard
 */
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useLanguage } from "@/lib/language-context";

export default function TabLayout() {
  const colors = useColors();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 62 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#A78BFA",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: "#0a0a0f",
          borderTopColor: "#27272a",
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      {/* ─── 6 Visible Tabs ─────────────────────────────────── */}
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.home,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nexar-dashboard"
        options={{
          title: "NEXAR",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>⚡</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="nexar-retouch"
        options={{
          title: "Retouch",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>🎨</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="screen-recording"
        options={{
          title: t.tabs.recording,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="video.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pro-services"
        options={{
          title: "Services",
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 22, color }}>⭐</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.tabs.settings,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="gearshape.fill" color={color} />
          ),
        }}
      />

      {/* ─── Hidden Screens — COMPLETE LIST ─── */}
      {/* Core Features */}
      <Tabs.Screen name="audio-recording"         options={{ href: null }} />
      <Tabs.Screen name="video-editing"           options={{ href: null }} />
      <Tabs.Screen name="cloud-sync"              options={{ href: null }} />
      <Tabs.Screen name="ai-features"             options={{ href: null }} />
      <Tabs.Screen name="face-retouching"         options={{ href: null }} />
      <Tabs.Screen name="effects"                 options={{ href: null }} />
      <Tabs.Screen name="streaming"               options={{ href: null }} />
      <Tabs.Screen name="multi-camera"            options={{ href: null }} />

      {/* Advanced Studio Screens (from nexar-pro) */}
      <Tabs.Screen name="ai-studio"               options={{ href: null }} />
      <Tabs.Screen name="editor-studio"           options={{ href: null }} />
      <Tabs.Screen name="multicam-studio"         options={{ href: null }} />
      <Tabs.Screen name="audio-studio"            options={{ href: null }} />
      <Tabs.Screen name="advanced-recording"      options={{ href: null }} />

      {/* Social & Engagement */}
      <Tabs.Screen name="live-chat"               options={{ href: null }} />
      <Tabs.Screen name="chat"                    options={{ href: null }} />
      <Tabs.Screen name="referrals"               options={{ href: null }} />
      <Tabs.Screen name="ratings-reviews"         options={{ href: null }} />

      {/* Business & Monetization */}
      <Tabs.Screen name="subscriptions"           options={{ href: null }} />
      <Tabs.Screen name="payment"                 options={{ href: null }} />
      <Tabs.Screen name="license-keys"            options={{ href: null }} />

      {/* Analytics & Monitoring */}
      <Tabs.Screen name="analytics"               options={{ href: null }} />
      <Tabs.Screen name="notifications-advanced"  options={{ href: null }} />

      {/* Beauty & AI */}
      <Tabs.Screen name="beauty-makeup"           options={{ href: null }} />
      <Tabs.Screen name="gesture-control"         options={{ href: null }} />

      {/* Admin & Developer */}
      <Tabs.Screen name="admin-dashboard"         options={{ href: null }} />
      <Tabs.Screen name="developer"               options={{ href: null }} />
      <Tabs.Screen name="customer-support"        options={{ href: null }} />
    </Tabs>
  );
}
