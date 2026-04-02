NIDA
Market & Financial Snapshot
NIDA Numbers & Core Concept
REF: NIDA-01
Core Concept
NIDA is a WhatsApp-first intent routing platform for urgent home services in Qatar. Consumers send a request through WhatsApp and AI dispatches the job to the best provider.

Example interaction:
"AC repair needed in West Bay."
The system extracts intent, ranks providers, and dispatches the job.
Market Pain vs. NIDA Economics
Current acquisition model used by service businesses relies on advertising on platforms like Meta, leading to high waste and low intent.

Current Market
Cost per qualified lead
100–250 QAR
Advertising waste
70–80%
Monthly ad spend
2,000+ QAR
Lead quality
Inconsistent
Most leads are unqualified or irrelevant.

NIDA Economics
Cost per qualified lead
7–15 QAR
Advertising waste
~0%
Customer acquisition
Intent-based
Interface
WhatsApp message
Consumers declare intent → AI matches → provider accepts.

Subscription Model
Service providers pay a monthly subscription. One completed job typically pays for the entire subscription.

Tier	Price	Target
Starter	150 QAR/month	Solo technicians
Growth	400 QAR/month	Small companies
Premium	800 QAR/month	Established providers
Financial Projections
Revenue Growth Projection
Period	Businesses	Requests/mo	Revenue
Week 5	40	140	1,500 QAR
Month 3	80	500	12,000 QAR
Month 6	180	1,200	40,000 QAR
Month 12	400	3,000	105,000 QAR
Year 1 Targets
Total revenue
840,000 QAR
Paying businesses
300+
Monthly requests
3,000+
Net margin
~95%
Infrastructure costs are extremely low because the platform runs primarily on messaging and AI automation.

NIDA Core Concept
Page 1 of 5
NIDA
Functionality & Competition
Market Position & Core Engine
REF: NIDA-02
Strategic Market Position
Current service platforms in Qatar (Syaanh, Aldobi, Home Hero Qatar) operate as search marketplaces. Instead of browsing listings, NIDA introduces intent routing—automatically connecting the consumer with the best provider.

Typical Marketplace
Search → browse → compare → negotiate.

Consumers want resolution, not options. Searching creates friction for high-urgency needs.

NIDA Model
Message → AI match → provider accepts.

Resembles dispatch systems like Uber, tailored for urgent home services (e.g. AC repair).

Platform Comparison
Feature	NIDA	Typical Marketplace
Consumer interface	WhatsApp messaging	Website / mobile app
Service request	Natural language	Form-based
Matching	AI intent extraction	Manual browsing
Dispatch	Sequential best-match	Multiple providers contacted
Consumer effort	One message	Search + compare
Matching Algorithm
Providers are ranked for each request based on a weighted scoring algorithm:

Category match
30%
Location zone
25%
Price fit
15%
Capacity
15%
Trust score
15%
Trust System
The Trust Score (15% of match weight) is calculated using:

Customer ratings
40%
Response rate
25%
Completion rate
25%
Account age
10%
Automation Layer
Businesses can configure AI agents to automatically accept jobs based on rules (category, price, zone, timing), enabling 24/7 automated operations.
Long-Term Infrastructure
NIDA is built on NOMOS, a programmable governance protocol that allows service transactions to be structured as machine-readable agreements.

01 Automated dispatch
02 AI negotiation
03 Agent-to-agent commerce

## Khadoom: Complementary, Not Competitive

Khadoom (launched Dec 2024) is Qatar's AI-powered personal assistant for errands via WhatsApp.

| Aspect | Khadoom | NIDA |
|--------|---------|------|
| **Focus** | Errands (groceries, parcels, laundry) | Home services (AC, plumbing, cleaning, pest control, etc.) |
| **Fulfillment** | Own fleet (200+ drivers) | Provider network (marketplace) |
| **Model** | Per-task concierge fee | Provider subscriptions |
| **Moat** | Operations (drivers) | Protocol (NOMOS) + Trust data |
| **Scaling** | Heavy ops (hire drivers) | Light ops (onboard providers) |

**Key insight:** Khadoom handles "fetch" tasks (deliveries). NIDA handles "do" tasks (services at your home). No direct overlap.

**Complementary potential:** Consumer has one WhatsApp, system routes: errands → Khadoom, home services → NIDA.

