# 🌱 PragathiAI

### From Village to Viability — AI-Powered Business Advisory for Rural Entrepreneurs

PragathiAI is an AI-powered rural business advisory platform designed to help aspiring micro-entrepreneurs turn a business idea into a practical, informed starting plan.

Instead of requiring users to understand complex business terminology, PragathiAI asks for a few simple inputs — **where they are, what they want to build, how much capital they have, and their preferred language** — and generates a structured business advisory report.

The platform combines AI-powered insights with local-market thinking, competitor analysis, pricing guidance, financing routes, and repayment planning to help users understand their next step before investing their savings or taking a loan.

---

## 🚀 Why PragathiAI?

Starting a small business in a rural or semi-urban area often involves answering difficult questions:

* Is there enough demand for my idea?
* Who are my competitors?
* How should I price my product or service?
* What risks should I consider?
* How much capital do I actually need?
* What type of financing could suit my requirement?
* How much would repayment look like?
* Where should I start?

For many first-time entrepreneurs, the information exists in different places but is difficult to understand, compare, and apply to their own situation.

**PragathiAI brings these decisions together into one simple interface.**

---

# 💡 Our Solution

PragathiAI transforms a basic business idea into a structured **village-level business plan**.

### User provides:

```text
📍 Village / Town
💡 Business Idea
💰 Available Capital
🌐 Preferred Language
```

### PragathiAI generates:

```text
📊 Market Feasibility
💪 Business Strengths
⚠️ Potential Risks
🏪 Competitor Insights
💵 Pricing Recommendations
🏦 Financing Route
📅 Repayment Plan
```

The goal is not to promise that a business will succeed.

Instead, PragathiAI provides **practical estimates and structured information** that can help an entrepreneur make a more informed starting decision.

---

# ✨ Key Features

## 1. 🤖 AI-Powered Business Advisory

PragathiAI uses **Groq-powered LLM inference** to generate a structured business feasibility report based on the user's inputs.

The AI produces:

* Business summary
* Market-fit assessment
* Strengths
* Risks
* Competitor insights
* Pricing bands
* Financing recommendation

---

## 2. 📍 Hyper-Local Business Context

The platform asks for the user's **village or town** and uses it as the context for the advisory.

The generated report focuses on:

* Local market reach
* Nearby customer potential
* Local competition
* Service radius
* Practical expansion considerations

---

## 3. 📊 Market Feasibility Score

Each generated report includes a market-fit score out of 100.

The report also explains the score through a short feasibility description instead of presenting the number alone.

Example:

```text
Local Fit
78 / 100

Good local fit

Start within a 5–8 km service radius
and expand after validating repeat demand.
```

---

## 4. 🏪 Competitor Mapping

PragathiAI provides a simple competitor view containing:

* Competitor type/name
* Approximate distance
* Existing advantage
* Potential opportunity for differentiation

This helps users understand where their proposed business could fit into the local market.

---

## 5. 💰 Practical Pricing Guidance

The system generates pricing bands such as:

```text
Entry Offer
₹99–149

Core Ticket
₹199–349

Premium / Bundle
₹399–599
```

Each pricing level is accompanied by a short explanation of its intended purpose.

These values are presented as **estimates**, not guaranteed market prices.

---

## 6. 🏦 Financing Route

Based on the user's planned capital requirement, PragathiAI routes the user toward a broad financing category:

* Micro Finance
* Term Loan

The report can include:

* Financing route
* Relevant scheme category
* Estimated eligible amount
* Assumed interest rate
* Estimated tenure
* Reason for the suggested route

The application explicitly treats these values as estimates and notes that final eligibility depends on lender policies, documentation, and current scheme rules.

---

## 7. 📅 Repayment Planning

PragathiAI converts the financing estimate into a simple repayment schedule.

The interface displays:

* Principal
* Tenure
* Estimated quarterly payment
* Interest
* Remaining balance
* Total repayment estimate

This allows users to understand the potential repayment rhythm before making a financing decision.

---

## 8. 🌐 Multilingual Support

PragathiAI currently supports:

* 🇬🇧 English
* 🇮🇳 हिन्दी
* 🇮🇳 मराठी
* 🇮🇳 தமிழ்
* 🇮🇳 తెలుగు

The system allows users to select their preferred language before generating their advisory.

---

## 9. 🛡️ AI Fallback System

PragathiAI is designed to remain usable even when the external AI service is unavailable.

The backend follows this flow:

