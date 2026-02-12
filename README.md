# Dyad Vue Template

> A minimal, production-ready Vue 3 starter template with TypeScript, Vite, and Tailwind CSS v3.

## ✨ Features

- **Vue 3** with Composition API and `<script setup>` syntax
- **TypeScript** for type safety and better developer experience
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS** with complete design system and CSS resets
- **Reka UI v2+** - 30+ accessible, unstyled components
- **Responsive Layout** with proper centering utilities and flexbox structure
- **Mobile Detection** - `useIsMobile` composable for responsive design
- **Clean Starting Point** - minimal boilerplate, maximum flexibility
- **Bun Compatible** - works seamlessly with Bun package manager
- **Dark Mode Support** - class-based dark mode switching
- **Animation Ready** - includes tailwindcss-animate plugin
- **Production Ready** - CSS resets, proper layout structure, and optimized builds

## 🚀 Quick Start

### Prerequisites

- Node.js ^20.19.0 || >=22.12.0 (as specified in package.json engines)
- Bun (recommended), npm, yarn, or pnpm

### Installation

```sh
# Clone the template
git clone https://github.com/k1lgor/dyad-vue-template.git
cd dyad-vue-template

# Install dependencies
bun install
# or
pnpm install
```

### Development

```sh
# Start development server (runs on http://localhost:5173)
bun dev
# or
pnpm run dev

# Type checking
pnpm run type-check
```

Open [http://localhost:5173](http://localhost:5173) to view your app.

### Build for Production

```sh
# Type-check, compile and minify
bun run build
# or
pnpm run build

# Preview production build
bun run preview
# or
pnpm run preview
```

## 🎨 Tailwind CSS

This template includes a complete Tailwind CSS setup with:

- **Custom Design System** - predefined colors, spacing, and typography using CSS variables
- **Dark Mode** - class-based dark mode (`dark:` prefix)
- **Custom Animations** - accordion animations and transitions via tailwindcss-animate
- **CSS Resets** - proper margin/padding resets for html/body elements
- **Component-Ready** - all utility classes available out of the box
- **Responsive Design** - mobile-first approach with responsive breakpoints

### Configuration Files

- `tailwind.config.ts` - Tailwind configuration with TypeScript
- `postcss.config.js` - PostCSS configuration with autoprefixer
- `src/global.css` - Global styles and CSS custom properties

## 📁 Project Structure

```
.
├── src/
│   ├── components/          # Reusable Vue components
│   │   ├── ui/              # Reka UI component library (30+ components)
│   │   └── MadeWithDyad.vue # Centered footer component
│   ├── composables/         # Vue composables (useIsMobile, etc.)
│   ├── views/               # Page components
│   │   └── HomeView.vue     # Home page with centered layout
│   ├── router/              # Vue Router configuration
│   ├── stores/              # Pinia stores
│   ├── lib/                 # Utility functions (utils.ts)
│   ├── App.vue              # Root component with flexbox layout
│   ├── main.ts              # Application entry point
│   └── global.css           # Global styles with Tailwind & CSS resets
├── public/                  # Public static files
├── tailwind.config.ts       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── vite.config.ts           # Vite configuration
└── package.json             # Dependencies and scripts
```

## 🛠 Tech Stack

- **Frontend Framework**: Vue 3.5.18
- **Language**: TypeScript
- **Build Tool**: Vite 6.0.0
- **Styling**: Tailwind CSS with tailwindcss-animate
- **UI Components**: Reka UI v2+ (30+ accessible components)
- **Routing**: Vue Router
- **State Management**: Pinia
- **Form Validation**: VeeValidate + Zod
- **Utilities**: @vueuse/core
- **Icons**: Lucide Vue Next
- **Notifications**: Vue Sonner
- **Data Tables**: @tanstack/vue-table
- **Package Manager**: Bun compatible (also works with npm/yarn/pnpm)

## 🎯 Getting Started

This template provides a clean starting point with:

1. **Responsive Layout** - Flexbox-based App.vue with proper centering utilities
2. **Centered Footer** - MadeWithDyad component with perfect horizontal centering
3. **CSS Resets** - Proper margin/padding resets for consistent cross-browser rendering
4. **Mobile Detection** - `useIsMobile()` composable for responsive design logic
5. **Development Ready** - Hot module replacement and fast refresh
6. **Production Ready** - Optimized builds with tree-shaking

### Available Composables

- **`useIsMobile()`** - Reactive mobile/desktop detection with 768px breakpoint

  ```vue
  <script setup>
  import { useIsMobile } from '@/composables/useIsMobile';

  const isMobile = useIsMobile();
  </script>

  <template>
    <div v-if="isMobile">Mobile View</div>
    <div v-else>Desktop View</div>
  </template>
  ```

### Next Steps

1. Start building your components in `src/components/`
2. Add new routes in `src/router/index.ts`
3. Customize the design system in `tailwind.config.ts`
4. Build your pages in `src/views/`
5. Create custom composables in `src/composables/`
6. Leverage the 30+ Reka UI components in `src/components/ui/`

## 🎨 Customization

### Tailwind Theme

Customize colors, fonts, and spacing in `tailwind.config.ts`:

```ts
theme: {
  extend: {
    colors: {
      // Your custom colors
    },
    fontFamily: {
      // Your custom fonts
    },
  }
}
```

### Component Library

This template includes a comprehensive UI component library in `src/components/ui/` with 30+ components. Components are built with:

- **Reka UI v2+** for accessibility and logic (formerly Radix Vue)
- **Tailwind CSS** for styling and theming
- **TypeScript** for type safety and IntelliSense
- **Vue 3 Composition API** for modern development patterns

**Key Features:**

- WCAG compliant accessibility
- Unstyled primitives for complete design freedom
- Dark/light mode support
- Mobile-responsive design
- TypeScript definitions included

**Available Components:** Accordion, Alert, Avatar, Badge, Button, Calendar, Card, Carousel, Checkbox, Dialog, Dropdown, Form, Input, Select, Table, Tabs, and many more!

## 🔧 IDE Setup

### Recommended

- **VS Code** with the following extensions:
  - [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (formerly Volar)
  - [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)
  - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

### Type Support

TypeScript support for `.vue` imports is enabled through `vue-tsc`. The template includes proper type declarations in `src/vite-env.d.ts`.

## 📦 Build & Deploy

The built files will be in the `dist/` directory, ready for deployment to:

- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: Any CDN that supports static files
- **Traditional Servers**: Apache, Nginx, etc.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📄 License

This project is [Apache License, Version 2.0](LICENSE) licensed.

---

**Made with ❤️ by [k1lgor](https://github.com/k1lgor)**