## Why WhatsApp Interface Isn't the Moat

Khadoom proves that WhatsApp + AI is replicable. NIDA's real moats are structural:

| Surface Feature | Why It's Not a Moat | NIDA's Structural Moat |
|-----------------|---------------------|------------------------|
| WhatsApp interface | Anyone can use WhatsApp API | **NOMOS Protocol** — providers as programmable contracts |
| AI chat | ChatGPT/Claude available to all | **Sequential Dispatch** — fair allocation, not spam |
| Lead capture | Basic feature | **Two-Sided Trust** — consumer reputation (novel) |
| Matching | Can be copied | **Intent Data** — structured demand becomes proprietary |

**Why Syaanh/Aldobi can't easily copy:**
- Would require complete architecture rewrite
- Their listings aren't machine-readable contracts
- No consumer reputation system
- Bidding model conflicts with sequential dispatch

NIDA Functionality & Competition
Page 2 of 5
NIDA
Current Platform Capabilities
Intent Routing & Automated Dispatch
REF: NIDA-03
NIDA is a fully operational intent routing platform for local services, built around messaging-first interaction and automated dispatch.

Consumer Interface
Consumers request services through WhatsApp.

text messages
photos or videos of the issue
voice notes
Example request:
"AC repair needed in West Bay."
The system automatically interprets the request and initiates service dispatch.
Consumers receive updates including:
provider assigned
service confirmation
job completion notifications
AI Intent Engine
The platform uses natural language processing to convert messages into structured service requests.

Extracted attributes include:
service category
geographic location
urgency level
time preferences
budget signals
If required information is missing, the system asks follow-up questions.

Provider Network
Service providers maintain structured profiles containing:

service categories
service zones
pricing ranges
availability
qualifications
This database forms the supply layer

Dispatch Engine
NIDA routes service requests using an automated ranking system. Requests are dispatched sequentially.

The highest ranked provider receives the request first. If declined or unanswered, the system moves to the next provider.
This eliminates the lead spam common in traditional marketplaces.

Trust & Automation Layer
The platform continuously evaluates provider reliability. Higher trust scores result in more frequent dispatch priority.

Automated Rules
Service providers can configure rules to operate continuously without manual intervention:

→
accept within defined service zones
→
accept above a specified price threshold
→
accept within working hours
NOMOS Protocol Infrastructure
NIDA operates on the NOMOS coordination protocol, which structures service requests as machine-readable agreements.

programmable dispatch rules
automated trust scoring
AI-assisted negotiation
agent-to-agent coordination
NIDA integrates messaging, AI intent extraction, automated dispatch, trust scoring, and programmable service agreements into a single platform.

Consumers simply send a message.
The system coordinates the service automatically.

## Two-Sided Trust: The Rating Innovation

Traditional platforms: consumers rate businesses, businesses absorb it, nothing changes.

NIDA's approach: **First mutual rating system in services.**

### How It Works
1. **Smart Timing** — AI detects service completion from conversation
2. **Conversational Rating** — "How did the AC repair go?" (not "Rate 1-5")
3. **Mutual Rating** — Both parties rate simultaneously, blind reveal
4. **AI Insights** — Patterns generate actionable recommendations

### Consumer Reputation (Novel)

| Behavior | Impact | Effect |
|----------|--------|--------|
| Shows up on time | +Trust | Matched with top providers |
| Pays promptly | +Trust | Priority dispatch |
| Communicates clearly | +Trust | Better service experiences |
| No-shows | -Trust | Lower priority matching |

**Result:** Premium consumers get premium service. Bad actors filtered on both sides.

### Business Value

| Stakeholder | Benefit |
|-------------|---------|
| **Businesses** | Actionable insights, not just scores. Know exactly what to improve. Avoid problem customers. |
| **Consumers** | Build reputation for priority matching. Honest feedback environment. Better matches over time. |
| **NIDA** | Trust layer that makes the marketplace work. Data moat that compounds. Network effects on both sides. |

NIDA: Current Platform Capabilities
Page 3 of 5
NIDA
Why NIDA Is Inevitable
The Shift from Search to Intent
REF: NIDA-04
"Consumers are not looking for information. They are looking for resolution."

The internet has historically organized services around search. Consumers must search, browse, compare, contact, and negotiate.

