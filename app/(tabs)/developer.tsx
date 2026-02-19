// Copyright © Knoux. All rights reserved.
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Linking,
  Image,
  StatusBar,
  Dimensions,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/language-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SocialLink {
  icon: string;
  label: string;
  handle: string;
  url: string;
  color: string;
  bg: string;
}

interface Skill {
  name: string;
  level: number;
  icon: string;
}

export default function DeveloperScreen() {
  const { t, language } = useLanguage();
  const colors = useColors();
  const [pressedLink, setPressedLink] = useState<string | null>(null);

  const label = (ar: string, en: string) => (language === "ar" ? ar : en);

  const socialLinks: SocialLink[] = [
    {
      icon: "language",
      label: "Twitter / X",
      handle: "@knoux7",
      url: "https://twitter.com/knoux7",
      color: "#FFFFFF",
      bg: "#000000",
    },
    {
      icon: "people",
      label: "Facebook",
      handle: "knoux",
      url: "https://www.facebook.com/share/1bXebP7S7D/",
      color: "#FFFFFF",
      bg: "#1877F2",
    },
    {
      icon: "image",
      label: "Pinterest",
      handle: "knoux7",
      url: "https://www.pinterest.com/knoux7",
      color: "#FFFFFF",
      bg: "#E60023",
    },
    {
      icon: "music-note",
      label: "TikTok",
      handle: "@knoux_7",
      url: "https://www.tiktok.com/@knoux_7",
      color: "#FFFFFF",
      bg: "#010101",
    },
    {
      icon: "camera-alt",
      label: "Snapchat",
      handle: "knooux7",
      url: "https://www.snapchat.com/add/knooux7",
      color: "#000000",
      bg: "#FFFC00",
    },
    {
      icon: "chat",
      label: "WhatsApp",
      handle: "+971 503281920",
      url: "https://wa.me/971503281920",
      color: "#FFFFFF",
      bg: "#25D366",
    },
    {
      icon: "email",
      label: "Email",
      handle: "contact@knoux.io",
      url: "mailto:contact@knoux.io",
      color: "#FFFFFF",
      bg: "#0a7ea4",
    },
  ];

  const skills: Skill[] = [
    { name: "PowerShell & Automation", level: 95, icon: "terminal" },
    { name: "UI / UX Design", level: 92, icon: "design-services" },
    { name: "AI Integration", level: 90, icon: "auto-awesome" },
    { name: "Cybersecurity", level: 88, icon: "security" },
    { name: "React Native", level: 87, icon: "phone-android" },
    { name: "Performance Tuning", level: 93, icon: "speed" },
    { name: "GUI Development", level: 91, icon: "laptop" },
    { name: "Cloud & DevOps", level: 82, icon: "cloud" },
  ];

  const projects = [
    {
      name: "Knoux Nexar Pro",
      desc: label("مجموعة الوسائط الاحترافية", "Professional Media Suite"),
      icon: "videocam",
      color: "#0a7ea4",
    },
    {
      name: "Knoux7-Core",
      desc: label("نظام التحكم المركزي", "Central Control System"),
      icon: "developer-board",
      color: "#9370DB",
    },
    {
      name: "NEXAR AI Engine",
      desc: label("محرك الذكاء الاصطناعي", "AI Processing Engine"),
      icon: "psychology",
      color: "#FF1493",
    },
    {
      name: "KnouxCrypt",
      desc: label("نظام التشفير المتقدم", "Advanced Encryption System"),
      icon: "lock",
      color: "#22c55e",
    },
  ];

  const handleOpenLink = async (url: string, key: string) => {
    setPressedLink(key);
    setTimeout(() => setPressedLink(null), 500);
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
    } catch {}
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ====== HERO HEADER ====== */}
        <View
          style={{
            width: "100%",
            height: 340,
            backgroundColor: "#050510",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: 28,
            borderBottomWidth: 1,
            borderBottomColor: "#0a7ea420",
          }}
        >
          {/* Glow background */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#000000",
            }}
          />
          <View
            style={{
              position: "absolute",
              width: 280,
              height: 280,
              borderRadius: 140,
              backgroundColor: "#0a7ea415",
              top: "10%",
              alignSelf: "center",
            }}
          />

          {/* Developer Photo */}
          <View
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              borderWidth: 2,
              borderColor: "#0a7ea4",
              marginBottom: 16,
              overflow: "hidden",
              shadowColor: "#0a7ea4",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 20,
              elevation: 20,
            }}
          >
            <Image
              source={require("@/assets/images/developer-photo.jpg")}
              style={{ width: "100%", height: "100%", borderRadius: 55 }}
              resizeMode="cover"
            />
          </View>

          {/* Name */}
          <Text
            style={{
              fontSize: 26,
              fontWeight: "900",
              color: "#FFFFFF",
              letterSpacing: 2,
              textAlign: "center",
            }}
          >
            KNOUX
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#0a7ea4",
              marginTop: 2,
              letterSpacing: 1,
              textAlign: "center",
            }}
          >
            أبو ريتاج
          </Text>

          {/* Role badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
              backgroundColor: "#0a7ea420",
              borderWidth: 1,
              borderColor: "#0a7ea450",
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
              gap: 6,
            }}
          >
            <MaterialIcons name="star" size={14} color="#0a7ea4" />
            <Text style={{ color: "#0a7ea4", fontSize: 12, fontWeight: "700" }}>
              Eng. Sadek Elgazar — Founder & Lead Developer
            </Text>
          </View>

          {/* Location & Device */}
          <View
            style={{
              flexDirection: "row",
              gap: 16,
              marginTop: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <MaterialIcons name="location-on" size={13} color="#666" />
              <Text style={{ color: "#666", fontSize: 12 }}>Abu Dhabi, UAE</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <MaterialIcons name="devices" size={13} color="#666" />
              <Text style={{ color: "#666", fontSize: 12 }}>Knoux7-Core</Text>
            </View>
          </View>
        </View>

        {/* ====== BODY ====== */}
        <View style={{ padding: 20, gap: 28 }}>

          {/* About */}
          <View
            style={{
              backgroundColor: "#0a0a14",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#0a7ea420",
              gap: 10,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <MaterialIcons name="person" size={18} color="#0a7ea4" />
              <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>
                {label("عن المطور", "About")}
              </Text>
            </View>
            <Text style={{ color: "#999", fontSize: 13, lineHeight: 22 }}>
              {label(
                "مطور ذكي بنكهة فنية. يجمع بين البرمجة والأتمتة والذكاء الاصطناعي والأمن السيبراني وتصميم واجهات المستخدم الحديثة مع التعبير الإبداعي.",
                "Smart developer with an artistic flavor. Combining programming, automation, AI, cybersecurity, and modern UI/UX design with creative expression. Founder of the Knoux ecosystem."
              )}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
              {["Adaptive", "Professional", "Performance-Aware", "Creative"].map((tag) => (
                <View
                  key={tag}
                  style={{
                    backgroundColor: "#0a7ea415",
                    borderWidth: 1,
                    borderColor: "#0a7ea430",
                    borderRadius: 12,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ color: "#0a7ea4", fontSize: 11 }}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Skills */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <MaterialIcons name="code" size={18} color="#0a7ea4" />
              <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>
                {label("المهارات التقنية", "Core Skills")}
              </Text>
            </View>
            <View style={{ gap: 10 }}>
              {skills.map((skill) => (
                <View key={skill.name}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <MaterialIcons name={skill.icon as any} size={15} color="#0a7ea4" />
                      <Text style={{ color: "#CCC", fontSize: 13 }}>{skill.name}</Text>
                    </View>
                    <Text style={{ color: "#0a7ea4", fontSize: 12, fontWeight: "700" }}>
                      {skill.level}%
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: "#111",
                      borderRadius: 4,
                      height: 4,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        width: `${skill.level}%`,
                        height: "100%",
                        backgroundColor: "#0a7ea4",
                        borderRadius: 4,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Projects */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <MaterialIcons name="rocket-launch" size={18} color="#0a7ea4" />
              <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>
                {label("المشاريع", "Projects")}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {projects.map((project) => (
                <View
                  key={project.name}
                  style={{
                    width: (SCREEN_WIDTH - 50) / 2,
                    backgroundColor: "#0a0a14",
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: project.color + "30",
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: project.color + "20",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialIcons name={project.icon as any} size={22} color={project.color} />
                  </View>
                  <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>
                    {project.name}
                  </Text>
                  <Text style={{ color: "#666", fontSize: 11 }}>{project.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* NEXAR App Info */}
          <View
            style={{
              backgroundColor: "#050515",
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: "#0a7ea430",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Image
              source={require("@/assets/images/app-icon.png")}
              style={{ width: 80, height: 80, borderRadius: 18 }}
            />
            <View style={{ alignItems: "center", gap: 4 }}>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 22,
                  fontWeight: "900",
                  letterSpacing: 3,
                }}
              >
                KNOUX NEXAR
              </Text>
              <Text style={{ color: "#0a7ea4", fontSize: 12, letterSpacing: 1 }}>
                {label("مجموعة الوسائط الاحترافية", "Professional Media Suite")}
              </Text>
              <Text style={{ color: "#555", fontSize: 11, marginTop: 2 }}>
                Version 2.0.0 • Built by Sadek Elgazar
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "#0a7ea420",
                borderWidth: 1,
                borderColor: "#0a7ea440",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: "#0a7ea4", fontSize: 12 }}>
                "Intelligence Beyond Limits"
              </Text>
            </View>
          </View>

          {/* Social Links */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <MaterialIcons name="share" size={18} color="#0a7ea4" />
              <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>
                {label("تواصل معي", "Connect With Me")}
              </Text>
            </View>
            <View style={{ gap: 10 }}>
              {socialLinks.map((link) => (
                <Pressable
                  key={link.label}
                  onPress={() => handleOpenLink(link.url, link.label)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    backgroundColor: pressed || pressedLink === link.label
                      ? "#0a0a20"
                      : "#0a0a14",
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: pressedLink === link.label ? "#0a7ea4" : "#1a1a2a",
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: link.bg,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MaterialIcons name={link.icon as any} size={22} color={link.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>
                      {link.label}
                    </Text>
                    <Text style={{ color: "#555", fontSize: 12, marginTop: 2 }}>
                      {link.handle}
                    </Text>
                  </View>
                  <MaterialIcons name="arrow-forward-ios" size={14} color="#333" />
                </Pressable>
              ))}
            </View>
          </View>

          {/* CTA Buttons */}
          <View style={{ gap: 10 }}>
            <Pressable
              onPress={() => handleOpenLink("mailto:contact@knoux.io", "cta-email")}
              style={({ pressed }) => ({
                backgroundColor: "#0a7ea4",
                borderRadius: 14,
                padding: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 10,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <MaterialIcons name="email" size={20} color="#FFF" />
              <Text style={{ color: "#FFF", fontSize: 15, fontWeight: "700" }}>
                {label("تواصل مع المطور", "Contact Developer")}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleOpenLink("https://wa.me/971503281920", "cta-wa")}
              style={({ pressed }) => ({
                backgroundColor: "#25D366",
                borderRadius: 14,
                padding: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 10,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <MaterialIcons name="chat" size={20} color="#FFF" />
              <Text style={{ color: "#FFF", fontSize: 15, fontWeight: "700" }}>
                WhatsApp Direct
              </Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={{ alignItems: "center", paddingVertical: 20, gap: 4 }}>
            <Text style={{ color: "#333", fontSize: 12 }}>
              © 2025 Knoux.io — All Rights Reserved
            </Text>
            <Text style={{ color: "#222", fontSize: 11 }}>
              Built with 💙 in Abu Dhabi, UAE
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
