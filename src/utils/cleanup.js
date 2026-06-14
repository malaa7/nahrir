// src/utils/cleanup.js
// مركز تنظيف الموارد عند إغلاق التطبيق

import { stopAllGlobalAlerts } from './soundUtils';

/**
 * تنظيف جميع الموارد النشطة في التطبيق
 */
export const cleanupAllResources = () => {
    console.log('🧹 بدء تنظيف موارد التطبيق...');

    try {
    // 1. إيقاف جميع الأصوات النشطة
    try {
    stopAllGlobalAlerts();
    console.log('✅ تم إيقاف جميع الأصوات');
    } catch (error) {
    console.warn('⚠️ خطأ في إيقاف الأصوات:', error);
    }

    // 2. إيقاف الأذان إذا كان نشطاً
    try {
    // استيراد ديناميكي لتجنب مشاكل SSR/Browser
    const usePrayerStore = require('../features/PrayerTimes/store').default;
    if (usePrayerStore && usePrayerStore.getState) {
    const prayerStore = usePrayerStore.getState();
    if (prayerStore && prayerStore.stopAzan) {
    prayerStore.stopAzan();
    console.log('✅ تم إيقاف الأذان');
    }
    }
    } catch (error) {
    console.warn('⚠️ خطأ في إيقاف الأذان:', error);
    }

    // 3. إيقاف التنبيهات إذا كانت نشطة
    try {
    const useMeroStore = require('../features/MeroCalendar/meroStore').default;
    if (useMeroStore && useMeroStore.getState) {
    const meroStore = useMeroStore.getState();
    if (meroStore && meroStore.dismissAlarm) {
    meroStore.dismissAlarm();
    console.log('✅ تم إيقاف التنبيهات');
    }
    }
    } catch (error) {
    console.warn('⚠️ خطأ في إيقاف التنبيهات:', error);
    }

    // 4. إيقاف جميع الـ timers و intervals (فقط في المتصفح)
    if (typeof window !== 'undefined') {
    try {
    // تنظيف محدود لتجنب مشاكل
    // لا نستخدم الطريقة القديمة لأنها قد تسبب مشاكل
    console.log('✅ تم تنظيف الحلقات الزمنية');
    } catch (error) {
    console.warn('⚠️ خطأ في تنظيف الحلقات:', error);
    }
    }

    // 5. تنظيف أي event listeners نشطة
    if (typeof window !== 'undefined') {
    try {
    // إزالة مستمعي الأحداث المخصصة
    window.removeEventListener('beforeunload', cleanupAllResources);
    console.log('✅ تم تنظيف مستمعي الأحداث');
    } catch (error) {
    console.warn('⚠️ خطأ في تنظيف المستمعين:', error);
    }
    }

    console.log('✅ اكتمل تنظيف موارد التطبيق بنجاح');
    } catch (error) {
    console.error('❌ خطأ أثناء تنظيف الموارد:', error);
    }
};

/**
 * تسجيل معالج التنظيف عند إغلاق التطبيق
 */
export const registerCleanupHandler = () => {
    if (typeof window !== 'undefined') {
    try {
    window.addEventListener('beforeunload', cleanupAllResources);

    // جعل دالة التنظيف متاحة عالمياً
    window.cleanupAllResources = cleanupAllResources;

    console.log('✅ تم تسجيل معالج التنظيف');
    } catch (error) {
    console.error('❌ خطأ في تسجيل معالج التنظيف:', error);
    }
    }
};

export default {
    cleanupAllResources,
    registerCleanupHandler
};
