# نداء · NIDA
### *You call. The right one answers.*

---

## What is Nida?

Nida is an AI-powered service marketplace for Qatar. It connects people who need urgent home services — plumbing, AC repair, cleaning, electrical, and more — with the right verified provider, automatically, in minutes, entirely over WhatsApp or Telegram.

**No apps. No forms. No waiting.**

---

## The Problem It Solves

**For consumers:** Finding a reliable plumber or electrician in Qatar means scrolling Instagram, DMing five businesses, waiting hours for a reply, and still not knowing who will show up.

**For businesses:** They spend 2,000–5,000 QAR/month on Meta ads to reach people who may not even need their service. Most leads are unqualified. Cost per real lead: 100–250 QAR.

---

## The Full Flow — Step by Step

### Consumer Side

**1. Consumer sends a message**
They open WhatsApp or Telegram and describe what they need in plain language:
> *"I need AC repair in West Bay, it stopped cooling. Budget 300–400 QAR, need it today."*

**2. Nida's AI conducts a brief intake**
In 2–3 conversational messages, Nida extracts: service type, location, urgency, budget, and specifics. No forms. Just a natural chat.

**3. Nida confirms and starts searching**
The consumer immediately receives: *"✅ Found 3 matching providers! I've notified the top match — they have 15 minutes to accept. Sit tight."*
The consumer is kept informed at every step — they're never left wondering what's happening.

**4. Provider responds**
- If the provider **accepts**: the consumer instantly receives the provider's name, phone number, and confirmation. The job is locked in.
- If the provider **declines or doesn't respond** within 15 minutes: Nida automatically escalates to the next best match and notifies the consumer that the search is continuing.

**5. Job completed → Rating**
After the job, both parties receive a rating request. The consumer rates the provider; the provider rates the consumer. Ratings feed back into future matching — quality providers rise, poor ones fall.

---

### Business (Provider) Side

**1. Business registers on the platform**
They fill out a profile: service categories, service zones, pricing model, lead time, and availability. Advanced providers can upload a `.nomos` contract — a machine-readable file that enables precise AI matching.

**2. Business connects WhatsApp and/or Telegram**
Leads arrive on the channel they prefer, in real time. For Telegram, businesses link their account via a one-time code — no manual setup needed.

**3. Business receives a lead notification**
The message includes: service type, location, urgency, budget, and match score. Two buttons: **Accept** or **Decline**. One tap.

**4. Business accepts → Job confirmed**
On acceptance:
- The consumer's contact details are shared with the provider immediately
- An execution record is created on the platform
- The consumer is notified with the provider's contact

**5. Business dashboard**
A full web dashboard at nida.qa/dashboard where businesses can:
- View all incoming and past leads
- See match scores and ranking breakdowns
- Edit their profile and service zones
- Upload or download their `.nomos` contract
- Connect Telegram for instant alerts
- Track job history and ratings

---

## Keeping Everyone in the Loop

Nida sends status updates at every stage of the exchange:

| Event | Consumer notified | Business notified |
|-------|-------------------|-------------------|
| Intent received | ✅ Searching... | — |
| Match found | ✅ Top match notified | ✅ Lead sent |
| Provider accepted | ✅ Contact shared | ✅ Consumer contact shared |
| Provider declined / timed out | ✅ Searching next match | — |
| No providers found | ✅ Saved, will notify when available | — |

For urgent requests (ASAP / same day), Nida blasts all available channels simultaneously — WhatsApp, Telegram, and email — so no lead is missed.

---

## The NOMOS Protocol — More Than Matching

Most platforms match on keywords. NOMOS is a full autonomous commerce protocol — it governs the entire transaction lifecycle from first contact to job completion, entirely between AI agents.

### What a NOMOS contract defines

Each service provider publishes a machine-readable contract that specifies:

