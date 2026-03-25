# NIDA

## The Intent Marketplace That Replaces Meta Ads

### Autonomous AI Agents. Machine-Readable Contracts. Zero-Waste Matching.

---

# Executive Summary

**Nida** (نداء — Arabic for "call" or "summons") is an AI-powered intent marketplace that inverts the advertising model. Instead of businesses paying to broadcast ads hoping the right person sees them, consumers declare what they need and AI agents autonomously match them with the best service provider.

**The result:** Pre-qualified leads at 90% lower cost than Meta ads. A consumer says "I need AC repair in West Bay" via WhatsApp, and within minutes, the best-matched business has accepted the job — all negotiated by AI agents operating under machine-readable governance contracts.

**What we've built:** A fully functional platform running on the NOMOS Protocol — the first live deployment of executable governance contracts for autonomous agent-to-agent commerce.

---

# The Problem

## Meta Ads Are Broken

Every small business owner knows the frustration:

| The Meta Ads Reality | |
|---------------------|---|
| Spend per month | 2,000–5,000 QAR |
| Leads generated | 30–80 |
| Actually qualified | 10–20 |
| Cost per real lead | **100–250 QAR** |
| Conversion rate | 5–15% |

**The waste is structural.** Meta sells probabilistic targeting — businesses pay to show ads to people who *might* be interested. Most impressions are wasted. Most clicks are unqualified. The feedback loop is slow and opaque.

Meanwhile, consumers searching for services face:
- Scrolling through Instagram hoping to find a business
- DMing multiple providers and waiting hours for responses
- No way to compare pricing, availability, or reliability
- Zero accountability if the provider doesn't show up

**The system is broken for everyone except Meta.**

---

# The Solution

## Nida: Demand-First Commerce

Nida inverts the funnel. Instead of businesses broadcasting to find customers, customers broadcast needs and the best business responds.

```
TRADITIONAL MODEL (META ADS)
Business → Broadcast → Hope someone cares → Pay regardless

NIDA MODEL
Consumer → Declares intent → AI matches → Best provider responds → Pay for results
```

### How It Works

**Step 1: Consumer sends a WhatsApp message**
> "I need AC repair in West Bay, my unit is making a clicking noise. Budget around 300-400 QAR, need it fixed this week."

**Step 2: AI structures the intent**
A brief conversational intake (2-3 messages) extracts:
- Category: HVAC Repair
- Location: West Bay
- Urgency: This week
- Budget: 300-400 QAR
- Specifics: Clicking noise, still cooling

**Step 3: Automatic matching**
The platform scores all qualified businesses:
- Category match (must serve HVAC)
- Zone coverage (must serve West Bay)
- Price fit (within budget range)
- Availability (capacity and lead time)
- Trust score (ratings and history)

**Step 4: Sequential dispatch**
Top-ranked business gets exclusive 15-minute window to accept. If they pass or timeout, next in rank gets the offer. This rewards reliability — businesses that respond fast get more leads.

**Step 5: Connection and execution**
When a business accepts:
- Consumer gets confirmation with business details
- Business gets consumer contact info
- Both parties connect directly
- After service, both rate the experience

**Total time from "my AC is clicking" to confirmed booking: ~6 minutes**

---

# The Innovation Stack

## Three Layers of Innovation

### Layer 1: WhatsApp as Interface

**Why this matters:**

| Traditional App | Nida via WhatsApp |
|----------------|-------------------|
| Download app → Create account → Verify email → Set password → Fill profile → Grant permissions → Learn UI → Finally use it | Send message → Done |

- **95% WhatsApp penetration in Qatar** — everyone already has it
- **Zero friction onboarding** — no app download, no signup
- **Natural language input** — no forms, no dropdowns
- **Async by default** — send message, live your life, get notified

**The interface they already use 50x/day becomes the commerce layer.**

### Layer 2: AI-Native Intake

Instead of forcing consumers to fill forms:

```
Consumer: "AC broken"
Nida: "Is it not cooling at all, or making noise?"
Consumer: "Not cooling, it's so hot"
Nida: "I'll find someone fast. Where are you located?"
Consumer: "Pearl"
Nida: "Got it. What's your budget roughly?"
Consumer: "Maybe 300-400?"
Nida: "Perfect. Found 3 technicians. Notifying the best one now..."
```

