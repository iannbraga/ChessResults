# AI Development Rules for `dyad-vue-template`

This document outlines the technology stack and specific library usage guidelines for the `dyad-vue-template` application. Adhering to these rules will help maintain consistency, improve collaboration, and ensure the AI assistant can effectively understand and modify the codebase.

## Tech Stack Overview

The application is built using the following core technologies:

- **Framework**: Vue with Composition API & `<script setup>` syntax
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Components**: Reka UI (v2+) + Shadcn/UI Vue components
- **Styling**: Tailwind CSS with tailwindcss-animate plugin
- **State Management**: Pinia
- **Forms & Validation**: VeeValidate + Zod
- **Notifications/Toasts**: Vue Sonner
- **Data Tables**: @tanstack/vue-table
- **Routing**: Vue Router
- **Utilities**: @vueuse/core
- **Icons**: Lucide Vue Next
- **Package Manager**: Bun (primary) / npm / yarn / pnpm compatible
- **Development**: Hot Module Replacement (HMR) via Vite + Vue DevTools

## Project Structure Guidelines

```
src/
├── components/
│   ├── ui/                 # Reka UI + Shadcn/UI components (30+ components)
│   └── [custom]/           # Custom project components
├── composables/            # Vue composables (e.g., useIsMobile)
├── views/                  # Page-level components
├── router/                 # Vue Router configuration
├── stores/                 # Pinia stores
├── lib/                    # Utility functions (utils.ts)
├── assets/                 # Static assets
├── global.css              # Global styles (consolidated CSS)
└── main.ts                 # Application entry point
```

## Library Usage Guidelines

To ensure consistency and leverage the chosen stack effectively, please follow these rules:

### 1. UI Components

- **Primary Choice**: Always prioritize using components from the `src/components/ui/` directory (Reka UI v2+ based components).
- **Component Library**: Reka UI (formerly Radix Vue) provides 30+ accessible, unstyled primitive components with full logic and accessibility built-in.
- **Advantages of Reka UI**:
  - **Accessibility**: WCAG compliant components with proper ARIA attributes
  - **Unstyled**: Complete styling freedom with Tailwind CSS
  - **TypeScript**: Full TypeScript support with excellent type inference
  - **Active Ecosystem**: Powers Shadcn Vue, Nuxt UI, and many production apps
  - **Vue-Native**: Built specifically for Vue 3, not a port
  - **Composable Architecture**: Leverages Vue's Composition API properly
- **Custom Components**: If a required component is not available in the UI library, create a new component in `src/components/` following the established patterns.
- **Styling**: Use Reka UI primitives for accessibility and Tailwind CSS for styling.
- **Avoid**: Introducing new, third-party UI component libraries without discussion.
- **Documentation**: Refer to [Reka UI docs](https://reka-ui.com) for component APIs and examples.

### 2. Styling

- **Primary Choice**: Exclusively use Tailwind CSS utility classes for all styling.
- **Configuration**: Use the TypeScript configuration in `tailwind.config.ts` with:
  - Class-based dark mode (`dark:` prefix)
  - Extended color palette using CSS variables
  - Animation keyframes and tailwindcss-animate plugin
  - Custom design tokens for consistent theming
- **Global Styles**: Reserve `src/global.css` for:
  - Tailwind directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`)
  - CSS custom properties and design tokens
  - Global base styles and resets (html, body margin/padding)
  - Minimal component-agnostic styles
- **Design System**: Leverage the configured design tokens for colors, spacing, and typography.
- **Dark Mode**: Use class-based dark mode (`dark:` prefix) as configured.
- **Responsive Design**: Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`).
- **CSS-in-JS**: Do not use CSS-in-JS libraries (e.g., Styled Components, Emotion).
- **PostCSS**: Use the configured PostCSS setup with autoprefixer.

### 3. State Management

- **Primary Choice**: Use Pinia for global state management.
- **Store Structure**: Create stores in `src/stores/` directory.
- **Local State**: Use Vue's `ref`, `reactive`, and `computed` for component-level state.
- **Complex Global State**: For state shared between multiple components, prefer Pinia stores.
- **TypeScript**: Ensure all stores are properly typed.

### 4. Forms & Validation

- **Form Management**: Use VeeValidate for form logic (state, validation, submission).
- **Schema Validation**: Use Zod for schema-based validation with VeeValidate.
- **Form Components**: Utilize form components from `src/components/ui/form/`.
- **Accessibility**: Ensure proper form labeling and error handling.

### 5. Routing

- **Primary Choice**: Utilize Vue Router for routing.
- **File Structure**: Keep routes in `src/router/index.ts`.
- **Route Structure**: Use descriptive route names and proper TypeScript typing.
- **Navigation**: Use `RouterLink` and programmatic navigation appropriately.

### 6. Notifications/Toasts

- **Primary Choice**: Use Vue Sonner component for all toast notifications.
- **Implementation**: Import from `src/components/ui/sonner/`.
- **Consistency**: Use consistent toast patterns throughout the application.

### 7. Charts & Data Visualization

- **Primary Choice**: Use `@tanstack/vue-table` for data tables and associated chart components.
- **Chart Components**: Utilize chart components from `src/components/ui/chart/` when available.
- **Data Handling**: Ensure proper data formatting and TypeScript typing.

