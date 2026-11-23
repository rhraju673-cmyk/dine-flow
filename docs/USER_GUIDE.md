# DineFlow — Feature & Usage Guide / ফিচার ও ব্যবহার নির্দেশিকা

**English** · [বাংলা](#বাংলা-সংস্করণ)

---

## English version

### 1. What is DineFlow?

DineFlow is software that restaurants, cafés, hotels, fast-food shops and food courts use to run their business online. Many restaurants can use it at the same time, and each one has its own private account. No restaurant can see another restaurant's data.

The final product will let guests scan a QR code on the table, order from their phone, send the order to the kitchen screen, notify waiters, and handle billing and reports.

**Right now (Phase 1)** the foundation is ready: the website, accounts, restaurant setup, the owner dashboard and settings. The ordering features come in the next phases.

> ✅ = works now  🕒 = planned (Coming Soon)

---

### 2. What you can use today (Phase 1)

#### 2.1 Public website ✅
The marketing website for DineFlow at `/`.

| Feature | What it's for |
| --- | --- |
| Hero section + "Start Free Trial" | Lets new restaurants sign up |
| "Explore Demo" | Opens the demo dashboard of the sample restaurant (in development) |
| Product preview, features, how it works | Explains the product to restaurant owners |
| QR ordering, management, kitchen and waiter sections | Shows what the full system will do |
| Pricing (monthly / yearly) | Shows the plans: Starter, Growth, Enterprise |
| Testimonials (marked as samples), FAQ | Builds trust and answers common questions |
| Contact form | Opens the visitor's email app with the message ready to send |
| Language switcher | English, বাংলা, हिन्दी |

**Use it for:** promoting your SaaS business, getting restaurants to sign up, answering their questions.

#### 2.2 Account: sign up, sign in, sign out ✅
- **Register** (`/register`): name, email and password. The password needs at least 8 characters, with a letter and a number.
- **Login** (`/login`) and **logout** (from the user menu at the top right of the dashboard).
- You stay signed in when you refresh the page or come back later (7 days by default).
- **Security:** passwords are stored encrypted, too many wrong login attempts are blocked for a while, and every form is checked on the server.

**Use it for:** giving every restaurant owner a safe, private account.

#### 2.3 Restaurant setup wizard (onboarding) ✅
After registering, the owner fills in 4 short steps:

1. **Basics:** restaurant name and category (casual dining, fine dining, café, fast food, hotel, food court, bakery, other)
2. **Contact:** phone, email, address
3. **Region:** country, currency (for example BDT) and timezone (for example Asia/Dhaka)
4. **Review:** check the details and click **Create restaurant**

The system then automatically:
- creates the restaurant and makes you its **Owner**,
- starts a **14-day free trial**,
- creates a unique web address name (slug), for example `zaika-restaurant`.

**Use it for:** getting a new restaurant ready in about one minute.

#### 2.4 Owner dashboard (Overview) ✅
At `/dashboard` the owner sees:

| Card | What it shows |
| --- | --- |
| Welcome banner | Greeting, restaurant name, status, category, currency and timezone |
| Setup progress | Percentage of the setup steps completed |
| Subscription | Plan, trial status, days left and the end date |
| Profile completion | How complete the profile is, and which fields are missing |
| Getting started | A checklist of what to do next, with a link for each step |
| Account | Your name, email, role and when the restaurant was created |
| Quick actions | Shortcuts to the most common tasks |
| Orders & revenue | Stays empty until ordering is live; the dashboard never shows fake numbers |

**Use it for:** seeing at a glance what is set up and what still needs doing.

#### 2.5 Restaurant settings ✅
At `/dashboard/settings` the owner or a manager can change:
- **General:** name, category, description
- **Branding:** logo and cover image (pick one from the gallery or paste an `https://` link)
- **Contact:** phone, email, address
- **Regional:** country, currency, timezone
- **Taxes & charges:** tax rate (%) and service charge (%)
- **Opening hours:** open/close times for each day, with "copy Monday to all days"

Waiters and kitchen staff can **view** these settings but cannot change them.

**Use it for:** keeping restaurant information correct. It will appear on menus, bills and guest pages in later phases.

#### 2.6 Account settings ✅
At `/dashboard/profile`:
- change your name,
- change your password (this signs you out on all other devices),
- see the list of your restaurants and your role in each,
- sign out.

#### 2.7 Roles and permissions ✅ (foundation)

| Role | What they can do now |
| --- | --- |
| Owner | Everything in Phase 1 |
| Manager | View and edit the restaurant and its settings |
| Kitchen staff | View only |
| Waiter | View only (cannot see subscription details) |
| Super Admin | Reserved for the DineFlow operator (Phase 6). Nobody can give themselves this role. |

Inviting staff from the dashboard comes in a later phase. For testing, the demo includes a waiter account.

#### 2.8 Languages ✅
The whole interface works in **English, বাংলা and हिन्दी**. Click the language button (🌐 EN). The browser remembers your choice. Dates and numbers also appear in the chosen language.

#### 2.9 Demo restaurant ✅ (development only)
The demo restaurant is **Zaika Restaurant**: Dhaka, BDT, 5% tax, 10% service charge.

- Owner: `demo@dineflow.local` / `ZaikaDemo2026`
- Waiter: `waiter@dineflow.local` / `ZaikaDemo2026`

These accounts never exist in production.

---

### 3. Coming in the next phases 🕒

| Phase | Features | What they will let you do |
| --- | --- | --- |
| **2** | Menu management, food categories, items with photos and prices, table management, QR code generation | Build the digital menu and print a QR code for each table |
| **3** | Customer QR menu, cart, food customization, live ordering | Guests order from their phone at the table |
| **4** | Kitchen display, waiter dashboard, real-time notifications | Orders go straight to the kitchen; waiters get alerts |
| **5** | Billing, payments, reviews, analytics | Bills with tax and service charge, payments, guest feedback, sales reports |
| **6** | Super admin, subscriptions, security audit, production deployment | Run DineFlow as a paid SaaS business on the internet |

In the dashboard these appear as **"Soon"** items. Clicking one explains what it will include.

---

### 4. Who can use DineFlow, and how

| Business | How DineFlow helps (full version) |
| --- | --- |
| Casual dining restaurant | QR ordering at tables, a faster kitchen, fewer order mistakes |
| Fine dining | Waiter alerts, elegant digital menu, accurate bills |
| Café | Quick self-ordering, a small team manages more tables |
| Fast food | Fast ordering and a kitchen queue during rush hours |
| Hotel restaurant | Menus in several languages for guests from different countries |
| Food court | Many outlets, each with its own private account |

**As a business owner (you):** DineFlow is a **SaaS product**. You can sell it to many restaurants on monthly or yearly plans (Starter / Growth / Enterprise). Each restaurant signs up on its own and gets a private account.

---

### 5. Step-by-step: first use

1. Run `npm run dev` and open `http://localhost:5173`.
2. Click **Start Free Trial** and create an account.
3. Complete the 4-step restaurant setup.
4. On the dashboard, follow the **Getting started** checklist:
   - add a description, logo and cover image (**Settings → Branding**),
   - set tax and service charge (**Settings → Taxes & charges**),
   - set opening hours (**Settings → Opening hours**).
5. Watch **Setup progress** reach 100%.
6. Change the language from the top bar if needed.

---

## বাংলা সংস্করণ

[English](#english-version)

### ১. DineFlow কী?

DineFlow এমন একটি সফটওয়্যার, যা দিয়ে রেস্তোরাঁ, ক্যাফে, হোটেল, ফাস্ট ফুড আর ফুড কোর্ট অনলাইনে তাদের ব্যবসা চালাতে পারে। একসাথে অনেক রেস্তোরাঁ এটি ব্যবহার করতে পারে, আর প্রত্যেকের নিজস্ব আলাদা অ্যাকাউন্ট থাকে। এক রেস্তোরাঁ অন্য রেস্তোরাঁর তথ্য দেখতে পারে না।

পূর্ণ সংস্করণে অতিথিরা টেবিলের QR কোড স্ক্যান করে ফোন থেকে অর্ডার দেবেন। অর্ডার সরাসরি কিচেনের স্ক্রিনে যাবে, ওয়েটার নোটিফিকেশন পাবেন, আর বিল ও রিপোর্টও এখান থেকেই হবে।

**এখন (ধাপ ১)** ভিত্তি তৈরি হয়েছে: ওয়েবসাইট, অ্যাকাউন্ট, রেস্তোরাঁ সেটআপ, মালিকের ড্যাশবোর্ড আর সেটিংস। অর্ডারিংয়ের ফিচারগুলো আসবে পরের ধাপগুলোতে।

> ✅ = এখনই কাজ করে  🕒 = পরিকল্পিত (শীঘ্রই আসছে)

---

### ২. এখনই যা ব্যবহার করতে পারবেন (ধাপ ১)

#### ২.১ পাবলিক ওয়েবসাইট ✅
`/` ঠিকানায় DineFlow-এর প্রচারের ওয়েবসাইট।

| ফিচার | কী কাজে লাগে |
| --- | --- |
| হিরো অংশ + "ফ্রি ট্রায়াল শুরু করুন" | নতুন রেস্তোরাঁকে সাইন আপ করায় |
| "ডেমো দেখুন" | নমুনা রেস্তোরাঁর ডেমো ড্যাশবোর্ড খোলে (ডেভেলপমেন্টে) |
| প্রোডাক্ট প্রিভিউ, ফিচার, যেভাবে কাজ করে | রেস্তোরাঁ মালিকদের প্রোডাক্টটি বুঝিয়ে দেয় |
| QR অর্ডারিং, ম্যানেজমেন্ট, কিচেন ও ওয়েটার অংশ | পূর্ণ সিস্টেম কী করবে তা দেখায় |
| মূল্য (মাসিক / বার্ষিক) | স্টার্টার, গ্রোথ ও এন্টারপ্রাইজ প্ল্যান দেখায় |
| মতামত (নমুনা হিসেবে চিহ্নিত), প্রশ্নোত্তর | আস্থা তৈরি করে, সাধারণ প্রশ্নের উত্তর দেয় |
| যোগাযোগ ফর্ম | ভিজিটরের ইমেইল অ্যাপে বার্তাটি লিখে খুলে দেয় |
| ভাষা পরিবর্তন | English, বাংলা, हिन्दी |

**কাজে লাগাবেন:** আপনার SaaS ব্যবসার প্রচারে, রেস্তোরাঁগুলোকে সাইন আপ করাতে আর তাদের প্রশ্নের উত্তর দিতে।

#### ২.২ অ্যাকাউন্ট: সাইন আপ, সাইন ইন, সাইন আউট ✅
- **রেজিস্টার** (`/register`): নাম, ইমেইল আর পাসওয়ার্ড দিন। পাসওয়ার্ডে অন্তত ৮টি অক্ষর থাকতে হবে, যার মধ্যে একটি বর্ণ আর একটি সংখ্যা।
- **লগইন** (`/login`) আর **লগআউট** (ড্যাশবোর্ডের ডান কোণের ইউজার মেনু থেকে)।
- পেজ রিফ্রেশ করলে বা পরে আবার এলেও আপনি সাইন ইন অবস্থায় থাকবেন (ডিফল্ট ৭ দিন)।
- **নিরাপত্তা:** পাসওয়ার্ড এনক্রিপ্ট করে রাখা হয়, বারবার ভুল লগইন করলে কিছুক্ষণের জন্য আটকে যায়, আর প্রতিটি ফর্ম সার্ভারে যাচাই হয়।

**কাজে লাগাবেন:** প্রত্যেক রেস্তোরাঁ মালিককে একটি নিরাপদ, আলাদা অ্যাকাউন্ট দিতে।

#### ২.৩ রেস্তোরাঁ সেটআপ উইজার্ড (অনবোর্ডিং) ✅
রেজিস্টার করার পর মালিক ছোট ৪টি ধাপ পূরণ করেন:

1. **মূল তথ্য:** রেস্তোরাঁর নাম আর ধরন (ক্যাজুয়াল, ফাইন ডাইনিং, ক্যাফে, ফাস্ট ফুড, হোটেল, ফুড কোর্ট, বেকারি, অন্যান্য)
2. **যোগাযোগ:** ফোন, ইমেইল, ঠিকানা
3. **অঞ্চল:** দেশ, মুদ্রা (যেমন BDT) আর টাইমজোন (যেমন Asia/Dhaka)
4. **পর্যালোচনা:** তথ্য মিলিয়ে দেখে **রেস্তোরাঁ তৈরি করুন** বাটনে ক্লিক করুন

এরপর সিস্টেম নিজে থেকেই:
- রেস্তোরাঁটি তৈরি করে আপনাকে **মালিক** বানিয়ে দেয়,
- **১৪ দিনের ফ্রি ট্রায়াল** চালু করে,
- একটি ইউনিক ওয়েব ঠিকানার নাম (slug) তৈরি করে, যেমন `zaika-restaurant`।

**কাজে লাগাবেন:** নতুন রেস্তোরাঁকে প্রায় এক মিনিটে চালু করতে।

#### ২.৪ মালিকের ড্যাশবোর্ড (সারসংক্ষেপ) ✅
`/dashboard` পেজে মালিক যা দেখেন:

| কার্ড | কী দেখায় |
| --- | --- |
| স্বাগতম ব্যানার | শুভেচ্ছা, রেস্তোরাঁর নাম, অবস্থা, ধরন, মুদ্রা আর টাইমজোন |
| সেটআপ অগ্রগতি | সেটআপের কত শতাংশ সম্পন্ন হয়েছে |
| সাবস্ক্রিপশন | প্ল্যান, ট্রায়ালের অবস্থা, কত দিন বাকি আর শেষ হওয়ার তারিখ |
| প্রোফাইল সম্পূর্ণতা | প্রোফাইল কতটা পূরণ হয়েছে, আর কোন ঘরগুলো বাকি |
| শুরু করুন | এরপর কী করতে হবে তার তালিকা, প্রতিটি ধাপে যাওয়ার লিংকসহ |
| অ্যাকাউন্ট | আপনার নাম, ইমেইল, ভূমিকা আর রেস্তোরাঁ তৈরির তারিখ |
| দ্রুত কাজ | সাধারণ কাজগুলোর শর্টকাট |
| অর্ডার ও আয় | অর্ডারিং চালু না হওয়া পর্যন্ত খালি থাকে; ড্যাশবোর্ড কখনো ভুয়া সংখ্যা দেখায় না |

**কাজে লাগাবেন:** এক নজরে দেখতে কী কী সেটআপ হয়েছে আর কী বাকি।

#### ২.৫ রেস্তোরাঁ সেটিংস ✅
`/dashboard/settings` পেজে মালিক বা ম্যানেজার যা পরিবর্তন করতে পারেন:
- **সাধারণ:** নাম, ধরন, বিবরণ
- **ব্র্যান্ডিং:** লোগো আর কভার ছবি (গ্যালারি থেকে বেছে নিন, অথবা `https://` লিংক দিন)
- **যোগাযোগ:** ফোন, ইমেইল, ঠিকানা
- **আঞ্চলিক:** দেশ, মুদ্রা, টাইমজোন
- **ট্যাক্স ও চার্জ:** ট্যাক্স রেট (%) আর সার্ভিস চার্জ (%)
- **খোলার সময়:** প্রতিদিন কখন খোলে আর বন্ধ হয়, সাথে "সোমবারের সময় সব দিনে কপি করুন"

ওয়েটার আর কিচেন স্টাফ এই সেটিংস **দেখতে** পারেন, কিন্তু পরিবর্তন করতে পারেন না।

**কাজে লাগাবেন:** রেস্তোরাঁর তথ্য সঠিক রাখতে। পরের ধাপগুলোতে এই তথ্য মেনু, বিল আর অতিথিদের পেজে দেখা যাবে।

#### ২.৬ অ্যাকাউন্ট সেটিংস ✅
`/dashboard/profile` পেজে:
- নিজের নাম পরিবর্তন,
- পাসওয়ার্ড পরিবর্তন (এতে অন্য সব ডিভাইস থেকে সাইন আউট হয়ে যায়),
- আপনার রেস্তোরাঁগুলোর তালিকা আর প্রতিটিতে আপনার ভূমিকা,
- সাইন আউট।

#### ২.৭ ভূমিকা ও অনুমতি ✅ (ভিত্তি)

| ভূমিকা | এখন যা করতে পারেন |
| --- | --- |
| মালিক (Owner) | ধাপ ১-এর সবকিছু |
| ম্যানেজার | রেস্তোরাঁ আর সেটিংস দেখা ও সম্পাদনা |
| কিচেন স্টাফ | শুধু দেখা |
| ওয়েটার | শুধু দেখা (সাবস্ক্রিপশনের তথ্য দেখতে পান না) |
| সুপার অ্যাডমিন | DineFlow পরিচালনাকারীর জন্য সংরক্ষিত (ধাপ ৬)। কেউ নিজেকে এই ভূমিকা দিতে পারে না। |

ড্যাশবোর্ড থেকে স্টাফ আমন্ত্রণের সুবিধা পরের ধাপে আসবে। পরীক্ষার জন্য ডেমোতে একটি ওয়েটার অ্যাকাউন্ট রাখা আছে।

#### ২.৮ ভাষা ✅
পুরো ইন্টারফেস **English, বাংলা ও हिन्दी** ভাষায় চলে। উপরের ভাষা বাটনে (🌐 EN) ক্লিক করুন। আপনার পছন্দ ব্রাউজার মনে রাখে। তারিখ আর সংখ্যাও বেছে নেওয়া ভাষায় দেখায়।

#### ২.৯ ডেমো রেস্তোরাঁ ✅ (শুধু ডেভেলপমেন্টে)
ডেমো রেস্তোরাঁটির নাম **Zaika Restaurant**: ঢাকা, BDT, ৫% ট্যাক্স, ১০% সার্ভিস চার্জ।

- মালিক: `demo@dineflow.local` / `ZaikaDemo2026`
- ওয়েটার: `waiter@dineflow.local` / `ZaikaDemo2026`

প্রোডাকশনে এই অ্যাকাউন্টগুলো কখনোই থাকে না।

---

### ৩. পরের ধাপগুলোতে যা আসবে 🕒

| ধাপ | ফিচার | যা করতে পারবেন |
| --- | --- | --- |
| **২** | মেনু ম্যানেজমেন্ট, খাবারের ক্যাটাগরি, ছবি ও দামসহ খাবার, টেবিল ম্যানেজমেন্ট, QR কোড তৈরি | ডিজিটাল মেনু বানানো আর প্রতিটি টেবিলের QR কোড প্রিন্ট করা |
| **৩** | অতিথির QR মেনু, কার্ট, খাবার কাস্টমাইজেশন, লাইভ অর্ডার | অতিথিরা টেবিলে বসে ফোন থেকে অর্ডার দেবেন |
| **৪** | কিচেন ডিসপ্লে, ওয়েটার ড্যাশবোর্ড, রিয়েল-টাইম নোটিফিকেশন | অর্ডার সরাসরি কিচেনে যাবে, ওয়েটার সতর্কবার্তা পাবেন |
| **৫** | বিলিং, পেমেন্ট, রিভিউ, অ্যানালিটিক্স | ট্যাক্স ও সার্ভিস চার্জসহ বিল, পেমেন্ট, অতিথির মতামত, বিক্রির রিপোর্ট |
| **৬** | সুপার অ্যাডমিন, সাবস্ক্রিপশন, নিরাপত্তা অডিট, প্রোডাকশন ডিপ্লয় | DineFlow-কে পেইড SaaS ব্যবসা হিসেবে ইন্টারনেটে চালানো |

ড্যাশবোর্ডে এগুলো **"শীঘ্রই"** চিহ্নসহ দেখা যায়। যেকোনোটিতে ক্লিক করলে তাতে কী কী থাকবে তা দেখা যাবে।

---

### ৪. কারা DineFlow ব্যবহার করতে পারবেন, আর কীভাবে

| ব্যবসা | DineFlow যেভাবে সাহায্য করবে (পূর্ণ সংস্করণে) |
| --- | --- |
| ক্যাজুয়াল ডাইনিং রেস্তোরাঁ | টেবিলে QR অর্ডার, দ্রুত কিচেন, অর্ডারে কম ভুল |
| ফাইন ডাইনিং | ওয়েটার সতর্কবার্তা, সুন্দর ডিজিটাল মেনু, নির্ভুল বিল |
| ক্যাফে | দ্রুত সেলফ-অর্ডার, ছোট টিম দিয়েও বেশি টেবিল সামলানো |
| ফাস্ট ফুড | ভিড়ের সময় দ্রুত অর্ডার আর কিচেনের সারি ঠিক রাখা |
| হোটেল রেস্তোরাঁ | বিভিন্ন দেশের অতিথিদের জন্য একাধিক ভাষায় মেনু |
| ফুড কোর্ট | অনেক আউটলেট, প্রত্যেকের নিজস্ব আলাদা অ্যাকাউন্ট |

**ব্যবসার মালিক হিসেবে আপনি:** DineFlow একটি **SaaS প্রোডাক্ট**। আপনি এটি মাসিক বা বার্ষিক প্ল্যানে (স্টার্টার / গ্রোথ / এন্টারপ্রাইজ) অনেক রেস্তোরাঁর কাছে বিক্রি করতে পারবেন। প্রতিটি রেস্তোরাঁ নিজে সাইন আপ করে নিজস্ব আলাদা অ্যাকাউন্ট পাবে।

---

### ৫. ধাপে ধাপে: প্রথমবার ব্যবহার

1. `npm run dev` চালিয়ে `http://localhost:5173` খুলুন।
2. **ফ্রি ট্রায়াল শুরু করুন**-এ ক্লিক করে অ্যাকাউন্ট খুলুন।
3. ৪ ধাপের রেস্তোরাঁ সেটআপ শেষ করুন।
4. ড্যাশবোর্ডে **শুরু করুন** তালিকা অনুযায়ী কাজগুলো করুন:
   - বিবরণ, লোগো আর কভার ছবি যোগ করুন (**সেটিংস → ব্র্যান্ডিং**),
   - ট্যাক্স আর সার্ভিস চার্জ সেট করুন (**সেটিংস → ট্যাক্স ও চার্জ**),
   - খোলার সময় সেট করুন (**সেটিংস → খোলার সময়**)।
5. **সেটআপ অগ্রগতি** ১০০% হওয়া পর্যন্ত দেখুন।
6. দরকার হলে উপরের বার থেকে ভাষা বদলে নিন।