**This doesn't feel like booking a service. It feels like texting a helpful friend.**

The AI extracts structured intent from natural conversation:
```json
{
  "category": "home_services.hvac.repair",
  "location": { "zone": "the_pearl" },
  "urgency": "same_day",
  "budget": { "max": 400 },
  "specifics": { "symptom": "not_cooling" }
}
```

### Layer 3: NOMOS Protocol — Executable Governance Contracts

This is the infrastructure innovation that makes everything else work.

Every business on Nida doesn't just have a "profile." They have a **machine-readable contract** that AI agents can parse, evaluate, and negotiate against:

```json
{
  "nomos_version": "0.1.0",
  "contract_type": "service_offering",
  "issuer": {
    "entity_id": "biz_ac_cooltech_0042",
    "display_name": "CoolTech AC Services",
    "trust_score": 87,
    "verified": true
  },
  "service": {
    "category": "home_services.hvac.repair",
    "capabilities": ["diagnosis", "repair", "gas_refill", "maintenance"]
  },
  "pricing": {
    "model": "tiered",
    "currency": "QAR",
    "rules": [
      { "capability": "repair", "base": 350, "range": [200, 600], "negotiable": true }
    ],
    "urgency_multiplier": { "same_day": 1.5, "next_day": 1.2 }
  },
  "availability": {
    "lead_time_hours": 4,
    "capacity": { "max_daily_jobs": 6, "current_load": 0.4 }
  },
  "service_area": {
    "zones": ["the_pearl", "west_bay", "lusail"],
    "surcharge_zones": [{ "zone": "al_wakrah", "surcharge": 50 }]
  },
  "terms": {
    "warranty_days": 30,
    "cancellation_policy": { "free_cancellation_hours": 24 }
  },
  "agent_instructions": {
    "auto_accept": {
      "enabled": true,
      "conditions": { "min_price_pct": 85, "required_lead_time_hours": 6 }
    },
    "escalate_to_human": {
      "triggers": ["price_below_min", "custom_request", "dispute"]
    }
  }
}
```

**Businesses don't know they're publishing governance contracts.** They think they're setting up a profile. But the data structure enables autonomous agent negotiation — the foundation for agent-to-agent commerce.

---

# NOMOS Protocol Deep Dive

## What NOMOS Actually Does

NOMOS (Network of Machine-Operated Service contracts) is a protocol layer that turns service offerings into machine-readable, AI-executable contracts.

### Without NOMOS (Traditional Marketplace)

```
Consumer: "I need AC repair"
         ↓
Platform: Shows list of AC companies
         ↓
Consumer: Calls 5 businesses manually
         ↓
"Are you available today?"
"Do you serve West Bay?"
"How much roughly?"
"Do you have warranty?"
         ↓
Consumer compares mentally, picks one
         ↓
Maybe they show up, maybe they don't
```

**Problems:** Consumer does all the work. No structured comparison. Businesses waste time on unqualified leads. No accountability.

### With NOMOS (Nida)

```
Consumer: "I need AC repair in West Bay"
         ↓
AI extracts: { category, location, urgency, budget }
         ↓
System AUTOMATICALLY:
  ✓ Filters by capability (AC repair)
  ✓ Filters by zone (serves West Bay)
  ✓ Filters by lead time (can do same-day)
  ✓ Checks capacity (not overbooked)
  ✓ Scores price fit (within budget)
  ✓ Ranks by trust score
         ↓
Best match gets first chance
         ↓
Structured terms already known
```

### The Agent Protocol

Five message types govern all interactions:

| Message | Direction | Purpose |
|---------|-----------|---------|
| **DISCOVER** | Consumer → Platform | Publish structured intent, get matching contracts |
| **PROPOSE** | Consumer Agent → Business Agent | Propose specific terms (price, date, capability) |
| **COUNTER** | Business Agent → Consumer Agent | Counter-propose within contract rules |
| **ACCEPT** | Either → Either | Lock in agreed terms, create execution record |
| **ESCALATE** | Either → Human | Hand off when rules can't resolve (dispute, exception) |

### The Innovation: Governed Autonomy

The `agent_instructions` field is the breakthrough:

