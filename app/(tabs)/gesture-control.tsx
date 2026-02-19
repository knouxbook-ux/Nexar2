// Copyright © Knoux. All rights reserved.
import { ScrollView, Text, View, Pressable, Switch, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/language-context";
import { useState, useEffect } from "react";
import { GestureControlService, GestureType } from "@/lib/services/gesture-control-service";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";

export default function GestureControlScreen() {
  const { t, language } = useLanguage();
  const colors = useColors();
  const [isActive, setIsActive] = useState(false);
  const [sensitivity, setSensitivity] = useState(50);
  const [lastGesture, setLastGesture] = useState<GestureType | null>(null);
  const [gestureCount, setGestureCount] = useState(0);
  const [enabledGestures, setEnabledGestures] = useState<Set<GestureType>>(
    new Set(['thumbsUp', 'thumbsDown', 'peace', 'openPalm', 'fist', 'wave'])
  );

  const availableGestures = [
    { type: 'thumbsUp' as GestureType, name: 'إعجاب', icon: 'thumb-up', color: '#4CAF50', action: 'بدء التسجيل' },
    { type: 'thumbsDown' as GestureType, name: 'عدم إعجاب', icon: 'thumb-down', color: '#F44336', action: 'إيقاف التسجيل' },
    { type: 'peace' as GestureType, name: 'علامة السلام', icon: 'check', color: '#2196F3', action: 'التقاط صورة' },
    { type: 'openPalm' as GestureType, name: 'كف مفتوح', icon: 'pan-tool', color: '#FF9800', action: 'إيقاف مؤقت' },
    { type: 'fist' as GestureType, name: 'قبضة', icon: 'sports-mma', color: '#9C27B0', action: 'زووم' },
    { type: 'wave' as GestureType, name: 'تلويح', icon: 'waving-hand', color: '#00BCD4', action: 'تبديل الكاميرا' },
    { type: 'pointUp' as GestureType, name: 'إشارة للأعلى', icon: 'arrow-upward', color: '#FFEB3B', action: 'زيادة السرعة' },
    { type: 'pointDown' as GestureType, name: 'إشارة للأسفل', icon: 'arrow-downward', color: '#795548', action: 'تقليل السرعة' },
  ];

  useEffect(() => {
    const handleGesture = (gesture: GestureType) => {
      setLastGesture(gesture);
      setGestureCount(prev => prev + 1);
    };

    if (isActive) {
      GestureControlService.on('gestureDetected', handleGesture);
      GestureControlService.startDetection({ 
        sensitivity: sensitivity / 100,
        enabledGestures: Array.from(enabledGestures)
      });
    }

    return () => {
      GestureControlService.off('gestureDetected', handleGesture);
      if (isActive) {
        GestureControlService.stopDetection();
      }
    };
  }, [isActive, sensitivity, enabledGestures]);

  const toggleGesture = (gesture: GestureType) => {
    setEnabledGestures(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gesture)) {
        newSet.delete(gesture);
      } else {
        newSet.add(gesture);
      }
      return newSet;
    });
  };

  const handleToggleSystem = async () => {
    if (!isActive) {
      try {
        await GestureControlService.startDetection({
          sensitivity: sensitivity / 100,
          enabledGestures: Array.from(enabledGestures)
        });
        setIsActive(true);
      } catch (error) {
        console.error('Failed to start gesture detection:', error);
      }
    } else {
      await GestureControlService.stopDetection();
      setIsActive(false);
    }
  };

  const getGestureInfo = (type: GestureType) => {
    return availableGestures.find(g => g.type === type);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6 pb-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">التحكم بالإيماءات</Text>
            <Text className="text-base text-muted">
              تحكم بالتطبيق باستخدام إيماءات اليد
            </Text>
          </View>

          {/* Status Card */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-sm text-muted mb-1">حالة النظام</Text>
                <Text className={`text-lg font-bold ${isActive ? 'text-primary' : 'text-muted'}`}>
                  {isActive ? 'نشط' : 'متوقف'}
                </Text>
              </View>
              <Switch value={isActive} onValueChange={handleToggleSystem} />
            </View>

            {isActive && (
              <View className="bg-background rounded-xl p-4 mb-4">
                <View className="flex-row items-center gap-2 mb-2">
                  <View className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  <Text className="text-sm text-muted">جاهز للاستماع</Text>
                </View>
              </View>
            )}

            <View className="flex-row gap-4">
              <View className="flex-1 bg-background rounded-lg p-3">
                <Text className="text-xs text-muted mb-1">آخر إيماءة</Text>
                <Text className="text-base font-semibold text-foreground">
                  {lastGesture ? getGestureInfo(lastGesture)?.name : '-'}
                </Text>
              </View>
              <View className="flex-1 bg-background rounded-lg p-3">
                <Text className="text-xs text-muted mb-1">عدد الإيماءات</Text>
                <Text className="text-base font-semibold text-foreground">
                  {gestureCount}
                </Text>
              </View>
            </View>
          </View>

          {/* Sensitivity Control */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-semibold text-foreground">حساسية الكشف</Text>
              <Text className="text-primary font-bold">{sensitivity}%</Text>
            </View>
            <View className="flex-row gap-2">
              {[0, 25, 50, 75, 100].map((value) => (
                <Pressable
                  key={value}
                  onPress={() => setSensitivity(value)}
                  disabled={isActive}
                  className={`flex-1 py-2 rounded-lg ${
                    sensitivity === value ? 'bg-primary' : 'bg-background'
                  } ${isActive ? 'opacity-50' : ''}`}
                >
                  <Text
                    className={`text-center text-sm font-medium ${
                      sensitivity === value ? 'text-background' : 'text-foreground'
                    }`}
                  >
                    {value}%
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text className="text-xs text-muted">
              {sensitivity < 30 ? '⚠️ حساسية منخفضة - قد لا يتم اكتشاف بعض الإيماءات' :
               sensitivity > 70 ? '⚠️ حساسية عالية - قد يحدث اكتشاف خاطئ' :
               '✅ حساسية متوازنة - موصى بها'}
            </Text>
          </View>

          {/* Available Gestures */}
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-foreground">الإيماءات المتاحة</Text>
              <Text className="text-xs text-muted">{enabledGestures.size}/8 نشط</Text>
            </View>
            <View className="gap-3">
              {availableGestures.map((gesture) => (
                <Pressable
                  key={gesture.type}
                  onPress={() => toggleGesture(gesture.type)}
                  disabled={isActive}
                  className={`bg-surface rounded-2xl p-4 border-2 ${
                    enabledGestures.has(gesture.type) ? 'border-primary' : 'border-border'
                  } ${isActive ? 'opacity-50' : ''}`}
                >
                  <View className="flex-row items-center gap-4">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{ backgroundColor: gesture.color + '20' }}
                    >
                      <MaterialIcons name={gesture.icon as any} size={24} color={gesture.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        {gesture.name}
                      </Text>
                      <Text className="text-xs text-muted mt-1">
                        {gesture.action}
                      </Text>
                    </View>
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        enabledGestures.has(gesture.type)
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}
                    >
                      {enabledGestures.has(gesture.type) && (
                        <MaterialIcons name="check" size={16} color="white" />
                      )}
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Advanced Features */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <Text className="text-lg font-semibold text-foreground">الميزات المتقدمة</Text>
            <View className="gap-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base text-foreground">تأكيد الإيماءة</Text>
                  <Text className="text-xs text-muted mt-1">
                    تطلب تأكيد قبل تنفيذ الإجراء
                  </Text>
                </View>
                <Switch value={false} />
              </View>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base text-foreground">تتبع اليدين</Text>
                  <Text className="text-xs text-muted mt-1">
                    تتبع حركة اليد في الوقت الفعلي
                  </Text>
                </View>
                <Switch value={true} />
              </View>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base text-foreground">إيماءات مخصصة</Text>
                  <Text className="text-xs text-muted mt-1">
                    إنشاء إيماءات خاصة بك
                  </Text>
                </View>
                <Switch value={false} />
              </View>
            </View>
          </View>

          {/* Statistics */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <Text className="text-lg font-semibold text-foreground">الإحصائيات</Text>
            <View className="flex-row flex-wrap gap-3">
              <View className="flex-1 min-w-[45%] bg-background rounded-lg p-3">
                <Text className="text-xs text-muted mb-1">نسبة الدقة</Text>
                <Text className="text-2xl font-bold text-primary">98.5%</Text>
              </View>
              <View className="flex-1 min-w-[45%] bg-background rounded-lg p-3">
                <Text className="text-xs text-muted mb-1">زمن الاستجابة</Text>
                <Text className="text-2xl font-bold text-primary">45ms</Text>
              </View>
              <View className="flex-1 min-w-[45%] bg-background rounded-lg p-3">
                <Text className="text-xs text-muted mb-1">الإيماءات الناجحة</Text>
                <Text className="text-2xl font-bold text-primary">{gestureCount}</Text>
              </View>
              <View className="flex-1 min-w-[45%] bg-background rounded-lg p-3">
                <Text className="text-xs text-muted mb-1">معدل الخطأ</Text>
                <Text className="text-2xl font-bold text-primary">1.5%</Text>
              </View>
            </View>
          </View>

          {/* Tips */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="tips-and-updates" size={20} color={colors.primary} />
              <Text className="text-base font-semibold text-foreground">نصائح للاستخدام</Text>
            </View>
            <View className="gap-2">
              {[
                'تأكد من وجود إضاءة كافية للحصول على أفضل النتائج',
                'ضع يدك أمام الكاميرا بشكل واضح',
                'احرص على عدم تحريك يدك بسرعة كبيرة',
                'جرب الإيماءات في بيئة هادئة أولاً',
                'اضبط الحساسية حسب احتياجاتك',
              ].map((tip, i) => (
                <View key={i} className="flex-row gap-2">
                  <Text className="text-primary">•</Text>
                  <Text className="flex-1 text-sm text-muted">{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
