NOMOS PROTOCOL
v0.1.0
Executable Governance for Nida
Machine-readable service contracts. Autonomous agent negotiation. The infrastructure layer that makes intent marketplaces work.
Contract Schema
Agent Protocol
Execution Flow
Live Simulation
This is what a real NOMOS service contract looks like when CoolTech AC Services publishes their offering. Every field is machine-readable. An AI agent can parse this, evaluate compatibility with a consumer's need, negotiate pricing within the defined rules, and execute a booking — all without human intervention.

Click any top-level field to see what it does and why it matters.

{
"nomos_version": ▸"0.1.0",
"contract_type": ▸"service_offering",
"issuer": ▸
{
"entity_id": "biz_ac_cooltech_0042",
"entity_type": "business",
"display_name": "CoolTech AC Services",
"trust_score": 87,
"verified": true
}
,
"service": ▸
{
"category": "home_services.hvac.repair",
"description_human": "AC repair and maintenance for residential units",
"capabilities": ["diagnosis", "repair", "gas_refill", "filter_replacement", "full_service"],
"constraints":
{
"unit_types": ["split", "window", "central", "ducted"],
"brands_serviced": ["*"],
"brands_excluded": []
}
}
,
"pricing": ▸
{
"model": "tiered",
"currency": "QAR",
"rules":
[
{
"capability": "diagnosis",
"base": 100,
"range": [80, 150],
"negotiable": true
}
,
{
"capability": "repair",
"base": 350,
"range": [200, 600],
"negotiable": true,
"note": "depends_on_parts"
}
,
{
"capability": "gas_refill",
"base": 200,
"range": [180, 250],
"negotiable": false
}
,
{
"capability": "filter_replacement",
"base": 80,
"range": [60, 120],
"negotiable": true
}
,
{
"capability": "full_service",
"base": 450,
"range": [400, 550],
"negotiable": true
}
]
,
"bundle_discount":
{
"threshold": 2,
"discount_pct": 10
}
,
"urgency_multiplier":
{
"same_day": 1.5,
"next_day": 1.2,
"standard": 1
}
}
,
"availability": ▸
{
"timezone": "Asia/Qatar",
"operating_hours":
{
"weekdays": ["08:00", "18:00"],
"weekends": ["09:00", "14:00"]
}
,
"lead_time_hours":
{
"minimum": 4,
"preferred": 24
}
,
"blackout_dates": [],
"capacity":
{
"max_daily_jobs": 6,
"current_load": 0.4
}
}
,
"service_area": ▸
{
"type": "zones",
"zones": ["the_pearl", "west_bay", "lusail", "al_sadd", "al_dafna"],
"surcharge_zones":
[
{
"zone": "al_wakrah",
"surcharge_qar": 50
}
]
}
,
"terms": ▸
{
"warranty_days": 30,
"cancellation_policy":
{
"free_cancel_hours": 12,
"late_cancel_fee_qar": 50
}
,
"payment_methods": ["cash", "card", "bank_transfer"],
"escrow_supported": true,
"dispute_resolution": "platform_mediated"
}
,
"agent_instructions": ▸
{
"auto_accept":
{
"enabled": true,
"conditions":
{
"max_negotiation_rounds": 3,
"min_price_pct": 85,
"required_lead_time_hours": 6,
"zones": ["the_pearl", "west_bay", "lusail"]
}
}
,
"escalate_to_human":
{
"triggers": ["price_below_min", "custom_request", "dispute", "out_of_zone"]
}
}
,
"metadata": ▸
{
"published_at": "2026-03-20T10:00:00+03:00",
"expires_at": "2026-06-20T10:00:00+03:00",
"version": 3,
"schema_ref": "nomos://schemas/service_offering/v0.1.0"
}
}


The NOMOS agent protocol defines how two AI agents interact through a service contract. There are five message types, and every negotiation follows a strict state machine.

