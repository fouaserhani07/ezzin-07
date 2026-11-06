const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const clean=(s,n=240)=>String(s??'').trim().slice(0,n);
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export async function onRequestPost({request,env}){
 if(!env.ORDERS||!env.TELEGRAM_BOT_TOKEN||!env.TELEGRAM_ADMIN_CHAT_ID)return json({error:'الخادم غير مكتمل الإعداد. حاول لاحقاً.'},503);
 if(!(request.headers.get('content-type')||'').includes('application/json'))return json({error:'صيغة الطلب غير صحيحة.'},415);
 let b;try{b=await request.json()}catch{return json({error:'تعذر قراءة بيانات الطلب.'},400)}
 const o={id:'BE'+crypto.randomUUID().replaceAll('-','').slice(0,10).toUpperCase(),fullName:clean(b.fullName,120),phone:clean(b.phone,20).replace(/[\s-]/g,''),wilayaCode:Number(b.wilayaCode),communeName:clean(b.communeName,100),addressLine:clean(b.addressLine,240),productList:clean(b.productList,500),codAmount:Number(b.codAmount),deliveryType:b.deliveryType==='stopdesk'?'stopdesk':'home',status:'pending',createdAt:new Date().toISOString()};
 if(o.fullName.length<2||!/^(05|06|07)\d{8}$/.test(o.phone)||!Number.isInteger(o.wilayaCode)||o.wilayaCode<1||o.wilayaCode>58||o.communeName.length<2||o.addressLine.length<4||o.productList.length<2||!Number.isSafeInteger(o.codAmount)||o.codAmount<0||o.codAmount>100000000)return json({error:'تحقق من الاسم والهاتف والولاية والبلدية والعنوان والمنتجات والمبلغ.'},400);
 await env.ORDERS.put(o.id,JSON.stringify(o),{expirationTtl:2592000});
 const text=['🛒 <b>طلب جديد - boutique ezzin</b>',`الطلب: <code>${o.id}</code>`,`الاسم: ${esc(o.fullName)}`,`الهاتف: ${esc(o.phone)}`,`الولاية: ${o.wilayaCode}`,`البلدية: ${esc(o.communeName)}`,`العنوان: ${esc(o.addressLine)}`,`المنتجات: ${esc(o.productList)}`,`المبلغ للتحصيل: <b>${o.codAmount} دج</b>`,`التوصيل: ${o.deliveryType==='home'?'المنزل':'مكتب DHD'}`,'','تأكد من البيانات قبل إنشاء الشحنة.'].join('\n');
 const tg=await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:env.TELEGRAM_ADMIN_CHAT_ID,text,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'✅ تأكيد وإنشاء شحنة DHD',callback_data:`confirm:${o.id}`},{text:'❌ رفض الطلب',callback_data:`reject:${o.id}`}]]}})});
 if(!tg.ok){await env.ORDERS.delete(o.id);return json({error:'تعذر إرسال الطلب إلى Telegram. تحقق من إعداد البوت.'},502)}return json({ok:true,orderId:o.id},201)
}
