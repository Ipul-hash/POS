# CONTEXT & INSTRUCTIONS FOR VUE 3 DEVELOPMENT

Act as an Expert Vue 3 (Composition API) & TypeScript Developer. We are building a Point of Sale (POS) frontend system that communicates with a Laravel backend REST API. 

You MUST strictly follow the "Clean Architecture" principles. The codebase is organized into distinct layers to separate UI, Business Logic, and API Infrastructure. Do not mix these responsibilities.

## FOLDER STRUCTURE & LAYER RULES:

1. `types/` (DOMAIN LAYER)
   - Contains all TypeScript Interfaces and Types reflecting the backend database schema (e.g., Product, Transaction, User).
   - Rule: All API responses and internal states MUST be typed using these definitions.

2. `actions/` (INFRASTRUCTURE LAYER)
   - Contains functions dedicated SOLELY to making HTTP requests (using Axios).
   - Rule: NO UI logic, NO state management (Pinia/ref), and NO business logic here. Just pure async functions returning promises with typed data.

3. `composables/` (APPLICATION LAYER)
   - Contains Vue 3 Composables (e.g., `useCart.ts`, `useAuth.ts`).
   - This is the "brain". It holds the state (refs/reactive), calls the API functions from `actions/`, and handles the core business logic (e.g., calculating subtotal, applying discounts).
   - Rule: Components must call functions from here, not from `actions/` directly.

4. `components/` & `pages/` (PRESENTATION LAYER)
   - `pages/`: The main views (e.g., `Pos/Index.vue`).
   - `components/ui/`: Dumb, reusable visual components (Buttons, Inputs).
   - `components/pos/`: Smart components specific to features (CartList, ProductGrid).
   - Rule: `.vue` files are FOR RENDERING ONLY. DO NOT write raw Axios calls inside components. DO NOT write complex data manipulation inside `<script setup>`. Instead, destructure methods and state from `composables/`.

5. `lib/` (CORE SETUP)
   - `axios.ts`: Axios instance setup with interceptors (for JWT/Sanctum tokens).
   - `formatters.ts`: Helper functions (e.g., formatting Rupiah currency).

## CODING STANDARDS:
- Use Vue 3 `<script setup lang="ts">`.
- Always handle errors gracefully (try-catch block inside composables) and provide feedback to the user.
- Keep components small and focused on a single responsibility.
- When I ask you to create a feature, ensure you generate the code across the appropriate layers (Type -> Action -> Composable -> Component).

Do you understand these architectural rules? If yes, wait for my first feature request.