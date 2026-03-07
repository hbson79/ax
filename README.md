# Starter Kit

A modern web starter kit built with Next.js, Tailwind CSS, and Shadcn UI. Clone the template branch that fits your project and start building immediately.

## Templates

| Template       | Branch               | Description                                               |
| -------------- | -------------------- | --------------------------------------------------------- |
| **Base**       | `main`               | Generic starter kit - build anything                      |
| **SaaS**       | `template/saas`      | SaaS landing page with pricing and testimonials           |
| **Portfolio**  | `template/portfolio` | Personal portfolio with projects, skills and contact form |
| **Blog**       | `template/blog`      | Blog with posts, categories and newsletter signup         |
| **E-commerce** | `template/ecommerce` | Online store with products, categories and promo sections |

### Quick Start

```bash
# Clone a specific template
git clone -b template/saas <repo-url> my-project
cd my-project
npm install
npm run dev
```

Or clone the base starter kit:

```bash
git clone <repo-url> my-project
```

## Tech Stack

| Technology                     | Role                         |
| ------------------------------ | ---------------------------- |
| Next.js 16 (App Router)        | Framework                    |
| TypeScript                     | Type safety                  |
| Tailwind CSS 4                 | Styling                      |
| Shadcn UI                      | Component library            |
| Lucide React                   | Icons                        |
| next-themes                    | Dark mode                    |
| Framer Motion                  | Animations                   |
| React Hook Form + Zod          | Form handling and validation |
| Zustand                        | State management             |
| Sonner                         | Toast notifications          |
| Prettier + Husky + lint-staged | Code quality                 |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (ThemeProvider, fonts)
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles + Tailwind
├── components/
│   ├── ui/                 # Shadcn UI components
│   ├── layout/             # Header, Footer, MobileNav, ThemeToggle
│   ├── sections/           # Landing page sections (template-specific)
│   └── shared/             # AnimatedWrapper, SectionHeader, Logo
├── lib/                    # utils.ts, constants.ts
├── hooks/                  # Custom React hooks
├── stores/                 # Zustand stores
├── types/                  # TypeScript type definitions
└── providers/              # Context providers (ThemeProvider)
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run format:check # Check formatting
```

## Customization

- **Site config**: Edit `src/lib/constants.ts` (name, description, nav links, footer links)
- **Theme colors**: Edit CSS variables in `src/app/globals.css`
- **Sections**: Add/remove/modify components in `src/components/sections/`
- **Components**: Add Shadcn UI components with `npx shadcn@latest add <component>`

## License

MIT