This workflow made sense when websites were the primary interface. But consumer behavior has changed. Messaging platforms such as WhatsApp have become the dominant interface for everyday coordination.

People increasingly ask instead of search.

The Evolution of Service Platforms
Early internet
Websites
Search directories
Marketplace era
Mobile apps
Listing marketplaces
Next gen
Messaging
Intent routing
Why The Timing Is Right
Three technological shifts make this model possible now:

Shift 01
Messaging-First
Messaging has replaced websites as the primary coordination layer. WhatsApp alone serves billions of users globally.

Shift 02
AI Intent Extraction
Natural language systems can now reliably interpret unstructured requests into structured service requests.

Shift 03
NOMOS Contracts
Service transactions become machine-readable agreements, enabling automated dispatch and AI negotiation.

The NOMOS Advantage & Network Effects
Without NOMOS:
NIDA functions as a marketplace.
Marketplaces connect buyers and sellers.

With NOMOS:
NIDA becomes a coordination protocol.
Protocols enable machines to coordinate transactions automatically.

Over time, this allows AI agents representing consumers and businesses to transact directly through structured rules.

The Data & Trust Moat
NIDA becomes stronger as usage grows, creating a moat that competitors struggle to replicate.

More consumers → more intent data
More providers → faster dispatch
Higher matching accuracy & trust
NIDA: The Shift to Intent
Page 4 of 5
NIDA
Category Creation
From Marketplaces to Intent Infrastructure
REF: NIDA-05
Most service platforms compete in the same category: Service marketplaces. This model improved discovery but did not solve service coordination. Consumers still manage the process themselves.

The Category NIDA Creates
Intent Routing Platforms
Instead of browsing providers, consumers simply declare their need.

The system interprets the request and automatically routes the job to the most suitable provider.

The platform becomes a dispatch system for services, resembling the operational logic used by Uber in transportation.

User Behavior:
"They no longer browse. They ask."
The Monopoly Opportunity
The strongest companies dominate new categories, not crowded markets.

If positioned as:
"another home services app"

It would compete with dozens of platforms in a crowded market.

If positioned as:
The default interface for requesting services

Then it controls the demand gateway. Owning demand is the most powerful position in any marketplace.

The Platform Flywheel
Demand → Supply → Data → Better Matching
More Consumers
More Requests
More Providers
Faster Fulfillment
More Transactions
Better Trust Scoring
Over time, the platform becomes the default coordination layer for services.
Positioning Summary
Consumer Layer
Urgent home services via WhatsApp.
Market Category
Intent routing platform for services.
Infrastructure Layer
Programmable service coordination powered by NOMOS.
"Search marketplaces help people find providers.
Intent routing platforms help people solve problems instantly."

NIDA Category Creation
Page 5 of 6

---

NIDA
Bootstrap Economics
Path to Self-Sustaining Operations
REF: NIDA-06

## Why No External Funding Needed

NIDA's unit economics enable bootstrap to profitability.

### Infrastructure Costs

| Component | Monthly Cost |
|-----------|-------------|
| Vercel (hosting) | 75 QAR |
| Supabase Pro | 350 QAR |
| Claude API | 100-300 QAR |
| WhatsApp API | 50-200 QAR |
| **Total** | **575-925 QAR** (~$160-255) |

### Path to Break-Even

| Phase | Timeline | Economics |
|-------|----------|-----------|
| Launch | Week 1-4 | ~925 QAR/mo costs |
| First Revenue | Week 5 | 1,500 QAR MRR |
| Break-even | Week 6 | ~10 paying businesses |
| Operational Profit | Month 6 | 40,000 QAR MRR |
| Self-sustaining | Month 6+ | 95% margins |

### Why This Works

- One Premium subscriber (800 QAR) nearly covers monthly infrastructure
- 97% gross margins mean every subscriber is profitable
- No inventory, no drivers, no heavy operations
- Software scales; operations don't

**Bottom line:** NIDA becomes self-sustaining at ~40 paying businesses.
No external funding required to reach profitability.

### Testing the Platform

To experience NIDA yourself:
1. **Demo Video** — Walkthrough of the WhatsApp flow available on request
2. **Sandbox Number** — Test WhatsApp number for partner trials
3. **Dashboard Access** — Admin view of the business dashboard
4. **Live Demo** — Scheduled walkthrough on a call

NIDA Bootstrap Economics
Page 6 of 6
