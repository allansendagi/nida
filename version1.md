Talab
طلب
The intent marketplace that replaces Meta ads. Consumers declare needs, AI matches them to businesses. Pre-qualified leads at 90% lower cost.

◉
Overview

⟳
How It Works

▸
MVP Scope

⬡
Tech Stack

◈
Revenue Model

↗
Go-To-Market

▦
Financials

━
Timeline
Overview

Talab (طلب) inverts the advertising model. Instead of businesses paying to interrupt people, consumers declare what they need and businesses pay to respond. Every lead is pre-qualified by AI. Zero waste. Radically cheaper than Meta.

META ADS MODEL
Business → Broadcast → Hope someone cares
TALAB MODEL
Consumer → Declares intent → Best business responds
META COST/LEAD
100–250 QAR (qualified)
TALAB COST/LEAD
7–15 QAR (all pre-qualified)
THE ONE-LINER
"Message us what you need. We'll find who can help — in minutes, not ads."



How It Works

01
Consumer sends a message
CONSUMER
Via WhatsApp: 'I need an AC repair in The Pearl, sometime this week, budget under 500 QAR'
02
AI structures the intent
AI ENGINE
3–4 message conversation extracts: Category → HVAC Repair | Location → The Pearl | Budget → <500 QAR | Urgency → This week | Specifics → AC making noise
03
Matched businesses get notified
PLATFORM
Top 3–5 HVAC companies serving The Pearl get a push notification with the structured lead. No consumer identity shared yet.
04
Business claims & connects
BUSINESS
Business reviews the lead, claims it, and gets the consumer's WhatsApp number. Direct conversation begins. Platform steps back.
05
Both sides rate the match
FEEDBACK
After the interaction, both consumer and business rate quality. This data refines future matching and builds trust scores.


MVP Scope

The MVP is deliberately minimal. One WhatsApp number, one AI, one dashboard. Launch in 2–3 weeks.

✓ BUILD THIS
●
WhatsApp Business API integration
●
AI intake conversation (Claude API)
●
Intent structuring + categorization
●
Simple business dashboard (web)
●
Lead notification system (WhatsApp + email)
●
Lead claim mechanism
●
Basic rating system post-match
●
Manual business onboarding
✗ NOT YET
○
Consumer-facing app
○
Payment processing / in-app transactions
○
Automated business onboarding
○
Analytics / insights dashboard
○
Multi-language AI (start English + Arabic basics)
○
AI auto-response for businesses
○
API for third-party integrations
○
Category expansion beyond V1 vertical
RECOMMENDED FIRST VERTICAL
Home Services — AC repair, plumbing, electrical, cleaning. High urgency, high frequency, high frustration with current discovery (Instagram DMs, word of mouth). Qatar's climate makes AC services alone a year-round demand engine.


Tech Stack

INTAKE
WhatsApp Business Cloud API
Primary consumer interface. No app download required. Near-universal adoption in Qatar. Supports text, voice messages, images. Webhook-based — messages hit your server in real time.
Meta Business API · Webhook receiver · Message queue
AI ENGINE
Anthropic Claude API
Powers the conversational intake. System prompt defines the intake flow — category detection, clarifying questions, intent structuring. Returns a clean JSON intent object from natural conversation.
Claude Sonnet 4 · System prompts · JSON mode · ~0.01 QAR/conversation
DATA
PostgreSQL + Supabase
Structured storage for intents, businesses, matches, ratings. Supabase gives you auth, realtime subscriptions (for live lead notifications), and a dashboard-ready API out of the box.
Supabase · PostgreSQL · Row-level security · Realtime channels
MATCHING
Scoring Algorithm
V1 doesn't need ML. Simple weighted scoring: category match (must), location proximity (weighted), availability (weighted), rating (weighted), response speed history (weighted). Upgrade to vector similarity later.
SQL queries · Weighted scoring · PostGIS for geo
DASHBOARD
Next.js Web App
Business-facing dashboard. See incoming leads, claim them, view history, manage profile. Consumer-facing is WhatsApp only — no web UI needed for V1.
Next.js · Supabase Auth · Tailwind · Vercel hosting
NOTIFICATIONS
Multi-channel Alerts
When a lead matches, businesses get notified via WhatsApp (primary) and email (backup). Speed matters — first responder advantage drives engagement.
WhatsApp Business API · SendGrid · Supabase Edge Functions
ESTIMATED MONTHLY INFRA COST
~400–800 QAR/month — Supabase Pro (350 QAR) + Vercel Pro (75 QAR) + Claude API (~100–300 QAR at scale) + WhatsApp API (per-conversation fees ~50–200 QAR)


Revenue Model