MESSAGE TYPES
DISCOVER
Consumer Agent → Platform
Agent publishes a structured intent. Platform returns matching contracts ranked by compatibility score.
{ intent: "hvac.repair", location: "the_pearl", urgency: "next_day", budget_max: 400 }
PROPOSE
Consumer Agent → Business Agent
Agent selects a contract and proposes specific terms: this capability, this date, this price (within the contract's negotiable range).
{ contract_ref: "biz_ac_cooltech_0042/v3", capability: "repair", proposed_price: 280, proposed_date: "2026-03-22", proposed_time: "10:00" }
COUNTER
Business Agent → Consumer Agent
Business agent evaluates the proposal against contract rules. If price is below range but negotiable, it counters. If auto-accept conditions are met, it skips to ACCEPT.
{ counter_price: 320, reason: "below_base_for_repair", counter_date: "2026-03-22", counter_time: "14:00", rounds_remaining: 2 }
ACCEPT
Either Agent → Either Agent
Terms agreed. Both agents sign the execution record. Consumer gets confirmation. Business gets the job on their calendar. Payment terms activate.
{ execution_id: "exec_0918374", agreed_price: 300, agreed_date: "2026-03-22T14:00+03:00", warranty_days: 30, payment: "escrow_on_completion" }
ESCALATE
Either Agent → Human
Agent hits a trigger it can't resolve autonomously: price below absolute minimum, custom request outside capabilities, dispute. Hands off to human with full context.
{ reason: "price_below_min", context: { proposed: 150, contract_min: 200 }, human_action_required: "approve_exception_or_decline" }
NEGOTIATION STATE MACHINE
IDLE ──DISCOVER──→ MATCHING
MATCHING ──contracts_found──→ PROPOSING
PROPOSING ──PROPOSE──→ NEGOTIATING
NEGOTIATING ──COUNTER──→ NEGOTIATING (max N rounds)
NEGOTIATING ──ACCEPT──→ EXECUTING
NEGOTIATING ──max_rounds──→ ESCALATED | DECLINED
NEGOTIATING ──trigger_hit──→ ESCALATED
EXECUTING ──service_complete──→ SETTLED
EXECUTING ──dispute_raised──→ DISPUTED
PROTOCOL GOVERNANCE RULES
Max negotiation rounds
Defined per-contract (default: 3)
Prevents infinite loops. Forces convergence.
Price floor enforcement
Agents cannot accept below contract minimum
Protects businesses from race-to-bottom. The contract IS the authority.
Timeout per round
5 minutes for auto-pilot, 24 hours for human escalation
Consumer experience degrades with delays. Speed is a trust signal.
Immutable execution record
Once ACCEPT is sent, terms are locked
Both parties can reference exact agreed terms. Disputes resolve against this record.
Schema validation
Every message validated against NOMOS schema before processing
Malformed messages are rejected, not interpreted. Prevents agent manipulation.
Audit trail
Every message in every negotiation is logged with timestamps
Full transparency. Either party can request the complete interaction history.


Here's what happens end-to-end when a consumer in The Pearl messages "My AC is making a weird clicking noise, need someone this week."

0:00
Consumer sends WhatsApp message
"My AC is making a weird clicking noise, I'm in The Pearl, need it fixed this week if possible. Budget around 300-400."
0:01
AI conducts intake conversation
2 clarifying messages: 'Is this a split or central unit?' → 'Split' | 'Is the unit still cooling or completely stopped?' → 'Still cooling but noisy'
0:03
Structured intent created
{ category: hvac.repair, location: the_pearl, urgency: this_week, budget: [300,400], unit_type: split, symptom: clicking_noise_while_running }
0:03
DISCOVER → Platform matches contracts
4 HVAC contracts match. Ranked by: compatibility (100% for all), trust_score (87, 82, 79, 71), capacity (CoolTech at 40% load wins), price fit (CoolTech repair base 350, within budget).
0:04
PROPOSE → Consumer agent proposes to top match
Sends proposal to CoolTech: repair capability, 320 QAR (slightly below base but within negotiable range), March 22, morning preferred.
0:04
Business agent evaluates proposal
CoolTech agent checks: 320 < base(350) but > min(200) ✓ | zone: the_pearl ✓ | lead_time: 48hrs > 6hrs required ✓ | auto-accept min_price_pct: 320/350 = 91% > 85% ✓
0:04
COUNTER → Business agent counters
Counter: 340 QAR (midpoint negotiation), confirms March 22, offers 14:00 slot (morning fully booked). Rounds remaining: 2.
0:05
Consumer agent evaluates counter
340 within consumer budget [300-400] ✓ | Afternoon acceptable (consumer didn't say 'must be morning') ✓ | Agent accepts without another round.
0:05
ACCEPT → Execution record created
exec_id: exec_0918374 | price: 340 QAR | date: March 22 14:00 | warranty: 30 days | payment: cash on completion | cancellation: free until March 21 02:00
0:06
Consumer gets WhatsApp confirmation
"Your AC repair is booked! CoolTech AC Services will visit The Pearl on March 22 at 2:00 PM. Cost: 340 QAR. 30-day warranty included. Free cancellation until tomorrow at 2 AM."
0:06
Business gets notification
CoolTech dashboard + WhatsApp: New confirmed job. Split AC, clicking noise while running. The Pearl. March 22, 14:00. 340 QAR. Consumer contact shared.
TOTAL ELAPSED TIME
~6 minutes from "my AC is clicking" to confirmed booking with price, date, warranty, and cancellation terms.
The consumer sent 3 messages. Everything else was autonomous. The business owner didn't touch anything — their agent handled it based on contract rules they set once.


Watch the full NOMOS protocol execute in real time. A consumer message becomes a structured intent, agents negotiate autonomously, and a booking is confirmed — all in under a minute.

▶ Run Protocol Simulation

Watch the full NOMOS protocol execute in real time. A consumer message becomes a structured intent, agents negotiate autonomously, and a booking is confirmed — all in under a minute.

NOMOS PROTOCOL v0.1.0 — LIVE EXECUTION
● COMPLETE
CONSUMER
My AC is making a weird clicking noise. I'm in The Pearl. Can someone fix it this week? Budget around 300-400 QAR.
INTAKE AI
I can help you find an AC repair service. Quick question — is this a split unit or central/ducted system?
CONSUMER
Split unit
INTAKE AI
Got it. Is the AC still cooling or has it stopped working completely?
CONSUMER
Still cooling, just noisy
PROTOCOL
INTENT STRUCTURED → { hvac.repair | the_pearl | split | clicking_noise | budget: 300-400 | urgency: this_week }
PROTOCOL
DISCOVER → 4 contracts matched. Top: CoolTech AC (trust: 87, capacity: 40%, base: 350 QAR)
CONSUMER AGENT
PROPOSE → CoolTech: repair, 320 QAR, March 22, morning preferred
COOLTECH AGENT
EVALUATING → price: 91% of base ✓ | zone: the_pearl ✓ | lead_time: 48h ✓ | auto-accept threshold: 85% ✓
COOLTECH AGENT
COUNTER → 340 QAR, March 22 14:00 (morning full). Rounds remaining: 2
CONSUMER AGENT
EVALUATING → 340 within budget [300-400] ✓ | afternoon acceptable ✓ | accepting
PROTOCOL
ACCEPT → exec_0918374 | 340 QAR | March 22 14:00 | 30-day warranty | free cancel until March 21 02:00
NIDA
✓ Your AC repair is booked! CoolTech AC Services will visit The Pearl on March 22 at 2:00 PM. Cost: 340 QAR, with a 30-day warranty. Free cancellation until tomorrow 2 AM.
Transaction complete. 3 consumer messages → autonomous negotiation → confirmed booking.
Reset