### 8. Utility Functions

- **Location**: General-purpose helper functions should be placed in `src/lib/utils.ts`.
- **Quality**: Ensure functions are well-typed and serve a clear, reusable purpose.
- **Testing**: Consider adding unit tests for complex utility functions.
- **Naming**: Use descriptive function names and proper documentation.

### 9. Custom Composables

- **Location**: Custom Vue composables should be placed in the `src/composables/` directory.
- **Naming**: Use the `use` prefix (e.g., `useIsMobile`, `useAuth`, `useLocalStorage`).
- **TypeScript**: Ensure proper typing for inputs, outputs, and return values.
- **Reusability**: Design composables to be reusable across components.
- **Available Composables**:
  - `useIsMobile()`: Reactive mobile/desktop detection with 768px breakpoint
  - More composables can be added following the same patterns
- **Best Practices**:
  - Use Vue's reactivity system (`ref`, `reactive`, `computed`)
  - Proper lifecycle management (`onMounted`, `onUnmounted`)
  - Return computed properties for reactive values
  - Handle SSR compatibility when applicable

### 10. TypeScript Best Practices

- **Primary Choice**: Write all new code in TypeScript.
- **Quality**: Strive for strong typing and leverage TypeScript's features to improve code quality and maintainability.
- **Avoid**: Using `any` where possible; prefer proper type definitions.
- **Interfaces**: Define interfaces for complex data structures.
- **Generics**: Use generics for reusable components and functions.
- **Type Guards**: Implement type guards for runtime type safety.

### 11. Vue 3 Composition API

- **Primary Choice**: Use the Composition API with `<script setup>` syntax for better type inference and organization.
- **Props and Emits**: Define props with type definitions and defaults using `defineProps`. Use `defineEmits` for component events.
- **Reactivity**: Use `ref`, `reactive`, and `computed` for reactive state management.
- **Side Effects**: Use `watch` and `watchEffect` for side effects.
- **Lifecycle**: Use composition API lifecycle hooks (`onMounted`, `onUnmounted`, etc.).
- **Dependency Injection**: Use `provide` and `inject` for deep component communication.

### 12. Component Conventions

- **Naming**: Use PascalCase for component filenames and component names (e.g., `TodoItem.vue`).
- **Single File Components**: Use the standard SFC structure with `<template>`, `<script setup>`, and `<style>` blocks.
- **Props**: Define props with proper TypeScript interfaces and default values.
- **Emits**: Explicitly define component events using `defineEmits`.
- **Slots**: Use named slots appropriately and provide proper slot documentation.

## Development Workflow

### Package Management

- **Primary**: Use Bun for package management and script execution for optimal performance.
- **Compatibility**: Ensure compatibility with npm, yarn, and pnpm.
- **Commands**:
  - `bun dev` / `pnpm run dev` - Development server (runs on http://localhost:5173)
  - `bun run build` / `pnpm run build` - Production build with type checking
  - `bun run preview` / `pnpm run preview` - Preview production build
  - `pnpm run type-check` - TypeScript type checking
- **Version Requirements**: Node.js ^20.19.0 || >=22.12.0 as specified in package.json engines

### Code Quality

- **Linting**: Follow established linting rules.
- **Formatting**: Maintain consistent code formatting.
- **Type Checking**: Ensure all code passes TypeScript type checking.
- **Testing**: Write tests for complex logic and critical components.

### Performance Considerations

- **Lazy Loading**: Use dynamic imports for route-based code splitting.
- **Tree Shaking**: Write code that supports proper tree shaking.
- **Bundle Size**: Monitor and optimize bundle size.
- **Accessibility**: Ensure components meet accessibility standards.

### Version Control

- **Commits**: Write clear, descriptive commit messages.
- **Branching**: Use meaningful branch names.
- **Documentation**: Update documentation when making significant changes.

## Template-Specific Guidelines

### Starting Point

- The template provides a minimal starting point with:
  - Centered "Starting page" content with responsive layout
  - Clean footer component (MadeWithDyad) with proper centering
  - Responsive layout with flexbox-based App.vue structure
  - Complete UI component library (30+ Reka UI components)
  - CSS reset and global styles for consistent cross-browser rendering
  - Dark/light mode support with class-based theming
  - Mobile-responsive design with `useIsMobile` composable
  - TypeScript configuration with proper module resolution

### Customization

- **Design System**: Modify `tailwind.config.ts` for theme customization.
- **Components**: Extend or customize UI components as needed.
- **Layout**: Modify `src/App.vue` for application-wide layout changes.
- **Routing**: Add new routes in `src/router/index.ts`.

### Best Practices

- **Responsive Design**: Ensure all components work across screen sizes.
- **Dark Mode**: Test components in both light and dark modes.
- **Type Safety**: Maintain strong TypeScript typing throughout development.
- **Performance**: Consider performance implications of component design.
- **Accessibility**: Ensure components are accessible to all users.

By following these guidelines, we can build a more robust, maintainable, and consistent application that leverages the full power of the Vue 3 + TypeScript + Tailwind CSS stack.