STARTER
150 QAR/mo
Solo operators, freelancers
→
Up to 20 leads/month
→
WhatsApp notifications
→
Basic dashboard
→
Standard matching
GROWTH
400 QAR/mo
SMBs, growing companies
→
Unlimited leads
→
Priority matching
→
Response analytics
→
Email + WhatsApp alerts
PREMIUM
800 QAR/mo
Established businesses
→
Everything in Growth
→
AI auto-response drafts
→
Conversion analytics
→
Auto-claim by criteria
→
Featured in AI recommendations
FUTURE REVENUE LAYERS
Transaction Fee
Month 6+
2–3% when a deal closes through the platform. Requires payment integration (Phase 2).
Demand Intelligence API
Month 12+
Sell anonymized demand data to brands, franchises, and market researchers.
Sponsored Matching
Month 9+
Businesses pay extra to be the first recommendation in their category. Native, not interruptive.
White-Label Licensing
Month 18+
License the platform to other markets. 'Talab for Dubai', 'Talab for Riyadh'.


Go-To-Market

LAUNCH STRATEGY: SUPPLY FIRST
Onboard 20–30 home service businesses manually before launching the consumer side. When the first consumer request comes in, there must be businesses ready to respond. Empty matches kill the product.
WEEK 1–2
Seed Supply
→
Identify 50 home service businesses in Doha (AC, plumbing, cleaning, electrical)
→
Offer first 3 months free — they have zero risk
→
Pitch: 'We send you customers who already want your service. Free to try.'
→
Target businesses already active on Instagram — they understand digital leads
→
Manually onboard 20–30 businesses with profiles
WEEK 3–4
Seed Demand
→
Launch WhatsApp number on personal social media and local community groups
→
Post in Qatar-focused Facebook groups, Reddit, and community WhatsApp groups
→
Simple message: 'Need a home service in Doha? Message this number and we'll find the best one for you. Free.'
→
Ask friends and network to submit real requests as first test cases
→
Target 50–100 consumer requests in month one
MONTH 2–3
Validate & Iterate
→
Measure: match rate, response time, consumer satisfaction, business satisfaction
→
Identify which sub-categories have strongest demand signals
→
Refine AI intake prompts based on real conversations
→
Start charging: convert free businesses to Starter tier (150 QAR/mo)
→
Target: 200+ requests/month, 40+ paying businesses
MONTH 4–6
Expand & Monetize
→
Add second vertical based on demand data (likely food/catering or automotive)
→
Launch Growth tier for top-performing businesses
→
Introduce referral incentive: businesses that refer other businesses get 1 month free
→
Content marketing: publish 'Doha Home Services Report' from demand data
→
Target: 500+ requests/month, 100+ businesses, 40,000+ QAR MRR


Financials

Businesses  Requests/mo MRR (QAR) Infra Cost  Net Note
M1  0 50  0 400 -400  Free beta
M2  10  120 1,500 450 1,050 First paying
M3  25  200 5,000 500 4,500 Validation
M4  40  350 10,000  600 9,400 2nd vertical
M5  60  500 18,000  700 17,300  Growth tier
M6  80  700 28,000  800 27,200  Profitable
M9  150 1,500 52,500  1,200 51,300  Scale
M12 300 3,000 105,000 2,000 103,000 Market leader
BREAK-EVEN
Month 2
At just 10 paying businesses
YEAR 1 REVENUE
~840K QAR
~$230K USD conservative
YEAR 1 MARGIN
~97%
Software margins, minimal infra
ASSUMPTIONS
Average revenue per business: 350 QAR/month (mix of tiers). Churn: 10%/month initially, dropping to 5% at scale. No transaction fees or data revenue included — these are pure subscription projections. Consumer acquisition cost: near zero (WhatsApp + community groups). Business acquisition cost: ~50 QAR/business (time cost of manual outreach).


Timeline

WEEK 1
Foundation
Set up WhatsApp Business API account. Build AI intake system with Claude. Design intent schema and matching logic. Set up Supabase database.
WEEK 2
Core Product
Build business dashboard (Next.js). Implement lead notification pipeline. Build claim/connect flow. Test end-to-end with simulated requests.
WEEK 3
Supply Seeding
Start manual business outreach (50 targets). Onboard first 20 businesses. Create business profiles. Internal testing with real conversations.
WEEK 4
Soft Launch
Go live with WhatsApp number. Seed initial demand via personal network and community groups. Monitor every interaction manually. Iterate on AI prompts daily.
WEEK 5–8
Validate
Hit 100+ consumer requests. Measure match quality and satisfaction. Iterate on matching algorithm. Begin converting free businesses to paid.
WEEK 9–12
Grow
Launch second category. Introduce Growth tier. Build referral mechanics. Target 40+ paying businesses and 200+ monthly requests. Assess Vatrina integration potential.