# boutique ezzin — Cloudflare Pages + Telegram + DHD

نسخة أولية قابلة للنشر: يستقبل الموقع الطلب، يرسله إلى Telegram، ولا ينشئ شحنة DHD إلا بعد ضغط زر التأكيد في البوت. المنتجات والأسعار تُضاف لاحقاً.

## 1) ارفع الملفات
أنشئ مستودع GitHub (يفضل Private)، وارفع محتويات هذا المجلد إلى جذر المستودع. يجب أن يكون `functions` بجانب `public` وليس داخله. لا تضف أي رموز API إلى الملفات.

## 2) انشر على Cloudflare Pages
Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git. اختر المستودع. اترك Build command فارغاً واجعل Build output directory هو `public` ثم انشر.

## 3) أنشئ تخزين الطلبات KV
Cloudflare → Workers & Pages → KV → Create namespace باسم مثل `boutique-ezzin-orders`. ثم افتح مشروع Pages → Settings → Bindings → Add → KV namespace. اسم المتغير يجب أن يكون `ORDERS`. اربطه بالـ namespace ثم أعد النشر.

## 4) أضف الأسرار
Pages project → Settings → Variables and Secrets. أضف في Production:
- `TELEGRAM_BOT_TOKEN` — Secret مشفّر.
- `TELEGRAM_ADMIN_CHAT_ID` — رقم محادثتك الخاصة مع البوت.
- `TELEGRAM_WEBHOOK_SECRET` — سلسلة عشوائية طويلة (32 حرفاً على الأقل)، Secret مشفّر.
- `DHD_API_TOKEN` — رمز API من DHD، Secret مشفّر.
ثم أعد النشر. لا ترسل هذه القيم هنا ولا تضعها في HTML أو GitHub.

## 5) احصل على Chat ID
افتح البوت واضغط Start ثم أرسل رسالة. استخرج `message.chat.id` من تحديثات البوت باستخدام أداة آمنة على جهازك. لا تنشر رابط Bot API الذي يحتوي على رمز البوت. إذا انكشف الرمز، أبطله من BotFather وأنشئ واحداً جديداً.

## 6) اربط Telegram webhook
بعد النشر، سجّل webhook للرابط `https://YOUR-SITE.pages.dev/api/telegram` باستخدام Telegram Bot API `setWebhook`، ومرّر `secret_token` بنفس قيمة `TELEGRAM_WEBHOOK_SECRET`، و`allowed_updates` = ` ["callback_query"] `. استخدم أداة آمنة، ولا تنشر رابطاً يتضمن رمز البوت.

## 7) اختبار قبل البيع
جرّب أولاً إرسال طلب تجريبي وتأكد من وصوله إلى Telegram. لا تضغط زر تأكيد الشحنة إلا عندما تريد فعلاً إنشاء شحنة على حساب DHD. إذا حدث timeout أو خطأ أثناء الإنشاء، راجع لوحة DHD قبل إعادة المحاولة حتى لا تتكرر الشحنة.

## ملاحظات مهمة
- بيانات DHD وTelegram لا تُرسل إلى المتصفح؛ تُقرأ من Secrets على الخادم.
- الطلبات تحفظ في KV لمدة 30 يوماً، ويُسمح بتأكيدها فقط من حساب Telegram المحدد.
- هذه النسخة لا تحسب أسعار التوصيل تلقائياً، ولا تتحقق من أسماء البلديات، ولا تدير المخزون بعد. أدخل اسم البلدية بالتهجئة التي تقبلها DHD.
- مبلغ `codAmount` هو مبلغ التحصيل الذي أدخلته أنت؛ تحقق من طريقة احتساب رسوم التوصيل في حسابك قبل تشغيل المتجر.
- يمكن اختبار API باستخدام `courier: "sandbox"` من سكربت اختبار منفصل؛ وضع sandbox لا ينشئ طرداً حقيقياً.