```json
"agent_instructions": {
  "auto_accept": {
    "enabled": true,
    "conditions": {
      "min_price_pct": 85,
      "required_lead_time_hours": 6,
      "zones": ["the_pearl", "west_bay"]
    }
  },
  "escalate_to_human": {
    "triggers": ["price_below_min", "custom_request"]
  }
}
```

**The business sets rules once. Their AI agent operates within those rules without supervision.**

This is the exact same principle that banks need for autonomous operations — agents executing within deterministic constraints. We're proving it works at the AC repair level, but the infrastructure scales to any complexity.

---

# The Full Customer Journey

## Consumer Experience

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: INTENT CAPTURE                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Consumer WhatsApp: "I need AC repair in West Bay"              │
│                              ↓                                  │
│  Nida: "I can help! Is your AC not cooling at all, or making   │
│         a noise while running?"                                 │
│                              ↓                                  │
│  Consumer: "Not cooling, completely stopped"                    │
│                              ↓                                  │
│  Nida: "Got it — sounds urgent. Do you have a budget in mind,  │
│         or should I find the best available?"                   │
│                              ↓                                  │
│  Consumer: "Under 500 if possible"                              │
│                              ↓                                  │
│  Nida: "Perfect. I've found 3 AC technicians available today   │
│         in West Bay. Notifying the best match now..."           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: MATCHING & DISPATCH                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Intent Created:                                                │
│    • Category: home_services.hvac.repair                        │
│    • Location: west_bay                                         │
│    • Urgency: same_day                                          │
│    • Budget: max 500 QAR                                        │
│                              ↓                                  │
│  DISCOVER Phase:                                                │
│    • 47 HVAC businesses in database                             │
│    • 12 serve West Bay                                          │
│    • 5 can do same-day                                          │
│    • 3 within budget range                                      │
│                              ↓                                  │
│  Scoring & Ranking:                                             │
│    #1: CoolTech AC (Score: 92, Trust: 87)                       │
│    #2: Qatar Cool (Score: 85, Trust: 82)                        │
│    #3: AC Masters (Score: 78, Trust: 79)                        │
│                              ↓                                  │
│  Sequential Dispatch:                                           │
│    → Offer sent to #1 (CoolTech)                                │
│    → 15-minute exclusive window                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: BUSINESS NOTIFICATION                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CoolTech receives WhatsApp:                                    │
│                                                                 │
│  "🔔 New Lead Available!                                        │
│                                                                 │
│   Service: AC Repair (not cooling)                              │
│   Location: West Bay                                            │
│   Urgency: Same Day                                             │
│   Budget: Up to 500 QAR                                         │
│                                                                 │
│   Match Score: 92%                                              │
│   You are rank #1 of 3 matched businesses.                      │
│                                                                 │
│   ⏰ Respond within 15 minutes or lead goes to next provider.   │
│                                                                 │
│   Reply YES to accept this lead."                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: ACCEPTANCE & CONNECTION                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CoolTech replies: "YES"                                        │
│                              ↓                                  │
│  System:                                                        │
│    • Marks offer as accepted                                    │
│    • Creates execution record                                   │
│    • Cancels other pending offers                               │
│    • Reveals consumer contact to business                       │
│                              ↓                                  │
│  CoolTech receives:                                             │
│  "✅ Lead Confirmed!                                            │
│                                                                 │
│   Customer: Ahmed                                               │
│   Phone: +974 5555 1234                                         │
│   Location: West Bay                                            │
│                                                                 │
│   Please contact within 30 minutes to schedule.                 │
│   Execution ID: exec_0918374"                                   │
│                              ↓                                  │
│  Consumer receives:                                             │
│  "Great news! CoolTech AC Services has accepted your request.  │
│                                                                 │
│   They will contact you shortly to schedule the repair.         │
│                                                                 │
│   Business: CoolTech AC Services                                │
│   Rating: ⭐ 4.8 (42 reviews)                                   │
│   Warranty: 30 days included"                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 5: SERVICE & RATING                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Business contacts consumer → Schedules visit                   │
│                              ↓                                  │
│  Service performed → AC fixed                                   │
│                              ↓                                  │
│  24 hours later, Consumer receives:                             │
│  "How was your AC repair with CoolTech?                         │
│   Reply 1-5: ⭐⭐⭐⭐⭐"                                          │
│                              ↓                                  │
│  Consumer: "5"                                                  │
│                              ↓                                  │
│  Rating saved → Trust score updated → Better future matching    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Business Experience

