# SaaS Landing Page Template

A modern SaaS landing page built with Next.js, Tailwind CSS, and Shadcn UI. Part of the [Starter Kit](https://github.com/guijanam/starter_kit) template system.

## Sections

- **Hero** - Headline, subtitle, CTA buttons
- **Features** - 6-card grid with icons (Analytics, Speed, Security, Collaboration, Scale, Integrations)
- **Pricing** - 3-tier pricing cards (Free / Pro / Enterprise)
- **Testimonials** - Customer testimonial cards
- **FAQ** - Accordion-based Q&A
- **CTA** - Final call-to-action with free trial

## Quick Start

```bash
git clone -b template/saas https://github.com/guijanam/starter_kit.git my-saas
cd my-saas
npm install
npm run dev
```

## Customization

- **Branding**: Edit `src/lib/constants.ts` (site name, nav links, footer links)
- **Pricing plans**: Edit the `plans` array in `src/components/sections/pricing.tsx`
- **Testimonials**: Edit the `testimonials` array in `src/components/sections/testimonials.tsx`
- **Features**: Edit the `features` array in `src/components/sections/features.tsx`
- **Theme colors**: Edit CSS variables in `src/app/globals.css`

## Tech Stack

Next.js 16 | TypeScript | Tailwind CSS 4 | Shadcn UI | Framer Motion | next-themes | React Hook Form + Zod | Zustand

## License

MIT