```text
User Input
     ↓
PragathiAI API
     ↓
Groq LLM
     ↓
AI Advisory Report
     ↓
If AI unavailable
     ↓
Structured Fallback Report
```

This prevents the application from completely failing when the external AI service cannot respond.

---

# 🧠 AI Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    │ Village / Idea /    │
                    │ Capital / Language  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │ TypeScript + Vite   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   tRPC API Layer    │
                    │   Input Validation  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  PragathiAI Engine  │
                    │ Business Advisory   │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
          ┌─────────────────┐   ┌──────────────────┐
          │   Groq / LLM    │   │ Fallback Engine  │
          │ AI Generation   │   │ Rule-based Plan  │
          └────────┬────────┘   └────────┬─────────┘
                   │                     │
                   └──────────┬──────────┘
                              ▼
                  ┌────────────────────────┐
                  │ Structured Advisory    │
                  │ Report                 │
                  └────────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        Market Fit        Pricing          Financing
        & Risks           Guidance         + Repayment
```

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Radix UI
* Lucide React
* React Query
* Wouter
* Framer Motion

## Backend

* Node.js
* Express
* TypeScript
* tRPC
* Zod

## AI

* Groq
* LLM-based structured advisory generation

## Database

* MySQL
* Drizzle ORM
* Drizzle Kit

## Maps / Location

* Google Maps integration

## Testing & Development

* Vitest
* TypeScript
* Prettier
* pnpm
* esbuild

---

# 🏗️ Project Structure

```text
pragathiai/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── ui/
│       │   ├── AIChatBox.tsx
│       │   ├── Map.tsx
│       │   └── DashboardLayout.tsx
│       │
│       ├── pages/
│       │   ├── Home.tsx
│       │   ├── NotFound.tsx
│       │   └── ComponentShowcase.tsx
│       │
│       ├── hooks/
│       ├── contexts/
│       ├── lib/
│       ├── App.tsx
│       └── main.tsx
│
├── server/
│   ├── _core/
│   │   ├── llm.ts
│   │   ├── map.ts
│   │   ├── oauth.ts
│   │   ├── trpc.ts
│   │   └── ...
│   │
│   ├── db.ts
│   ├── routers.ts
│   ├── storage.ts
│   └── index.ts
│
├── shared/
│   ├── const.ts
│   └── types.ts
│
├── drizzle/
│   ├── schema.ts
│   └── relations.ts
│
├── patches/
│
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── drizzle.config.ts
├── .gitignore
└── README.md
```

---

# 🔄 How It Works

### Step 1 — Tell us about your idea

The user enters:

* Village / town
* Business idea
* Available capital
* Preferred language

---

### Step 2 — Generate the advisory

The backend validates the input and sends the business context to the AI advisory engine.

The AI is instructed to generate structured JSON containing:

```text
Headline
Summary
Market Reach
Strengths
Risks
Competitors
Pricing
Loan Route
```

---

### Step 3 — Understand the opportunity

The user receives a simple feasibility snapshot showing:

* Local fit
* Strengths
* Risks
* Competition
* Pricing options

---

### Step 4 — Plan financing

PragathiAI maps the capital requirement to a financing route and provides an estimated repayment schedule.

---

### Step 5 — Take the next step

The final interface brings everything together into a simple plan that the user can discuss with:

* Family members
* Mentors
* Local business advisors
* Financial institutions

---

# 🧪 Example Input

```text
Village:
Buldhana, Maharashtra

Business Idea:
Millet snacks & breakfast cart

Available Capital:
₹50,000

Language:
English
```

### Example Output

```text
Market Fit:
Good local fit

Strengths:
✓ Clear everyday demand
✓ Low-cost test launch
✓ Local differentiation opportunities

Risks:
⚠ Seasonal demand
⚠ Input price changes
⚠ Avoid investing all capital immediately

Pricing:
Entry       ₹99–149
Core        ₹199–349
Premium     ₹399–599

Financing:
Micro Finance

Repayment:
Estimated quarterly schedule
```

---

# 🔐 Security & Privacy

PragathiAI is designed with environment-based configuration for sensitive credentials.

API keys and secrets should be stored in environment variables and **must not be committed to the repository**.

Example:

```env
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

### ⚠️ Important

Never commit:

```text
.env
.env.local
.project-config.json
API keys
database credentials
JWT secrets
```

The repository's `.gitignore` excludes environment files and `.project-config.json`.

---

# ⚙️ Local Setup

## Prerequisites

Make sure you have installed:

* Node.js
* pnpm
* MySQL
* Git