```
┌─────────────────────────────────────────────────────────────────┐
│  BUSINESS DASHBOARD                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Incoming Leads (3 new)          Trust Score: 87 ↑              │
│  ─────────────────────────────────────────────────              │
│                                                                 │
│  🔔 AC Repair - West Bay - Same Day                             │
│     Budget: Up to 500 QAR                                       │
│     Match: 92% | Rank: #1 | Expires in 14:32                    │
│     [ACCEPT] [PASS]                                             │
│                                                                 │
│  ⏳ Plumbing - Lusail - This Week                               │
│     Budget: 200-400 QAR                                         │
│     Match: 78% | Rank: #2 | Waiting...                          │
│                                                                 │
│  ✅ AC Service - The Pearl - Completed                          │
│     Price: 340 QAR | Rating: ⭐⭐⭐⭐⭐                           │
│                                                                 │
│  ─────────────────────────────────────────────────              │
│  This Month: 23 leads | 18 accepted | 78% conversion            │
│  Revenue via Nida: ~7,200 QAR                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# Competitive Landscape

## What Exists Today

### Traditional Marketplaces (Listings Model)

| Platform | Model | Problem |
|----------|-------|---------|
| **Thumbtack** | Consumer posts, businesses bid | Race to bottom, spam quotes |
| **Angi** | Reviews + lead gen | Consumer still compares manually |
| **HomeAdvisor** | Sells leads to businesses | Businesses pay per lead, quality varies |
| **Yelp** | Reviews + ads | Discovery only, no transaction |
| **TaskRabbit** | On-demand taskers | Limited categories, gig workers |

**Their model:** Consumer posts → All businesses see it → Bidding war → Consumer overwhelmed

**Nida model:** Consumer describes need → AI structures it → Best match gets first chance → Done

### On-Demand Apps (Uber Model)

| Platform | Model | Limitation |
|----------|-------|------------|
| **Uber** | Rides | Single vertical |
| **Urban Company** | Home services | Employed workers, not marketplace |
| **Careem** | Rides + food | Not local services |

**Urban Company** is closest — they do AC repair, cleaning, etc. But they employ/contract workers directly. Heavy operations. Not a protocol.

**Nida advantage:** Protocol-based, not employment-based. Lighter operations, more scalable.

### Qatar/GCC Market

| Platform | Focus | Gap |
|----------|-------|-----|
| **Snoonu** | Delivery | Not services |
| **ServiceMarket (UAE)** | Home services | Traditional listings |
| **Helpling (UAE)** | Cleaning | Single vertical |

**Qatar is underserved.** No dominant home services platform. First-mover advantage.

## What Makes Nida Different

| Aspect | Competitors | Nida |
|--------|-------------|------|
| **Intake** | Forms, dropdowns | Natural language AI |
| **Matching** | Show all, consumer picks | Automatic scoring, best first |
| **Lead distribution** | Blast to all (or auction) | Sequential dispatch (fair) |
| **Pricing** | Hidden until quote | Declared ranges in contract |
| **Business data** | Unstructured profiles | Machine-readable contracts |
| **Future** | Stays human-mediated | Agent-to-agent ready |

## The Innovation Gap

**Nobody has built the protocol layer.**

Uber works because rides are simple: Pickup → Dropoff → Price calculated.

Home services are complex: What's broken? What's the scope? What's the urgency? What are the terms?

**NOMOS makes complex services machine-readable.** That's the moat.

---

# Business Model

## Revenue Streams

### Subscription Tiers

| Tier | Price | Target | Features |
|------|-------|--------|----------|
| **Starter** | 150 QAR/mo | Solo operators | Up to 15 leads, WhatsApp notifications, basic dashboard |
| **Growth** | 400 QAR/mo | Active SMBs | Unlimited leads, priority matching, analytics |
| **Premium** | 800 QAR/mo | Established | Everything + AI auto-pilot, featured placement |

### Value Proposition vs Meta Ads

| Metric | Meta Ads | Nida |
|--------|----------|------|
| Monthly spend | 2,000+ QAR | 150-800 QAR |
| Leads generated | 30-80 | 15-unlimited |
| Qualified leads | 10-20 | ALL (pre-filtered) |
| Cost per qualified lead | 100-250 QAR | 7-15 QAR |
| Targeting | Probabilistic | Intent-based |
| Waste | 70-80% | ~0% |

**A business needs ONE conversion from Nida to pay for a full month.**

### Additional Revenue Layers

| Layer | Timing | Description | Monthly Impact |
|-------|--------|-------------|----------------|
| **Urgency Fees** | Month 2 | Consumer pays 10-25 QAR for priority | +900 QAR |
| **Booking Fees** | Month 4 | 15-25 QAR per completed booking | +4,200 QAR |
| **Sponsorship** | Month 3 | Featured placement per category/zone | +3,000 QAR |
| **Payments** | Month 6 | 2.5% of in-platform transactions | +4,200 QAR |
| **Data Licensing** | Month 9 | Anonymized demand intelligence | +10,000 QAR |

---

# Financial Projections

## Revenue Timeline

| Period | Businesses | Requests/mo | MRR (QAR) | Status |
|--------|------------|-------------|-----------|--------|
| Weekend | 0 | 0 | — | Building |
| Week 1 | 25 | 0 | — | Recruiting (free trial) |
| Week 2 | 25 | 30 | — | Soft launch |
| Week 3 | 28 | 60 | — | Validating |
| Week 4 | 30 | 100 | — | Building proof |
| **Week 5** | 40 | 140 | **1,500** | **First revenue** |
| Week 6-8 | 55 | 300 | 4,500 | Growth + upsell |
| **Month 3** | 80 | 500 | **12,000** | Founder cohort converts |
| Month 4 | 110 | 700 | 20,000 | Category expansion |
| **Month 6** | 180 | 1,200 | **40,000** | Operational profit |
| **Month 12** | 400 | 3,000 | **105,000** | Market leader |

## Unit Economics

| Metric | Value |
|--------|-------|
| **First revenue** | Week 5 (35 days) |
| **Break-even** | Week 6 (at ~10 businesses) |
| **Infrastructure cost** | 400-1,000 QAR/month |
| **Gross margin** | 96-97% |
| **LTV/CAC** | >20x (near-zero acquisition cost) |

## Year 1 Projections

| Metric | Projection |
|--------|------------|
| **Total Revenue** | ~840,000 QAR (~$230K USD) |
| **Paying Businesses** | 300+ |
| **Monthly Requests** | 3,000+ |
| **Net Margin** | ~95% |

---

# The Dual Path Strategy

## Two Paths, One Protocol

Nida isn't just a product — it's the proof layer for enterprise NOMOS adoption.

```
┌─────────────────────────────────────────────────────────────────┐
│  PATH A: BOTTOM-UP (NIDA)                                       │
│  Prove NOMOS in the market                                      │
├─────────────────────────────────────────────────────────────────┤
│  • Consumers declare needs via WhatsApp                         │
│  • AI agents negotiate using NOMOS contracts                    │
│  • Live transactions, real money                                │
│  • Thousands of proof points                                    │
│                                                                 │
│  SELLS: Cheaper leads, zero-waste matching                      │
│  BUYER: Local service businesses                                │
│  PRICE: 150-800 QAR/month                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                    SHARED PROTOCOL (NOMOS)
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│  PATH B: TOP-DOWN (ENTERPRISE)                                  │
│  Sell NOMOS to banks & institutions                             │
├─────────────────────────────────────────────────────────────────┤
│  • Extract operational logic from institutions                  │
│  • Formalize into .nomos contracts                              │
│  • Governance runtime for agent execution                       │
│  • Enterprise licensing                                         │
│                                                                 │
│  SELLS: Governance, compliance, automation                      │
│  BUYER: Banks, insurance, government                            │
│  PRICE: $25K-500K per engagement                                │
└─────────────────────────────────────────────────────────────────┘
```

## How Each Path Strengthens The Other

### Nida → Enterprise

| Benefit | Impact |
|---------|--------|
| **Live transaction data** | Walk into QNB with 5,000+ autonomous transactions as proof |
| **Battle-tested protocol** | Every edge case resolved in low-stakes environment first |
| **Developer ecosystem** | Real SDK users, GitHub stars, production deployments |
| **Revenue independence** | Never desperate in enterprise negotiations |

### Enterprise → Nida

| Benefit | Impact |
|---------|--------|
| **Institutional credibility** | "NOMOS — trusted by Qatar National Bank" changes everything |
| **Funding for scale** | Enterprise revenue funds Nida growth |
| **Protocol sophistication** | Bank requirements mature the protocol faster |
| **Distribution channels** | Banks' SME clients become Nida subscribers |

## The Bank Pitch Transformation

### Before Nida (Theoretical)
> "Please let us extract your operational logic and formalize it into governance contracts. Trust us, this will work. Here's a whitepaper."

**Result:** Hard sell. Asking institutions to be first.

### After Nida (Proven)
> "We're already doing this. Here's a dashboard showing 10,000 autonomous transactions. 500 businesses publish NOMOS contracts. AI agents negotiate and execute in 47 seconds average. Dispute rate: 2.1%. Here's the audit log. We're offering you the same infrastructure."

**Result:** Not pitching. Showing.

---

# What's Built & Working

## Technical Implementation

| Component | Status | Technology |
|-----------|--------|------------|
| WhatsApp webhook | ✅ Working | Meta Cloud API |
| AI intake conversation | ✅ Working | Claude API |
| Consumer/conversation management | ✅ Working | Supabase |
| Intent structuring | ✅ Working | Claude + custom prompts |
| Business matching (DISCOVER) | ✅ Working | NOMOS scoring algorithm |
| Sequential dispatch | ✅ Working | 15-min exclusive windows |
| Business notifications | ✅ Working | WhatsApp + templates |
| Business dashboard | ✅ Working | Next.js + Tailwind |
| Admin panel | ✅ Working | Database-backed roles |
| Trust score system | ✅ Working | Rating-based calculation |
| NOMOS contract schema | ✅ Working | Full machine-readable format |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  INTERFACE LAYER                                                │
│  WhatsApp Business API                                          │
│  (Zero friction, natural language, trusted, 95% penetration)    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  INTELLIGENCE LAYER                                             │
│  Claude API (Anthropic)                                         │
│  (Intent extraction, clarifying questions, natural responses)   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PROTOCOL LAYER                                                 │
│  NOMOS v0.1.0                                                   │
│  (Machine-readable contracts, scoring, state machine)           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  COORDINATION LAYER                                             │
│  Sequential Dispatch System                                     │
│  (Fair distribution, accountability, timeout handling)          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  DATA LAYER                                                     │
│  Supabase (PostgreSQL)                                          │
│  (RLS, realtime subscriptions, audit trails)                    │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Cost |
|-------|------------|------|
| Frontend | Next.js 14 | — |
| Hosting | Vercel | 75 QAR/mo |
| Database | Supabase Pro | 350 QAR/mo |
| AI | Claude API | ~100-300 QAR/mo |
| Messaging | WhatsApp Cloud API | 50-200 QAR/mo |
| **Total** | | **~575-925 QAR/mo** |

---

# Go-To-Market Strategy

## Launch Strategy: Supply First

Onboard businesses before launching consumer side. When the first request comes in, providers must be ready to respond.

### Week 1-2: Seed Supply
- Identify 50 home service businesses in Doha
- Offer first 3 months free — zero risk
- Pitch: "We send you customers who already want your service"
- Target businesses active on Instagram — they understand digital
- Manually onboard 20-30 with full profiles

### Week 3-4: Seed Demand
- Launch WhatsApp number via personal network
- Post in Qatar Facebook groups, Reddit, community WhatsApp
- Message: "Need a home service in Doha? Message this number and we'll find the best one for you. Free."
- Target 50-100 requests in month one

### Month 2-3: Validate & Iterate
- Measure: match rate, response time, satisfaction
- Identify strongest demand categories
- Refine AI prompts based on real conversations
- Convert free businesses to Starter tier
- Target: 200+ requests/month, 40+ paying businesses

### Month 4-6: Expand & Monetize
- Add second vertical (food/catering or automotive)
- Launch Growth tier for top performers
- Referral program: businesses recruit businesses
- Target: 500+ requests/month, 100+ businesses, 40K+ QAR MRR

## First Vertical: Home Services

**Why home services:**
- High urgency (AC broken in Qatar = emergency)
- High frequency (year-round demand)
- High frustration with current discovery (Instagram DMs, word of mouth)
- Qatar's climate makes AC services alone a perpetual demand engine

---

# Long-Term Vision

## The Agent-to-Agent Future

```
┌─────────────────────────────────────────────────────────────────┐
│  TODAY (NIDA MVP)                                               │
│  Human Consumer → AI Intake → Protocol Matching → Human Biz     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  TOMORROW (V2)                                                  │
│  Human Consumer → AI Agent → NOMOS Protocol → AI Agent (Biz)    │
│                                                                 │
│  Business sets rules once, agent handles leads 24/7             │
│  Auto-accept, auto-negotiate, auto-schedule                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  THE FUTURE                                                     │
│  AI Agent (Consumer) ←→ NOMOS Protocol ←→ AI Agent (Business)   │
│                                                                 │
│  "My home agent schedules all maintenance"                      │
│  "My AC agent negotiates repair before I notice the problem"    │
│  "My car agent books service while I sleep"                     │
└─────────────────────────────────────────────────────────────────┘
```

## Geographic Expansion

| Phase | Market | Timeline |
|-------|--------|----------|
| 1 | Qatar (Doha) | Now |
| 2 | UAE (Dubai) | Month 12+ |
| 3 | Saudi Arabia (Riyadh) | Month 18+ |
| 4 | Wider GCC | Month 24+ |

## The Logic Exchange

The endgame for NOMOS:

> A marketplace where governance contracts are bought, sold, and licensed.

- Best-performing AC repair contract in Doha → licensed to Dubai operators
- Bank's loan approval logic → licensed to fintechs
- Insurance claims workflow → licensed to insurtech startups

**Nida is the first inventory source.** 500+ live contracts with performance data before the exchange opens.

---

# Why Now

## Converging Trends

1. **AI is finally good enough** — LLMs can conduct natural conversations and extract structured data reliably

2. **WhatsApp is universal** — 95%+ penetration in target markets, zero adoption friction

3. **Meta ads are failing SMBs** — Cost inflation, declining ROI, growing frustration

4. **Agent-to-agent commerce is emerging** — The infrastructure layer is being built now; first movers win

5. **Qatar is underserved** — No dominant local services platform, first-mover advantage

## Why This Team

- Deep understanding of local commerce dynamics
- Track record of connecting complex ideas to practical applications
- Built Vatrina (Qatar commerce intelligence)
- Authored work on AI governance and agent systems
- Technical capability to build and ship quickly
- Network in Qatar business community

---

# Investment Opportunity

## Use of Funds

| Allocation | Purpose |
|------------|---------|
| **40%** | Engineering (full-time hire, infrastructure) |
| **30%** | Business development (Qatar expansion, business recruitment) |
| **20%** | Marketing (consumer acquisition, brand) |
| **10%** | Operations (legal, compliance, overhead) |

## Milestones

| Timeline | Milestone |
|----------|-----------|
| Month 3 | 100+ paying businesses, 12K QAR MRR |
| Month 6 | 200+ businesses, 40K QAR MRR, second vertical |
| Month 12 | 400+ businesses, 100K+ QAR MRR, UAE exploration |
| Month 18 | Regional expansion, enterprise NOMOS pilots |

## The Opportunity

Nida is not just another marketplace. It's:

1. **A proven alternative to Meta ads** — 90% lower cost per qualified lead
2. **The first live deployment of NOMOS Protocol** — Autonomous agent commerce working in production
3. **Infrastructure for agent-to-agent commerce** — The TCP/IP of local services
4. **A dual-path strategy** — Consumer revenue funds enterprise expansion

**The protocol that handles AC repairs today handles bank loans tomorrow.**

---

# Summary

**Nida inverts advertising.** Consumers declare needs, AI agents match them to businesses, everyone wins except Meta.

**The innovation stack:**
- WhatsApp as zero-friction interface
- AI-native conversational intake
- NOMOS Protocol for machine-readable contracts
- Sequential dispatch for fair competition
- Trust scores for quality flywheel

**What's built:** Full platform running in production, ready for business recruitment.

**The economics:** First revenue in 35 days. 97% margins. Self-funding by Month 6.

**The vision:** Agent-to-agent commerce infrastructure. Proving it works with plumbers. Scaling it to banks.

**The ask:** Partner with us to build the commerce infrastructure layer for the AI age.

---

*Nida: You call. The right one answers.*

نداء
