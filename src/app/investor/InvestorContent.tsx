'use client';

export default function InvestorContent() {
  return (
    <div className="investor-page">
      <style jsx global>{`
        .investor-page {
          --primary: #6366f1;
          --primary-dark: #4f46e5;
          --secondary: #10b981;
          --dark: #0f172a;
          --dark-light: #1e293b;
          --gray: #64748b;
          --gray-light: #94a3b8;
          --gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);

          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--dark);
          color: white;
          line-height: 1.6;
          min-height: 100vh;
        }

        .investor-page * {
          box-sizing: border-box;
        }

        /* Navigation */
        .inv-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          padding: 1rem 2rem;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          z-index: 1000;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .inv-nav-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .inv-logo {
          font-size: 1.5rem;
          font-weight: 800;
          background: var(--gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .inv-logo-arabic {
          font-size: 1.2rem;
          margin-left: 0.5rem;
          opacity: 0.7;
        }

        .inv-nav-links {
          display: flex;
          list-style: none;
          gap: 2rem;
          margin: 0;
          padding: 0;
        }

        .inv-nav-links a {
          color: var(--gray-light);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.3s;
        }

        .inv-nav-links a:hover {
          color: white;
        }

        /* Hero */
        .inv-hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 8rem 2rem 4rem;
          background: radial-gradient(ellipse at top, rgba(99, 102, 241, 0.15) 0%, transparent 50%);
        }

        .inv-hero-content {
          max-width: 900px;
        }

        .inv-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 100px;
          font-size: 0.85rem;
          color: var(--primary);
          margin-bottom: 2rem;
        }

        .inv-hero h1 {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .inv-hero h1 span {
          background: var(--gradient);
          -webkit-background-clip: text;
          background-clip: text;
        }

        .inv-hero p {
          font-size: 1.25rem;
          color: var(--gray-light);
          margin-bottom: 3rem;
        }

        .inv-hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-top: 4rem;
          padding-top: 4rem;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .inv-stat-number {
          font-size: 3rem;
          font-weight: 800;
          background: var(--gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .inv-stat-label {
          color: var(--gray-light);
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        /* Sections */
        .inv-section {
          padding: 6rem 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .inv-section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .inv-section-label {
          display: inline-block;
          padding: 0.4rem 1rem;
          background: rgba(99, 102, 241, 0.1);
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
        }

        .inv-section-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .inv-section-subtitle {
          font-size: 1.1rem;
          color: var(--gray-light);
          max-width: 600px;
          margin: 0 auto;
        }

        /* Cards */
        .inv-card {
          background: var(--dark-light);
          border-radius: 1rem;
          padding: 2rem;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .inv-card-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .inv-card h4 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }

        .inv-card p {
          color: var(--gray-light);
          font-size: 0.95rem;
        }

        .inv-card-icon {
          width: 60px;
          height: 60px;
          background: var(--gradient);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .inv-card ul {
          margin-top: 1rem;
          list-style: none;
          padding: 0;
        }

        .inv-card li {
          padding: 0.5rem 0;
          color: var(--gray-light);
          font-size: 0.9rem;
        }

        .inv-card li::before {
          content: '✓ ';
          color: var(--secondary);
          font-weight: bold;
        }

        /* Problem Section */
        .inv-problem {
          background: linear-gradient(180deg, transparent 0%, rgba(239, 68, 68, 0.05) 50%, transparent 100%);
        }

        .inv-problem-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 4rem;
          align-items: center;
        }

        .inv-problem-content h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #ef4444;
        }

        .inv-problem-content p {
          color: var(--gray-light);
          margin-bottom: 1.5rem;
        }

        .inv-problem-stats {
          background: var(--dark-light);
          border-radius: 1rem;
          padding: 2rem;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .inv-stat-row {
          display: flex;
          justify-content: space-between;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .inv-stat-row:last-child {
          border-bottom: none;
        }

        .inv-stat-row .label {
          color: var(--gray-light);
        }

        .inv-stat-row .value {
          font-weight: 600;
          color: #ef4444;
        }

        /* Comparison */
        .inv-comparison {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          margin-bottom: 4rem;
        }

        .inv-comparison-card {
          background: var(--dark-light);
          border-radius: 1rem;
          padding: 2rem;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .inv-comparison-card.old {
          border-color: rgba(239, 68, 68, 0.3);
        }

        .inv-comparison-card.new {
          border-color: rgba(16, 185, 129, 0.3);
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, var(--dark-light) 100%);
        }

        .inv-comparison-card h4 {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
        }

        .inv-comparison-card.old h4 { color: #ef4444; }
        .inv-comparison-card.new h4 { color: #10b981; }

        .inv-comparison-card .flow {
          font-family: monospace;
          font-size: 0.9rem;
          color: var(--gray-light);
        }

        /* Steps */
        .inv-step {
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
          position: relative;
        }

        .inv-step-number {
          width: 60px;
          height: 60px;
          background: var(--gradient);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .inv-step-content {
          background: var(--dark-light);
          border-radius: 1rem;
          padding: 2rem;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .inv-step-content h4 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .inv-step-content p {
          color: var(--gray-light);
        }

        .inv-example {
          background: rgba(0,0,0,0.3);
          border-radius: 0.5rem;
          padding: 1rem;
          margin-top: 1rem;
          font-family: monospace;
          font-size: 0.85rem;
          color: var(--secondary);
        }

        /* Code Block */
        .inv-code {
          background: #0d1117;
          border-radius: 1rem;
          padding: 2rem;
          overflow-x: auto;
          border: 1px solid rgba(255,255,255,0.1);
          margin: 2rem 0;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.85rem;
          line-height: 1.8;
          color: #e6edf3;
        }

        .inv-code .key { color: #7ee787; }
        .inv-code .string { color: #a5d6ff; }
        .inv-code .number { color: #79c0ff; }
        .inv-code .boolean { color: #ff7b72; }

        /* Protocol Messages */
        .inv-protocol-messages {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
          margin: 3rem 0;
        }

        .inv-protocol-msg {
          background: var(--dark-light);
          border-radius: 1rem;
          padding: 1.5rem;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .inv-protocol-msg .name {
          font-weight: 700;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          color: var(--primary);
        }

        .inv-protocol-msg .desc {
          font-size: 0.8rem;
          color: var(--gray-light);
        }

        /* Journey */
        .inv-journey-phase {
          background: var(--dark-light);
          border-radius: 1rem;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .inv-phase-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .inv-phase-number {
          width: 40px;
          height: 40px;
          background: var(--gradient);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .inv-phase-title {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .inv-messages {
          background: rgba(0,0,0,0.3);
          border-radius: 0.75rem;
          padding: 1.5rem;
        }

        .inv-message {
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .inv-message:last-child {
          border-bottom: none;
        }

        .inv-sender {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .inv-sender.consumer { color: var(--primary); }
        .inv-sender.nida { color: var(--secondary); }
        .inv-sender.business { color: #f59e0b; }

        .inv-message-text {
          color: var(--gray-light);
          font-size: 0.95rem;
          white-space: pre-line;
        }

        /* Table */
        .inv-table {
          width: 100%;
          border-collapse: collapse;
          background: var(--dark-light);
          border-radius: 1rem;
          overflow: hidden;
        }

        .inv-table th,
        .inv-table td {
          padding: 1.25rem 1.5rem;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .inv-table th {
          background: rgba(0,0,0,0.3);
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--gray-light);
        }

        .inv-table .highlight { color: var(--secondary); font-weight: 600; }
        .inv-table .dim { color: var(--gray); }

        .inv-table .highlight-row td {
          background: rgba(99, 102, 241, 0.1);
          font-weight: 600;
        }

        .inv-table .mrr {
          color: var(--secondary);
          font-weight: 700;
        }

        /* Pricing */
        .inv-pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin: 3rem 0;
        }

        .inv-pricing-card {
          background: var(--dark-light);
          border-radius: 1.5rem;
          padding: 2.5rem;
          border: 1px solid rgba(255,255,255,0.1);
          position: relative;
        }

        .inv-pricing-card.featured {
          border-color: var(--primary);
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, var(--dark-light) 100%);
        }

        .inv-pricing-tier {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--gray-light);
          margin-bottom: 0.5rem;
        }

        .inv-pricing-price {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .inv-pricing-price span {
          font-size: 1rem;
          font-weight: 400;
          color: var(--gray-light);
        }

        .inv-pricing-desc {
          color: var(--gray-light);
          font-size: 0.9rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .inv-pricing-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .inv-pricing-card li {
          padding: 0.5rem 0;
          color: var(--gray-light);
          font-size: 0.9rem;
        }

        .inv-pricing-card li::before {
          content: '→ ';
          color: var(--secondary);
        }

        /* Dual Path */
        .inv-dual-path {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 2rem;
          align-items: stretch;
          margin: 3rem 0;
        }

        .inv-path-card {
          background: var(--dark-light);
          border-radius: 1.5rem;
          padding: 2.5rem;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .inv-path-card h5 {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--primary);
          margin-bottom: 1rem;
        }

        .inv-path-card h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .inv-path-card p {
          color: var(--gray-light);
          margin-bottom: 1.5rem;
        }

        .inv-path-meta {
          display: grid;
          gap: 0.75rem;
        }

        .inv-meta-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .inv-meta-item .label {
          color: var(--gray-light);
        }

        .inv-path-connector {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .inv-connector-line {
          width: 2px;
          flex: 1;
          background: var(--gradient);
        }

        .inv-connector-circle {
          width: 70px;
          height: 70px;
          background: var(--gradient);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 700;
          text-align: center;
          margin: 1rem 0;
          line-height: 1.3;
        }

        /* Status Grid */
        .inv-status-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin: 3rem 0;
        }

        .inv-status-item {
          background: var(--dark-light);
          border-radius: 0.75rem;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .inv-check {
          width: 24px;
          height: 24px;
          background: var(--secondary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          flex-shrink: 0;
        }

        /* Tech Grid */
        .inv-tech-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin: 3rem 0;
        }

        .inv-tech-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--dark-light);
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .inv-tech-icon {
          width: 50px;
          height: 50px;
          background: rgba(99, 102, 241, 0.2);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .inv-tech-item h5 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }

        .inv-tech-item p {
          font-size: 0.85rem;
          color: var(--gray-light);
          margin: 0;
        }

        /* Vision Timeline */
        .inv-vision-timeline {
          position: relative;
          padding-left: 3rem;
        }

        .inv-vision-timeline::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: var(--gradient);
        }

        .inv-vision-item {
          position: relative;
          margin-bottom: 3rem;
          padding-left: 2rem;
        }

        .inv-vision-item::before {
          content: '';
          position: absolute;
          left: -3rem;
          top: 0.5rem;
          width: 12px;
          height: 12px;
          background: var(--primary);
          border-radius: 50%;
          border: 3px solid var(--dark);
        }

        .inv-vision-item .label {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }

        .inv-vision-item h4 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .inv-vision-item p {
          color: var(--gray-light);
          margin: 0;
        }

        /* Financials Grid */
        .inv-financials-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          margin: 3rem 0;
        }

        .inv-financial-card {
          background: var(--dark-light);
          border-radius: 1rem;
          padding: 2rem;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .inv-financial-value {
          font-size: 2.5rem;
          font-weight: 800;
          background: var(--gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .inv-financial-label {
          color: var(--gray-light);
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        /* CTA */
        .inv-cta {
          text-align: center;
          padding: 8rem 2rem;
          background: radial-gradient(ellipse at center, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
        }

        .inv-cta h2 {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .inv-cta p {
          font-size: 1.25rem;
          color: var(--gray-light);
          max-width: 600px;
          margin: 0 auto 3rem;
        }

        .inv-cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .inv-btn {
          display: inline-block;
          padding: 1rem 2.5rem;
          border-radius: 100px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .inv-btn-primary {
          background: var(--gradient);
          color: white;
        }

        .inv-btn-secondary {
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .inv-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
        }

        /* Footer */
        .inv-footer {
          text-align: center;
          padding: 4rem 2rem;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .inv-footer .arabic {
          font-size: 3rem;
          opacity: 0.3;
          margin-bottom: 1rem;
        }

        .inv-footer .tagline {
          color: var(--gray-light);
          margin: 1rem 0 2rem;
        }

        /* Overflow control */
        .investor-page {
          overflow-x: hidden;
        }

        .inv-section {
          overflow-x: hidden;
        }

        .inv-table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin: 0 -1rem;
          padding: 0 1rem;
        }

        .inv-code {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .inv-card-grid,
          .inv-pricing-grid,
          .inv-dual-path,
          .inv-tech-grid,
          .inv-comparison {
            grid-template-columns: 1fr;
          }

          .inv-protocol-messages {
            grid-template-columns: repeat(2, 1fr);
          }

          .inv-financials-grid,
          .inv-status-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .inv-problem-grid {
            grid-template-columns: 1fr;
          }

          .inv-nav-links {
            display: none;
          }

          .inv-path-connector {
            display: none;
          }

          .inv-table {
            font-size: 0.85rem;
          }

          .inv-table th,
          .inv-table td {
            padding: 0.75rem 1rem;
          }
        }

        @media (max-width: 768px) {
          .inv-hero-stats {
            grid-template-columns: 1fr;
          }

          .inv-protocol-messages {
            grid-template-columns: 1fr;
          }

          .inv-financials-grid,
          .inv-status-grid {
            grid-template-columns: 1fr;
          }

          .inv-step {
            grid-template-columns: 1fr;
          }

          .inv-step-number {
            margin-bottom: 1rem;
          }

          .inv-section {
            padding: 4rem 1rem;
          }

          .inv-hero {
            padding: 6rem 1rem 3rem;
          }

          .inv-table {
            font-size: 0.8rem;
            min-width: 500px;
          }

          .inv-table th,
          .inv-table td {
            padding: 0.6rem 0.75rem;
            white-space: nowrap;
          }

          .inv-code {
            font-size: 0.75rem;
            padding: 1rem;
          }

          .inv-example {
            font-size: 0.8rem;
            word-break: break-word;
          }

          .inv-card {
            padding: 1.5rem;
          }

          .inv-card-grid {
            gap: 1rem;
          }

          .inv-section-title {
            font-size: 1.75rem;
          }

          .inv-cta h2 {
            font-size: 1.75rem;
          }

          .inv-cta {
            padding: 4rem 1rem;
          }

          .inv-dual-path {
            gap: 1rem;
          }

          .inv-path-card {
            padding: 1.5rem;
          }

          .inv-pricing-card {
            padding: 1.5rem;
          }

          .inv-financials-grid {
            gap: 1rem;
          }

          .inv-financial-card {
            padding: 1.5rem;
          }

          .inv-financial-value {
            font-size: 2rem;
          }
        }
      `}</style>

      {/* Navigation */}
      <nav className="inv-nav">
        <div className="inv-nav-container">
          <div className="inv-logo">NIDA <span className="inv-logo-arabic">نداء</span></div>
          <ul className="inv-nav-links">
            <li><a href="#problem">Problem</a></li>
            <li><a href="#solution">Solution</a></li>
            <li><a href="#protocol">Protocol</a></li>
            <li><a href="#business">Business Model</a></li>
            <li><a href="#financials">Financials</a></li>
            <li><a href="#vision">Vision</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero */}
      <section className="inv-hero">
        <div className="inv-hero-content">
          <div className="inv-badge">NOMOS Protocol v0.1.0 — Live in Production</div>
          <h1>The Intent Marketplace That <span>Replaces Meta Ads</span></h1>
          <p>Consumers declare needs via WhatsApp. AI agents match them to businesses autonomously. Pre-qualified leads at 90% lower cost. The first live deployment of executable governance contracts.</p>

          <div className="inv-hero-stats">
            <div>
              <div className="inv-stat-number">90%</div>
              <div className="inv-stat-label">Lower cost per qualified lead vs Meta</div>
            </div>
            <div>
              <div className="inv-stat-number">~6 min</div>
              <div className="inv-stat-label">From request to confirmed booking</div>
            </div>
            <div>
              <div className="inv-stat-number">0%</div>
              <div className="inv-stat-label">Wasted impressions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="inv-section inv-problem">
        <div className="inv-section-header">
          <div className="inv-section-label">The Problem</div>
          <h2 className="inv-section-title">Meta Ads Are Broken</h2>
          <p className="inv-section-subtitle">Every small business owner knows the frustration. Most advertising spend is wasted on people who will never convert.</p>
        </div>

        <div className="inv-problem-grid">
          <div className="inv-problem-content">
            <h3>The Waste Is Structural</h3>
            <p>Meta sells probabilistic targeting — businesses pay to show ads to people who <em>might</em> be interested. Most impressions are wasted. Most clicks are unqualified. The feedback loop is slow and opaque.</p>
            <p>Meanwhile, consumers searching for services face endless scrolling through Instagram, DMing multiple providers, waiting hours for responses, and zero accountability if the provider doesn&apos;t show up.</p>
            <p><strong>The system is broken for everyone except Meta.</strong></p>
          </div>
          <div className="inv-problem-stats">
            <h4 style={{ marginBottom: '1.5rem', color: '#ef4444' }}>Typical Meta Ads Performance</h4>
            <div className="inv-stat-row">
              <span className="label">Monthly spend</span>
              <span className="value">2,000–5,000 QAR</span>
            </div>
            <div className="inv-stat-row">
              <span className="label">Leads generated</span>
              <span className="value">30–80</span>
            </div>
            <div className="inv-stat-row">
              <span className="label">Actually qualified</span>
              <span className="value">10–20</span>
            </div>
            <div className="inv-stat-row">
              <span className="label">Cost per real lead</span>
              <span className="value" style={{ fontSize: '1.2rem' }}>100–250 QAR</span>
            </div>
            <div className="inv-stat-row">
              <span className="label">Waste rate</span>
              <span className="value" style={{ fontSize: '1.2rem' }}>70–80%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="inv-section">
        <div className="inv-section-header">
          <div className="inv-section-label">The Solution</div>
          <h2 className="inv-section-title">Nida: Demand-First Commerce</h2>
          <p className="inv-section-subtitle">Invert the funnel. Instead of businesses broadcasting to find customers, customers broadcast needs and the best business responds.</p>
        </div>

        <div className="inv-comparison">
          <div className="inv-comparison-card old">
            <h4>Traditional Model (Meta Ads)</h4>
            <div className="flow">
              Business → Broadcast → Hope someone cares → Pay regardless
            </div>
          </div>
          <div className="inv-comparison-card new">
            <h4>Nida Model</h4>
            <div className="flow">
              Consumer → Declares intent → AI matches → Best provider responds → Pay for results
            </div>
          </div>
        </div>

        <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>How It Works</h3>

        <div>
          <div className="inv-step">
            <div className="inv-step-number">1</div>
            <div className="inv-step-content">
              <h4>Consumer sends a WhatsApp message</h4>
              <p>No app download. No signup. Just describe what you need in natural language — for any urgent home problem.</p>
              <div className="inv-example">&quot;I need AC repair in West Bay, my unit is making a clicking noise. Budget around 300-400 QAR, need it fixed this week.&quot;</div>
              <div className="inv-example" style={{ marginTop: '0.5rem', opacity: 0.8 }}>&quot;Emergency plumber needed — pipe burst in my kitchen in Pearl Qatar&quot;</div>
              <div className="inv-example" style={{ marginTop: '0.5rem', opacity: 0.8 }}>&quot;Locked out of my apartment in Lusail, need a locksmith ASAP&quot;</div>
            </div>
          </div>

          <div className="inv-step">
            <div className="inv-step-number">2</div>
            <div className="inv-step-content">
              <h4>AI structures the intent</h4>
              <p>A brief conversational intake (2-3 messages) extracts all the details needed for precise matching.</p>
              <div className="inv-example">Category: HVAC Repair | Location: West Bay | Urgency: This week | Budget: 300-400 QAR</div>
              <div className="inv-example" style={{ marginTop: '0.5rem', opacity: 0.8 }}>Category: Plumbing Emergency | Location: Pearl Qatar | Urgency: Immediate | Budget: Flexible</div>
            </div>
          </div>

          <div className="inv-step">
            <div className="inv-step-number">3</div>
            <div className="inv-step-content">
              <h4>Automatic matching & scoring</h4>
              <p>The platform scores all qualified businesses by category match, zone coverage, price fit, availability, capacity, and trust score.</p>
            </div>
          </div>

          <div className="inv-step">
            <div className="inv-step-number">4</div>
            <div className="inv-step-content">
              <h4>Sequential dispatch</h4>
              <p>Top-ranked business gets an exclusive 15-minute window to accept. If they pass or timeout, next in rank gets the offer. This rewards reliability.</p>
            </div>
          </div>

          <div className="inv-step">
            <div className="inv-step-number">5</div>
            <div className="inv-step-content">
              <h4>Connection and execution</h4>
              <p>When a business accepts, consumer gets confirmation with business details, business gets consumer contact. Both connect directly.</p>
              <div className="inv-example">Total time from &quot;my AC is clicking&quot; to confirmed booking: ~6 minutes</div>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--gray-light)' }}><strong>Vertical focus:</strong> Urgent home problems — HVAC, plumbing, electrical, locksmith, appliance repair. Services where urgency drives high conversion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Innovation Stack */}
      <section className="inv-section">
        <div className="inv-section-header">
          <div className="inv-section-label">The Innovation</div>
          <h2 className="inv-section-title">Three Layers of Innovation</h2>
          <p className="inv-section-subtitle">A complete stack that reimagines how services are discovered, matched, and delivered.</p>
        </div>

        <div className="inv-card-grid">
          <div className="inv-card">
            <div className="inv-card-icon">💬</div>
            <h4>WhatsApp as Interface</h4>
            <p>95% penetration in Qatar. Zero friction onboarding. The interface they already use 50x/day becomes the commerce layer.</p>
            <ul>
              <li>Send message → Done. You&apos;re a user.</li>
              <li>Natural language, not forms</li>
              <li>Async by default</li>
              <li>Built-in trust (verified business)</li>
            </ul>
          </div>

          <div className="inv-card">
            <div className="inv-card-icon">🧠</div>
            <h4>AI-Native Intake</h4>
            <p>Instead of forcing consumers to fill forms, have a conversation. The AI extracts structured intent from natural language.</p>
            <ul>
              <li>Conversational, not transactional</li>
              <li>Clarifying questions when needed</li>
              <li>Feels like texting a helpful friend</li>
              <li>Structured output for matching</li>
            </ul>
          </div>

          <div className="inv-card">
            <div className="inv-card-icon">⚡</div>
            <h4>NOMOS Protocol</h4>
            <p>Machine-readable governance contracts that AI agents can parse, evaluate, and negotiate against autonomously.</p>
            <ul>
              <li>Executable service contracts</li>
              <li>Autonomous agent negotiation</li>
              <li>Governed decision-making</li>
              <li>Full audit trails</li>
            </ul>
          </div>
        </div>
      </section>

      {/* NOMOS Protocol */}
      <section id="protocol" className="inv-section">
        <div className="inv-section-header">
          <div className="inv-section-label">The Protocol</div>
          <h2 className="inv-section-title">NOMOS: Executable Governance</h2>
          <p className="inv-section-subtitle">Every business on Nida has a machine-readable contract that AI agents can parse, evaluate, and negotiate against.</p>
        </div>

        <div className="inv-code">
          <pre>{`{
  `}<span className="key">&quot;nomos_version&quot;</span>{`: `}<span className="string">&quot;0.1.0&quot;</span>{`,
  `}<span className="key">&quot;contract_type&quot;</span>{`: `}<span className="string">&quot;service_offering&quot;</span>{`,
  `}<span className="key">&quot;issuer&quot;</span>{`: {
    `}<span className="key">&quot;entity_id&quot;</span>{`: `}<span className="string">&quot;biz_ac_cooltech_0042&quot;</span>{`,
    `}<span className="key">&quot;display_name&quot;</span>{`: `}<span className="string">&quot;CoolTech AC Services&quot;</span>{`,
    `}<span className="key">&quot;trust_score&quot;</span>{`: `}<span className="number">87</span>{`,
    `}<span className="key">&quot;verified&quot;</span>{`: `}<span className="boolean">true</span>{`
  },
  `}<span className="key">&quot;pricing&quot;</span>{`: {
    `}<span className="key">&quot;rules&quot;</span>{`: [{ `}<span className="key">&quot;capability&quot;</span>{`: `}<span className="string">&quot;repair&quot;</span>{`, `}<span className="key">&quot;base&quot;</span>{`: `}<span className="number">350</span>{`, `}<span className="key">&quot;range&quot;</span>{`: [`}<span className="number">200</span>{`, `}<span className="number">600</span>{`] }],
    `}<span className="key">&quot;urgency_multiplier&quot;</span>{`: { `}<span className="key">&quot;same_day&quot;</span>{`: `}<span className="number">1.5</span>{` }
  },
  `}<span className="key">&quot;agent_instructions&quot;</span>{`: {
    `}<span className="key">&quot;auto_accept&quot;</span>{`: { `}<span className="key">&quot;enabled&quot;</span>{`: `}<span className="boolean">true</span>{`, `}<span className="key">&quot;min_price_pct&quot;</span>{`: `}<span className="number">85</span>{` },
    `}<span className="key">&quot;escalate_to_human&quot;</span>{`: { `}<span className="key">&quot;triggers&quot;</span>{`: [`}<span className="string">&quot;price_below_min&quot;</span>{`] }
  }
}`}</pre>
        </div>

        <h3 style={{ textAlign: 'center', margin: '3rem 0 2rem' }}>The Agent Protocol</h3>
        <p style={{ textAlign: 'center', color: 'var(--gray-light)', marginBottom: '2rem' }}>Five message types govern all interactions between consumer and business AI agents.</p>

        <div className="inv-protocol-messages">
          <div className="inv-protocol-msg">
            <div className="name">DISCOVER</div>
            <div className="desc">Consumer publishes intent, gets matching contracts</div>
          </div>
          <div className="inv-protocol-msg">
            <div className="name">PROPOSE</div>
            <div className="desc">Propose specific terms (price, date)</div>
          </div>
          <div className="inv-protocol-msg">
            <div className="name">COUNTER</div>
            <div className="desc">Counter-propose within rules</div>
          </div>
          <div className="inv-protocol-msg">
            <div className="name">ACCEPT</div>
            <div className="desc">Lock in agreed terms</div>
          </div>
          <div className="inv-protocol-msg">
            <div className="name">ESCALATE</div>
            <div className="desc">Hand off to human</div>
          </div>
        </div>

        <div className="inv-card" style={{ marginTop: '3rem' }}>
          <h4>The Innovation: Governed Autonomy</h4>
          <p>The <code style={{ background: 'rgba(99,102,241,0.2)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>agent_instructions</code> field is the breakthrough. The business sets rules once. Their AI agent operates within those rules without supervision. This is the exact same principle that regulated industries need for autonomous operations — we&apos;re proving it works at the service business level.</p>
        </div>
      </section>

      {/* The Real Asset */}
      <section className="inv-section">
        <div className="inv-section-header">
          <div className="inv-section-label">The Hidden Asset</div>
          <h2 className="inv-section-title">The Structured Demand Graph</h2>
          <p className="inv-section-subtitle">Businesses think they&apos;re getting leads. They&apos;re actually generating structured infrastructure data.</p>
        </div>

        <div className="inv-card-grid">
          <div className="inv-card">
            <div className="inv-card-icon">📊</div>
            <h4>What Every Request Captures</h4>
            <p>Unlike ad platforms that track clicks, we capture intent structure:</p>
            <ul>
              <li>Problem type & specifics</li>
              <li>Urgency level (immediate → flexible)</li>
              <li>Price tolerance & budget</li>
              <li>Exact location & timing</li>
              <li>Consumer preferences</li>
            </ul>
          </div>

          <div className="inv-card">
            <div className="inv-card-icon">🗺️</div>
            <h4>The Demand Graph Over Time</h4>
            <p>As volume grows, patterns emerge:</p>
            <ul>
              <li>Seasonal demand spikes</li>
              <li>Geographic heat maps</li>
              <li>Price sensitivity by area</li>
              <li>Service category trends</li>
              <li>Urgency distribution curves</li>
            </ul>
          </div>

          <div className="inv-card">
            <div className="inv-card-icon">💎</div>
            <h4>Future Data Value</h4>
            <p>This data becomes valuable to:</p>
            <ul>
              <li>Insurers (claim prediction)</li>
              <li>Property managers (maintenance planning)</li>
              <li>Utilities (demand forecasting)</li>
              <li>Manufacturers (product development)</li>
              <li>Real estate (area insights)</li>
            </ul>
          </div>
        </div>

        <div className="inv-card" style={{ marginTop: '2rem', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <h4>The Stripe Analogy</h4>
          <p>Stripe merchants think they&apos;re processing payments — but Stripe built the financial infrastructure layer. Twilio customers think they&apos;re sending messages — but Twilio built communications infrastructure.</p>
          <p style={{ marginTop: '1rem', color: 'var(--secondary)', fontWeight: 600 }}>Nida businesses think they&apos;re getting leads — but we&apos;re building the demand intelligence layer for real-world services.</p>
        </div>
      </section>

      {/* Customer Journey */}
      <section className="inv-section">
        <div className="inv-section-header">
          <div className="inv-section-label">The Experience</div>
          <h2 className="inv-section-title">Complete Customer Journey</h2>
          <p className="inv-section-subtitle">From WhatsApp message to confirmed booking in under 6 minutes.</p>
        </div>

        <div className="inv-journey-phase">
          <div className="inv-phase-header">
            <div className="inv-phase-number">1</div>
            <div className="inv-phase-title">Intent Capture</div>
          </div>
          <div className="inv-messages">
            <div className="inv-message">
              <div className="inv-sender consumer">Consumer</div>
              <div className="inv-message-text">&quot;I need AC repair in West Bay&quot;</div>
            </div>
            <div className="inv-message">
              <div className="inv-sender nida">Nida</div>
              <div className="inv-message-text">&quot;I can help! Is your AC not cooling at all, or making a noise?&quot;</div>
            </div>
            <div className="inv-message">
              <div className="inv-sender consumer">Consumer</div>
              <div className="inv-message-text">&quot;Not cooling, completely stopped&quot;</div>
            </div>
            <div className="inv-message">
              <div className="inv-sender nida">Nida</div>
              <div className="inv-message-text">&quot;Got it — sounds urgent. Do you have a budget in mind?&quot;</div>
            </div>
            <div className="inv-message">
              <div className="inv-sender consumer">Consumer</div>
              <div className="inv-message-text">&quot;Under 500 if possible&quot;</div>
            </div>
            <div className="inv-message">
              <div className="inv-sender nida">Nida</div>
              <div className="inv-message-text">&quot;Perfect. I&apos;ve found 3 AC technicians available today in West Bay. Notifying the best match now...&quot;</div>
            </div>
          </div>
        </div>

        <div className="inv-journey-phase">
          <div className="inv-phase-header">
            <div className="inv-phase-number">2</div>
            <div className="inv-phase-title">Business Notification</div>
          </div>
          <div className="inv-messages">
            <div className="inv-message">
              <div className="inv-sender nida">Nida → CoolTech AC</div>
              <div className="inv-message-text">{`🔔 New Lead Available!

Service: AC Repair (not cooling)
Location: West Bay | Urgency: Same Day
Budget: Up to 500 QAR

Match Score: 92% | Rank #1 of 3

⏰ Respond within 15 minutes
Reply YES to accept this lead.`}</div>
            </div>
          </div>
        </div>

        <div className="inv-journey-phase">
          <div className="inv-phase-header">
            <div className="inv-phase-number">3</div>
            <div className="inv-phase-title">Acceptance & Connection</div>
          </div>
          <div className="inv-messages">
            <div className="inv-message">
              <div className="inv-sender business">CoolTech AC</div>
              <div className="inv-message-text">&quot;YES&quot;</div>
            </div>
            <div className="inv-message">
              <div className="inv-sender nida">Nida → CoolTech</div>
              <div className="inv-message-text">{`✅ Lead Confirmed!

Customer: Ahmed | Phone: +974 5555 1234
Location: West Bay

Please contact within 30 minutes.`}</div>
            </div>
            <div className="inv-message">
              <div className="inv-sender nida">Nida → Consumer</div>
              <div className="inv-message-text">{`Great news! CoolTech AC Services has accepted!

They will contact you shortly.
Rating: ⭐ 4.8 (42 reviews)
Warranty: 30 days included`}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Competition */}
      <section className="inv-section">
        <div className="inv-section-header">
          <div className="inv-section-label">Market Position</div>
          <h2 className="inv-section-title">Competitive Landscape</h2>
          <p className="inv-section-subtitle">What exists today and why Nida is different.</p>
        </div>

        <div className="inv-card-grid" style={{ marginBottom: '3rem' }}>
          <div className="inv-card">
            <h4 style={{ color: '#ef4444', marginBottom: '1rem' }}>Traditional Marketplaces</h4>
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Consumer posts → All businesses see it → Bidding war → Consumer overwhelmed</p>
            <ul style={{ fontSize: '0.85rem' }}>
              <li><strong>Thumbtack:</strong> Race to bottom, spam quotes</li>
              <li><strong>Angi:</strong> Consumer still compares manually</li>
              <li><strong>HomeAdvisor:</strong> Pay per lead, quality varies</li>
              <li><strong>Yelp:</strong> Discovery only, no transaction</li>
            </ul>
          </div>

          <div className="inv-card">
            <h4 style={{ color: '#f59e0b', marginBottom: '1rem' }}>On-Demand Apps</h4>
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Uber model — works for rides, but limited for complex services</p>
            <ul style={{ fontSize: '0.85rem' }}>
              <li><strong>Uber:</strong> Single vertical (rides)</li>
              <li><strong>Urban Company:</strong> Employs workers, heavy ops</li>
              <li><strong>Careem:</strong> Rides + food, not local services</li>
              <li><strong>TaskRabbit:</strong> Limited categories, gig workers</li>
            </ul>
          </div>

          <div className="inv-card">
            <h4 style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>Qatar/GCC Gap</h4>
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>No dominant home services platform. First-mover advantage.</p>
            <ul style={{ fontSize: '0.85rem' }}>
              <li><strong>Snoonu:</strong> Delivery only, not services</li>
              <li><strong>ServiceMarket (UAE):</strong> Traditional listings</li>
              <li><strong>Helpling (UAE):</strong> Single vertical (cleaning)</li>
              <li><strong style={{ color: 'var(--secondary)' }}>Qatar is underserved</strong></li>
            </ul>
          </div>
        </div>

        <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>What Makes Nida Different</h3>

        <div className="inv-table-wrapper">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Aspect</th>
                <th>Traditional Marketplaces</th>
                <th>On-Demand Apps</th>
                <th className="highlight">Nida</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Intake</td>
                <td className="dim">Forms, dropdowns</td>
                <td className="dim">Structured categories</td>
                <td className="highlight">Natural language AI</td>
              </tr>
              <tr>
                <td>Matching</td>
                <td className="dim">Show all, consumer picks</td>
                <td className="dim">Algorithmic but opaque</td>
                <td className="highlight">Automatic scoring, best first</td>
              </tr>
              <tr>
                <td>Lead distribution</td>
                <td className="dim">Blast to all (or auction)</td>
                <td className="dim">Assigned by platform</td>
                <td className="highlight">Sequential dispatch (fair)</td>
              </tr>
              <tr>
                <td>Business data</td>
                <td className="dim">Unstructured profiles</td>
                <td className="dim">Platform-owned</td>
                <td className="highlight">Machine-readable contracts</td>
              </tr>
              <tr>
                <td>Future</td>
                <td className="dim">Stays human-mediated</td>
                <td className="dim">Platform-dependent</td>
                <td className="highlight">Agent-to-agent ready</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="inv-card" style={{ marginTop: '3rem' }}>
          <h4>The Innovation Gap</h4>
          <p><strong>Nobody has built the protocol layer.</strong> Uber works because rides are simple. Home services are complex. NOMOS makes complex services machine-readable. That&apos;s the moat.</p>
        </div>
      </section>

      {/* Business Model */}
      <section id="business" className="inv-section">
        <div className="inv-section-header">
          <div className="inv-section-label">Business Model</div>
          <h2 className="inv-section-title">Revenue Streams</h2>
          <p className="inv-section-subtitle">Simple subscription model with multiple expansion levers.</p>
        </div>

        <div className="inv-pricing-grid">
          <div className="inv-pricing-card">
            <div className="inv-pricing-tier">Starter</div>
            <div className="inv-pricing-price">150 <span>QAR/mo</span></div>
            <div className="inv-pricing-desc">Solo operators, testing the platform</div>
            <ul>
              <li>Up to 15 leads/month</li>
              <li>WhatsApp notifications</li>
              <li>Basic dashboard</li>
              <li>Standard matching</li>
            </ul>
          </div>

          <div className="inv-pricing-card featured">
            <div className="inv-pricing-tier">Growth</div>
            <div className="inv-pricing-price">400 <span>QAR/mo</span></div>
            <div className="inv-pricing-desc">Active businesses seeing ROI</div>
            <ul>
              <li>Unlimited leads</li>
              <li>Priority matching</li>
              <li>Response analytics</li>
              <li>Lead quality breakdown</li>
            </ul>
          </div>

          <div className="inv-pricing-card">
            <div className="inv-pricing-tier">Premium</div>
            <div className="inv-pricing-price">800 <span>QAR/mo</span></div>
            <div className="inv-pricing-desc">Established businesses</div>
            <ul>
              <li>Everything in Growth</li>
              <li>NOMOS auto-pilot (24/7)</li>
              <li>Conversion analytics</li>
              <li>Featured placement</li>
            </ul>
          </div>
        </div>

        <div className="inv-card">
          <h4 style={{ marginBottom: '1.5rem' }}>Value Proposition vs Meta Ads</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
            <div>
              <h5 style={{ color: '#ef4444', marginBottom: '1rem' }}>Meta Ads</h5>
              <p style={{ color: 'var(--gray-light)', fontSize: '0.9rem' }}>Monthly: 2,000+ QAR<br/>Qualified leads: 10-20<br/>Cost per lead: 100-250 QAR</p>
            </div>
            <div>
              <h5 style={{ color: 'var(--secondary)', marginBottom: '1rem' }}>Nida</h5>
              <p style={{ color: 'var(--gray-light)', fontSize: '0.9rem' }}>Monthly: 150-800 QAR<br/>Qualified leads: All<br/>Cost per lead: 7-15 QAR</p>
            </div>
          </div>
          <p style={{ color: 'var(--secondary)', marginTop: '1.5rem', fontWeight: 600, textAlign: 'center' }}>A business needs ONE conversion to pay for a full month.</p>
        </div>
      </section>

      {/* Financials */}
      <section id="financials" className="inv-section">
        <div className="inv-section-header">
          <div className="inv-section-label">Financials</div>
          <h2 className="inv-section-title">Revenue Projections</h2>
          <p className="inv-section-subtitle">Aggressive but achievable targets based on successful supply acquisition.</p>
        </div>

        <div className="inv-card" style={{ marginBottom: '2rem', borderColor: 'rgba(245,158,11,0.3)', background: 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, var(--dark-light) 100%)' }}>
          <h4 style={{ color: '#f59e0b' }}>Projection Assumptions</h4>
          <p style={{ marginBottom: '0.5rem' }}>These are aggressive targets based on successful supply acquisition. Marketplace growth is nonlinear — early traction determines trajectory.</p>
          <p style={{ color: 'var(--gray-light)', fontSize: '0.9rem' }}><strong>Critical variable:</strong> Business recruitment in Month 1-2. Supply acquisition is the primary constraint — demand follows supply in service marketplaces.</p>
        </div>

        <div className="inv-financials-grid">
          <div className="inv-financial-card">
            <div className="inv-financial-value">Week 5</div>
            <div className="inv-financial-label">Target: First Revenue</div>
          </div>
          <div className="inv-financial-card">
            <div className="inv-financial-value">Week 6</div>
            <div className="inv-financial-label">Target: Break-even</div>
          </div>
          <div className="inv-financial-card">
            <div className="inv-financial-value">~97%</div>
            <div className="inv-financial-label">Target: Gross Margin</div>
          </div>
          <div className="inv-financial-card">
            <div className="inv-financial-value">~$230K</div>
            <div className="inv-financial-label">Target: Year 1 Revenue</div>
          </div>
        </div>

        <div className="inv-table-wrapper">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Businesses</th>
                <th>Requests/mo</th>
                <th>MRR (QAR)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Week 1-2</td>
                <td>25</td>
                <td>30</td>
                <td>—</td>
                <td>Building + Recruiting</td>
              </tr>
              <tr className="highlight-row">
                <td>Week 5</td>
                <td>40</td>
                <td>140</td>
                <td className="mrr">1,500</td>
                <td>First revenue</td>
              </tr>
              <tr className="highlight-row">
                <td>Month 3</td>
                <td>80</td>
                <td>500</td>
                <td className="mrr">12,000</td>
                <td>Cohort converts</td>
              </tr>
              <tr className="highlight-row">
                <td>Month 6</td>
                <td>180</td>
                <td>1,200</td>
                <td className="mrr">40,000</td>
                <td>Operational profit</td>
              </tr>
              <tr className="highlight-row">
                <td>Month 12</td>
                <td>400</td>
                <td>3,000</td>
                <td className="mrr">105,000</td>
                <td>Market leader</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Dual Path Strategy */}
      <section className="inv-section">
        <div className="inv-section-header">
          <div className="inv-section-label">Strategy</div>
          <h2 className="inv-section-title">The Dual Path to NOMOS</h2>
          <p className="inv-section-subtitle">Nida isn&apos;t just a product — it&apos;s the proof layer for enterprise NOMOS adoption.</p>
        </div>

        <div className="inv-dual-path">
          <div className="inv-path-card">
            <h5>Path A: Bottom-Up</h5>
            <h3>Nida Marketplace</h3>
            <p>Prove NOMOS works with real transactions. Thousands of autonomous matches governed by contracts.</p>
            <div className="inv-path-meta">
              <div className="inv-meta-item">
                <span className="label">Sells</span>
                <span>Cheaper leads, zero waste</span>
              </div>
              <div className="inv-meta-item">
                <span className="label">Buyer</span>
                <span>Local service businesses</span>
              </div>
              <div className="inv-meta-item">
                <span className="label">Price</span>
                <span>150-800 QAR/month</span>
              </div>
            </div>
          </div>

          <div className="inv-path-connector">
            <div className="inv-connector-line"></div>
            <div className="inv-connector-circle">SHARED<br/>PROTOCOL</div>
            <div className="inv-connector-line"></div>
          </div>

          <div className="inv-path-card">
            <h5>Path B: Top-Down (Future)</h5>
            <h3>Enterprise NOMOS</h3>
            <p>Governance infrastructure for regulated industries. Same protocol, different contract schemas. Unlocked by proof.</p>
            <div className="inv-path-meta">
              <div className="inv-meta-item">
                <span className="label">Sells</span>
                <span>Governance, compliance</span>
              </div>
              <div className="inv-meta-item">
                <span className="label">Buyer</span>
                <span>Regulated industries</span>
              </div>
              <div className="inv-meta-item">
                <span className="label">Price</span>
                <span>$25K-500K/engagement</span>
              </div>
            </div>
          </div>
        </div>

        <div className="inv-card" style={{ borderColor: 'rgba(99,102,241,0.3)' }}>
          <h4 style={{ marginBottom: '1rem' }}>Enterprise Conversations Begin After Proof</h4>
          <p style={{ color: 'var(--gray-light)', marginBottom: '1rem' }}>Once Nida proves 10,000+ autonomous transactions with full audit trails, the enterprise conversation changes fundamentally.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginTop: '1.5rem' }}>
            <div>
              <h5 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Without Proof</h5>
              <p style={{ color: 'var(--gray-light)', fontSize: '0.9rem', fontStyle: 'italic' }}>&quot;Trust us, this will work.&quot;</p>
            </div>
            <div>
              <h5 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>With Proof</h5>
              <p style={{ color: 'var(--gray-light)', fontSize: '0.9rem', fontStyle: 'italic' }}>&quot;Here&apos;s 10,000 autonomous transactions. Here&apos;s the audit log.&quot;</p>
            </div>
          </div>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--primary)', fontWeight: 600 }}>Not pitching. Proving.</p>
        </div>
      </section>

      {/* What's Built */}
      <section className="inv-section">
        <div className="inv-section-header">
          <div className="inv-section-label">Current Status</div>
          <h2 className="inv-section-title">What&apos;s Built & Working</h2>
          <p className="inv-section-subtitle">Full platform in production, ready for business recruitment.</p>
        </div>

        <div className="inv-status-grid">
          <div className="inv-status-item">
            <div className="inv-check">✓</div>
            <span>WhatsApp webhook</span>
          </div>
          <div className="inv-status-item">
            <div className="inv-check">✓</div>
            <span>AI intake conversation</span>
          </div>
          <div className="inv-status-item">
            <div className="inv-check">✓</div>
            <span>Intent structuring</span>
          </div>
          <div className="inv-status-item">
            <div className="inv-check">✓</div>
            <span>NOMOS contracts</span>
          </div>
          <div className="inv-status-item">
            <div className="inv-check">✓</div>
            <span>Business matching</span>
          </div>
          <div className="inv-status-item">
            <div className="inv-check">✓</div>
            <span>Sequential dispatch</span>
          </div>
          <div className="inv-status-item">
            <div className="inv-check">✓</div>
            <span>Notifications</span>
          </div>
          <div className="inv-status-item">
            <div className="inv-check">✓</div>
            <span>Business dashboard</span>
          </div>
          <div className="inv-status-item">
            <div className="inv-check">✓</div>
            <span>Admin panel</span>
          </div>
          <div className="inv-status-item">
            <div className="inv-check">✓</div>
            <span>Trust scoring</span>
          </div>
          <div className="inv-status-item">
            <div className="inv-check">✓</div>
            <span>Consumer management</span>
          </div>
          <div className="inv-status-item">
            <div className="inv-check">✓</div>
            <span>Conversation history</span>
          </div>
        </div>

        <h3 style={{ textAlign: 'center', margin: '3rem 0 2rem' }}>Tech Stack</h3>

        <div className="inv-tech-grid">
          <div className="inv-tech-item">
            <div className="inv-tech-icon">⚛️</div>
            <div>
              <h5>Next.js 14</h5>
              <p>Frontend & API</p>
            </div>
          </div>
          <div className="inv-tech-item">
            <div className="inv-tech-icon">🗄️</div>
            <div>
              <h5>Supabase</h5>
              <p>PostgreSQL, Auth</p>
            </div>
          </div>
          <div className="inv-tech-item">
            <div className="inv-tech-icon">🧠</div>
            <div>
              <h5>Claude API</h5>
              <p>AI intake</p>
            </div>
          </div>
          <div className="inv-tech-item">
            <div className="inv-tech-icon">💬</div>
            <div>
              <h5>WhatsApp API</h5>
              <p>Consumer interface</p>
            </div>
          </div>
          <div className="inv-tech-item">
            <div className="inv-tech-icon">▲</div>
            <div>
              <h5>Vercel</h5>
              <p>Hosting</p>
            </div>
          </div>
          <div className="inv-tech-item">
            <div className="inv-tech-icon">🎨</div>
            <div>
              <h5>Tailwind</h5>
              <p>Styling</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section id="vision" className="inv-section">
        <div className="inv-section-header">
          <div className="inv-section-label">Vision</div>
          <h2 className="inv-section-title">The Agent-to-Agent Future</h2>
          <p className="inv-section-subtitle">Building infrastructure for autonomous commerce.</p>
        </div>

        <div className="inv-vision-timeline">
          <div className="inv-vision-item">
            <div className="label">Today (MVP)</div>
            <h4>Human → AI → Protocol → Human</h4>
            <p>Consumer sends WhatsApp. AI structures intent. Protocol matches businesses. Business accepts manually.</p>
          </div>

          <div className="inv-vision-item">
            <div className="label">Tomorrow (V2)</div>
            <h4>Human → AI Agent → Protocol → AI Agent</h4>
            <p>Business sets rules once. Their AI agent handles leads 24/7. Auto-accept, auto-negotiate, auto-schedule.</p>
          </div>

          <div className="inv-vision-item">
            <div className="label">The Future</div>
            <h4>AI Agent ↔ NOMOS Protocol ↔ AI Agent</h4>
            <p>&quot;My home agent schedules all maintenance.&quot; Agent-to-agent commerce at scale.</p>
          </div>

          <div className="inv-vision-item">
            <div className="label">Geographic Expansion</div>
            <h4>Qatar → UAE → Saudi → GCC</h4>
            <p>Prove in Doha. Expand to Dubai (Month 12). Riyadh (Month 18). Regional infrastructure.</p>
          </div>

          <div className="inv-vision-item">
            <div className="label">The Logic Exchange</div>
            <h4>Marketplace for Governance Contracts</h4>
            <p>Best contracts licensed across markets. Bank logic licensed to fintechs. Nida is the first inventory source.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="inv-cta">
        <h2>The Protocol That Handles<br/>AC Repairs Today<br/>Handles Bank Loans Tomorrow</h2>
        <p>Nida inverts advertising. NOMOS enables autonomous commerce. We&apos;re proving it works with plumbers. We&apos;re scaling it to banks.</p>
        <div className="inv-cta-buttons">
          <a href="mailto:allansendagi@gmail.com" className="inv-btn inv-btn-primary">Partner With Us</a>
          <a href="#protocol" className="inv-btn inv-btn-secondary">Learn More</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="inv-footer">
        <div className="arabic">نداء</div>
        <div className="inv-logo" style={{ fontSize: '2rem' }}>NIDA</div>
        <div className="tagline">You call. The right one answers.</div>
        <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginTop: '2rem' }}>Building the infrastructure layer for agent-to-agent commerce.</p>
      </footer>
    </div>
  );
}