---

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/pragathiai.git
cd pragathiai
```

---

## 2. Install dependencies

```bash
pnpm install
```

---

## 3. Configure environment variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key
DATABASE_URL=your_mysql_connection_string
JWT_SECRET=your_secret
NODE_ENV=development
```

Add any additional environment variables required by your deployment environment.

---

## 4. Configure the database

Make sure MySQL is running and the database connection is available through:

```env
DATABASE_URL=your_mysql_connection_string
```

Then run:

```bash
pnpm db:push
```

---

## 5. Start the development server

```bash
pnpm dev
```

The application will start in development mode.

---

# 📦 Production Build

Build the frontend and backend:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

---

# 🧪 Run Tests

Run the test suite using:

```bash
pnpm test
```

Type-check the project:

```bash
pnpm check
```

Format the project:

```bash
pnpm format
```

---

# 📊 Responsible AI

PragathiAI is intended as an **advisory and planning tool**, not a replacement for professional financial, legal, or business advice.

The application therefore:

* Presents financial numbers as estimates
* Avoids guaranteeing loan approval
* Indicates that lender eligibility depends on current policies
* Uses a fallback system when AI generation is unavailable
* Encourages users to validate assumptions locally
* Avoids presenting AI-generated recommendations as guaranteed outcomes

Users should verify financing schemes, interest rates, eligibility requirements, and local market conditions with the relevant institutions before making financial decisions.

---

# 🌍 Social Impact

PragathiAI focuses on reducing the information gap faced by first-time entrepreneurs.

### Our goal is to make business planning:

**Simpler.**

**More accessible.**

**More local.**

**More understandable.**

The platform is designed particularly around users who may not have access to business consultants or sophisticated market-research tools.

---

# 🔮 Future Scope

Potential future improvements include:

### 📍 Real-Time Local Market Data

Integrate verified local market information, product prices, and demand signals.

### 🗺️ Advanced Geospatial Analysis

Use richer location data to identify customer clusters, competitors, transport accessibility, and market gaps.

### 🏪 Business Directory Integration

Connect entrepreneurs with local suppliers, markets, service providers, and potential customers.

### 🏦 Verified Financial Scheme Database

Integrate an updated database of government and financial-institution schemes instead of relying only on AI-generated scheme context.

### 🗣️ Voice-Based Interaction

Allow users to describe their business idea through voice in regional languages.

### 📱 Offline / Low-Connectivity Support

Enable advisory workflows for users with limited or intermittent internet connectivity.

### 📈 Business Progress Tracking

Allow entrepreneurs to track:

* Revenue
* Expenses
* Customers
* Inventory
* Loan repayments
* Business growth

### 🤝 Human-in-the-Loop Advisory

Connect users with verified mentors, financial advisors, and entrepreneurship support organizations.

---

# 🏆 Hackathon Highlights

### What makes PragathiAI different?

```text
              USER
                │
                ▼
        Simple Business Idea
                │
                ▼
       ┌───────────────────┐
       │    PragathiAI     │
       └───────────────────┘
                │
       ┌────────┼────────┐
       ▼        ▼        ▼
     Market   Pricing  Financing
     Signal   Plan     Route
       │        │        │
       └────────┼────────┘
                ▼
        Practical Business
             Plan
```

### One platform.

### One simple input.

### Multiple business decisions.

**From village to viability.**

---

# 🎥 Demo

### Live Demo

**[Add your deployed application URL here]**

### Demo Video

**[Add your YouTube / Drive / Loom demo link here]**

---

# 📸 Screenshots

Add screenshots of the following sections here:

### Landing Page

```text
[Add screenshot]
```

### Business Planner

```text
[Add screenshot]
```

### AI Advisory Report

```text
[Add screenshot]
```

### Financing & Repayment Plan

```text
[Add screenshot]
```

---

# 👥 Team

| Name        | Role                      |
| ----------- | ------------------------- |
| YOUR NAME   | AI / Full-Stack Developer |
| TEAM MEMBER | Frontend / UI             |
| TEAM MEMBER | Backend / Database        |
| TEAM MEMBER | Research / Business       |

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 🔗 Links

* **GitHub:** [Add Repository Link]
* **Live Demo:** [Add Deployment Link]
* **Demo Video:** [Add Video Link]
* **Presentation:** [Add PPT / Drive Link]

---

## 🌱 PragathiAI

> **Good advice should meet you where you are — with a phone, a plan, and the courage to begin.**

**From Village to Viability.**
