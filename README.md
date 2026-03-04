# Snowboard Craft - Frontend (Next.js & Three.js)

## 1. Project Overview
Snowboard Craft is a high-performance Direct-to-Consumer (DTC) e-commerce platform. This frontend is built with Next.js 15 (App Router) and TypeScript, providing an immersive 3D customization experience for bespoke snowboards

**Key Technical Highlights**

- 3D Interactive Customizer: Powered by Three.js (via React Three Fiber), allowing real-time visualization of snowboard models.
- Headless Architecture: Completely decoupled from the Django REST API to ensure a polished Single Page Application (SPA) feel.
- Authentication: Integrated with Clerk for secure social login and user management.
- Responsive UI: Built with Tailwind CSS using a mobile-first approach.


## 2. Tech Stack

- **Framework:** Next.js 13 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **3D Rendering:** React Three Fiber (R3F)
- **Animation:** GSAP + Framer Motion
- **Charts:** Recharts
- **Authentication:** Clerk + Custom Email Verification
- **State Management:** React Context API
- **HTTP Client:** Axios

---


## 3. Project Structure

```bash

frontend/
├── app/                     # Next.js App Router pages (grouped by route segment: public | auth | admin)
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   ├── (public)/             # Public-facing pages (home, products, cart, feedback, account, about)
│   │   ├── page.tsx          # Home page
│   │   ├── products/         # Product pages
│   │   ├── feedback/         # Reviews / feedback pages
│   │   └── account/          # User account pages
│   ├── (auth)/               # Authentication pages (sign-in, sign-up, admin login)
│   └── (admin)/              # Admin pages (dashboard, product management, orders)
├── api/                      # Next.js API route handlers & backend URL mappings
│   ├── api.ts                # All backend route URLs
│   └── auth.ts               # Auth API call functions
├── components/               # Reusable UI components (buttons, cards, modals, etc.)
├── contexts/                 # Global state management (React Contexts)
├── hooks/                    # Custom React hooks
│   ├── useMobile.ts          # Detect mobile devices
│   └── useIsSafari.ts        # Detect Safari browser
├── lib/                      # Pure utility functions / framework-agnostic logic
│   ├── utils.ts              # General helper functions 
│   └── requireAuth.ts        # Auth guard / access control logic
├── services/                 # API communication layer (Axios instances & request helpers)
│   └── axios.ts              # Axios instance & request helper functions
├── slices/                   # Home page specific content blocks (Hero, ProductGrid, VideoBlock, etc.)
└── public/                   # Static assets (images, models, textures, HDR files)

```

## 4. How to Run

```bash
npm install
npm run dev
```





## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
