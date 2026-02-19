# 🔗 دليل التكامل البرمجي — Nexar Pro v3.0

## البنية الجديدة: NexarCore

```
┌─────────────────────────────────────────────────────────┐
│                    NEXAR CORE v3.0                      │
│                                                         │
│  EventBus ──── يربط جميع الأحداث بين الخدمات           │
│  SessionManager ── يتتبع الجلسات الحية                  │
│  FeatureGuard ── يتحكم في وصول المميزات                 │
│  NexarState ── الحالة العامة المشتركة                   │
└─────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│                  NEXAR BRIDGE                           │
│  يربط الخدمات المستقلة بـ NexarCore:                   │
│  • ScreenRecordingService → recording:started/stopped   │
│  • AudioRecordingService → audio:recorded               │
│  • StreamingService → stream:started/stopped            │
│  • CloudService → cloud:uploadComplete                  │
└─────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│               USE-NEXAR-STATE HOOK                      │
│  يُستخدم في كل شاشة للحصول على:                        │
│  • isRecording, isStreaming (حالة حية)                  │
│  • subscription (خطة المستخدم الحالية)                  │
│  • unreadNotifications (إشعارات غير مقروءة)             │
│  • canUse(featureId) (فحص صلاحية الميزة)               │
└─────────────────────────────────────────────────────────┘
```

## الأحداث المتاحة (Event Bus)

| الحدث | يُطلق عند | البيانات |
|-------|-----------|---------|
| `recording:started` | بدء التسجيل | resolution, frameRate |
| `recording:stopped` | إيقاف التسجيل | duration, fileSize |
| `stream:started` | بدء البث | platform |
| `stream:stopped` | إيقاف البث | duration |
| `stream:viewerUpdate` | تحديث المشاهدين | count |
| `subscription:upgraded` | ترقية الاشتراك | plan |
| `auth:loggedIn` | تسجيل الدخول | userId, name, plan |
| `auth:loggedOut` | تسجيل الخروج | - |
| `retouch:applied` | تطبيق ريتوش | servicesCount |
| `notification:new` | إشعار جديد | title, body |
| `cloud:uploadComplete` | رفع ملف | fileName, fileSize |
| `analytics:sessionTrack` | تتبع جلسة | type, duration |

## نظام حماية الميزات (FeatureGuard)

```typescript
// فحص ميزة في أي شاشة
const { canUse, checkFeature } = useNexarState();

// بسيط
if (!canUse('recording.4K')) {
  router.push('/(tabs)/subscriptions');
}

// تفصيلي
const access = checkFeature('streaming.youtube');
if (!access.allowed) {
  Alert.alert(`Requires ${access.requiredPlan} plan`);
}
```

## الميزات المحمية

| الميزة | الخطة المطلوبة |
|--------|---------------|
| `recording.4K` | Pro |
| `recording.8K` | Premium |
| `streaming.youtube` | Pro |
| `ai.subtitles` | Pro |
| `ai.highlights` | Premium |
| `retouch.full85` | Pro |
| `multiCamera` | Premium |
| `cloud.unlimited` | Premium |

## التكامل مع الشاشات

كل شاشة يجب أن تبدأ بـ:
```typescript
import { useNexarState } from '@/hooks/use-nexar-state';
const nexar = useNexarState();
```

للتفاعل مع الأحداث:
```typescript
import { nexarEvents } from '@/lib/nexar/NexarCore';
nexarEvents.emit('recording:started', { resolution: '4K' });
```

## التسجيل في _layout.tsx

```typescript
import { NexarCore } from "@/lib/nexar/NexarCore";
import { initNexarBridge } from "@/lib/nexar/NexarBridge";

useEffect(() => {
  NexarCore.initialize(); // ← تهيئة الحالة العامة
  initNexarBridge();      // ← ربط جميع الخدمات
}, []);
```
