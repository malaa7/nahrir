# نَحْرِير - Nahrir Desktop Application

<div dir="rtl">

## 🎯 نبذة عن التطبيق

**نَحْرِير** هو مساعد شخصي ذكي مصمم خصيصاً لمعلمي الأونلاين، صُنّاع المحتوى، المستقلين، والمهنيين. يساعدك على إدارة الوقت، الملاحظات، والأدوات اليومية من واجهة واحدة بسيطة واحترافية.

## ✨ المزايا

### المزايا الأساسية
- 💱 **تحويل العملات**: تحويل فوري للعملات العالمية مع حفظ المفضلة
- 🌍 **الساعة العالمية**: عرض التوقيت المحلي لعدة مدن حول العالم
- ⏱️ **المؤقت الزمني**: ساعة إيقاف وعد تنازلي مع إشعارات سطح المكتب
- 📝 **دفتر الملاحظات**: نظام ملاحظات سريع مع بحث وتصنيف
- 🕌 **مواقيت الصلاة**: عرض دقيق لمواقيت الصلاة حسب الموقع

### المزايا الإضافية
- ✅ **إدارة المهام**: قوائم مهام يومية وأسبوعية
- 🎯 **وضع التركيز**: مؤقت بومودورو مع إحصائيات
- 📅 **التقويم الذكي**: إدارة المواعيد والأحداث
- 🔗 **روابط سريعة**: وصول سريع لحصص Zoom/Meet
- ⚙️ **إعدادات متقدمة**: تخصيص كامل للواجهة واللغة

## 🌍 اللغات المدعومة

- **العربية** (افتراضي) - واجهة RTL كاملة
- **English** - واجهة LTR كاملة
- التبديل الفوري بين اللغتين دون إعادة تشغيل

## 🚀 التشغيل

### متطلبات التشغيل
- Node.js 18 أو أحدث
- npm أو yarn

### خطوات التثبيت

```bash
# تثبيت الحزم
npm install

# تشغيل في وضع التطوير
npm run dev

# بناء التطبيق
npm run build

# إنشاء نسخة قابلة للتوزيع
npm run dist
```

### التشغيل على أنظمة مختلفة

```bash
# Windows
npm run dist:win

# macOS
npm run dist:mac

# Linux
npm run dist:linux
```

## 🎨 المزايا التقنية

- **Electron** - تطبيق سطح مكتب متعدد المنصات
- **React** - واجهة مستخدم حديثة وسريعة
- **Vite** - أداة بناء سريعة ومحسّنة
- **RTL/LTR** - دعم كامل للعربية والإنجليزية
- **Dark/Light Mode** - أوضاع داكنة وفاتحة
- **Offline First** - يعمل دون اتصال بالإنترنت
- **Local Storage** - تخزين آمن للبيانات محلياً
- **Desktop Notifications** - إشعارات نظام سطح المكتب

## 📁 هيكل المشروع

```
نحرير/
├── electron/           # ملفات Electron الرئيسية
│   ├── main.js        # العملية الرئيسية
│   └── preload.js     # سكريبت الحماية
├── src/
│   ├── components/    # المكونات المشتركة
│   ├── features/      # مكونات المزايا
│   ├── contexts/      # React Contexts
│   ├── services/      # خدمات API
│   ├── utils/         # أدوات مساعدة
│   ├── styles/        # ملفات التنسيق
│   ├── App.jsx        # المكون الرئيسي
│   └── main.jsx       # نقطة الدخول
├── public/            # الملفات العامة
└── package.json       # إعدادات المشروع
```

## 🔧 التخصيص

يمكنك تخصيص التطبيق من خلال:

1. **الإعدادات**: تغيير اللغة، السمة، وخيارات التشغيل
2. **النسخ الاحتياطي**: حفظ واستعادة بياناتك
3. **المفضلة**: حفظ العملات والمدن المفضلة

## 📝 الترخيص

MIT License - حر للاستخدام الشخصي والتجاري

## 👨‍💻 المطور

تم تطويره بواسطة محمد علاء

---

© 2026 نَحْرِير. جميع الحقوق محفوظة.

</div>

---

## English

### Nahrir - Smart Personal Assistant

**Nahrir** is a smart personal assistant designed for online teachers, content creators, freelancers, and professionals. It helps you manage time, notes, and daily tools from a single, simple, and professional interface.

### Features

- 💱 Currency Converter with live rates
- 🌍 World Clock for multiple cities
- ⏱️ Timer & Stopwatch with notifications
- 📝 Notes system with search
- 🕌 Prayer Times display
- ✅ Task Management
- 🎯 Focus Mode with Pomodoro
- 📅 Smart Calendar
- 🔗 Quick Links for meetings
- ⚙️ Advanced Settings

### Installation

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
npm run dist
```

© 2026 Nahrir. All rights reserved.