- **What they offer** — precise service categories (e.g. `home_services.hvac.repair`) and capabilities
- **Where they operate** — service zones and any surcharge areas
- **Their pricing** — model (fixed / hourly / quote), price rules per capability, urgency multipliers
- **Their availability** — operating hours, lead time, current capacity (0–100%)
- **Agent instructions** — the rules the AI must follow on their behalf:
  - *Auto-accept conditions*: "Accept automatically if price ≥ 300 QAR, location is West Bay, and lead time > 2 hours"
  - *Escalation triggers*: "Escalate to me if the job value exceeds 1,000 QAR, it's a first-time customer, or the request is outside my primary zones"
  - *Max negotiation rounds*: how many counter-offers the AI can make before handing off to a human
- **Terms** — warranty period, cancellation policy (free cancellation window + fee percentage)

### The protocol's message flow

```
DISCOVER  →  AI finds and ranks matching providers
PROPOSE   →  Provider's AI sends a quote/terms
COUNTER   →  Consumer's AI counter-proposes
ACCEPT    →  Terms agreed autonomously
ESCALATE  →  Human takes over (triggered by contract rules)
```

In Nida's current deployment, the full DISCOVER → ACCEPT flow runs without any human input on either side — the provider's contract tells the AI exactly what to agree to. Escalation only happens when the contract says so.

### Why this matters

This is not a marketplace with a matching algorithm. It is the **infrastructure layer for agent-to-agent commerce** — the protocol that lets two AI systems negotiate and close a service transaction on behalf of their respective humans, within governance rules those humans defined in advance.

**Nida's focus:** *fix* tasks — repair, install, maintain, clean. Home services where urgency is real and a reliable provider matters. This is distinct from *fetch* tasks (delivery, errands) which other platforms handle. No overlap. Clear positioning.

Every lead scored across five dimensions at matching time: category fit, zone coverage, price fit, capacity, and trust score. The AI doesn't guess — it operates within a contract.

---

## The Business Model

Service providers pay a monthly subscription:

| Tier | Price | Who it's for |
|------|-------|--------------|
| Starter | 150 QAR/mo | Solo technicians |
| Growth | 400 QAR/mo | Small companies |
| Premium | 800 QAR/mo | Established providers |

One completed job typically covers the full month's subscription.
**Consumer side is completely free.**

---

## The Economics vs. Meta Ads

| | Meta Ads | Nida |
|--|---------|------|
| Cost per qualified lead | 100–250 QAR | 7–15 QAR |
| Who you reach | People who *might* need you | People who *already* need you *right now* |
| Lead quality | Mixed, unverified | Structured, scored, pre-qualified |
| Response time | Hours to days | Minutes |
| Ad waste | 70–80% | ~0% |

---

## What's Live Today

- ✅ WhatsApp + Telegram bots — operational
- ✅ AI conversational intake — 2–3 message flow to structured intent
- ✅ NOMOS matching engine — 5-factor scoring and ranking
- ✅ Sequential dispatch — automatic escalation with 15-minute windows
- ✅ Real-time status updates — consumer kept informed at every step
- ✅ One-tap Accept/Decline — business responds directly in chat
- ✅ Contact exchange — triggered automatically on acceptance
- ✅ Execution records — every confirmed job tracked on the platform
- ✅ Two-way rating system — post-job ratings for both sides
- ✅ Business dashboard — leads, profile, contract, history
- ✅ Telegram deep integration — one-code link, instant lead alerts
- ✅ Quiet hours — businesses set hours when they don't want to be disturbed
- ✅ Admin panel — full oversight of businesses, intents, and platform activity
- ✅ Provider CRM — database of 100+ Qatar businesses for outreach
- 🔄 Growing provider network — active outreach underway

---

## Vision

Nida starts as a home services marketplace in Qatar. The infrastructure it's built on — intent routing, machine-readable contracts, autonomous dispatch — is designed to scale across categories, geographies, and eventually, to power AI agent commerce at a regional level.

*The GCC's first infrastructure layer for the agentic economy.*

---

*Built in Qatar. For Qatar.*
**Contact:** hello@nida.qa
