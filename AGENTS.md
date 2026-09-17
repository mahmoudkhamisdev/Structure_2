# Core Developer Rules & Safeguards

You must follow these strict guidelines for every single code generation task in this project to ensure safety, consistency, avoid crashes, and keep the code beginner-friendly.

## 0. Mandatory Tech Stack & UI Component Strategy

The project must use the following technologies latest version:

- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**

These technologies are mandatory and should be used consistently across the entire project.

### Next.js

- Use **Next.js with the App Router**.
- Prefer Server Components by default.
- Only use `"use client"` when client-side interactivity is actually required.
- Use Next.js Server Actions for backend mutations whenever appropriate.
- Follow proper Next.js project structure and conventions.

### TypeScript

- All files should use TypeScript whenever possible.
- Use `.ts` and `.tsx` files instead of JavaScript.
- Define proper interfaces and types for:
  - Component props
  - API responses
  - Server Action inputs
  - Server Action outputs
  - Database data
  - Forms
- Never use implicit `any`.
- Avoid `any` unless there is absolutely no reasonable alternative.

### Tailwind CSS

- Use **Tailwind CSS** for styling.
- Avoid separate CSS files unless they are genuinely necessary.
- Keep styling clean, responsive, reusable, and easy to understand.
- Avoid unnecessarily long or duplicated Tailwind class strings when a reusable component would be cleaner.

### shadcn/ui — Mandatory Component Research

Before building a custom UI component, always check the available **shadcn/ui components first**.

You must actively browse/review the available shadcn/ui component library and determine whether an existing component can be used or adapted.

Do not immediately create custom components if shadcn/ui already provides a suitable solution.

Check available shadcn/ui components such as:

- Button
- Card
- Input
- Textarea
- Select
- Checkbox
- Radio Group
- Switch
- Dialog
- Alert Dialog
- Drawer
- Sheet
- Dropdown Menu
- Context Menu
- Command
- Popover
- Tooltip
- Tabs
- Accordion
- Collapsible
- Table
- Data Table patterns
- Pagination
- Breadcrumb
- Sidebar
- Navigation Menu
- Menubar
- Avatar
- Badge
- Alert
- Skeleton
- Spinner/loading patterns
- Progress
- Calendar
- Date Picker patterns
- Form
- Label
- Toast / Sonner
- Carousel
- Scroll Area
- Separator
- Resizable
- Hover Card
- Combobox patterns
- Charts
- Empty states
- Authentication/form patterns
- Dashboard patterns

When implementing a page or feature:

1. Analyze the UI requirements.
2. Review the available shadcn/ui components.
3. Identify which components can be reused.
4. Prefer composing multiple shadcn components instead of building everything from scratch.
5. Customize them with Tailwind when necessary.
6. Only create a custom component when shadcn/ui does not provide a suitable foundation.

The goal is to maintain a consistent, professional UI while reducing unnecessary custom code.

---

## 1. Global Server-Side Handling & NextAuth Session Verification

- All database operations, validations, permissions, and business logic must be handled strictly on the backend, such as:
  - Supabase RLS
  - Next.js Server Actions using the `'use server'` directive.

- Never trust the frontend to validate data, permissions, authentication, authorization, or business logic.

- Always authenticate user sessions on the server inside Server Actions using NextAuth:
  - `auth()`
  - or `getServerSession(authOptions)`

- Never trust client-provided:
  - User IDs
  - Emails
  - Roles
  - Permissions
  - Ownership information

Always extract and verify the authenticated user's identity directly from the server-side session before executing protected logic.

---

## 2. Graceful Error Handling & Security

- Every backend function or Server Action must use `try/catch` blocks.

- Log detailed technical errors only on the server using:

```ts
console.error(error);
```

- Never expose raw technical errors to the frontend.

Return clean, generic and user-friendly errors such as:

```ts
{
  success: false,
  error: "An unexpected error occurred. Please try again later."
}
```

- Never expose:
  - Database schemas
  - SQL errors
  - Stack traces
  - Internal paths
  - Environment variables
  - Authentication secrets
  - Raw query errors
  - Sensitive server information

---

## 3. Frontend Runtime Crash Prevention

Always protect frontend components from crashes caused by asynchronous, incomplete, `null`, or `undefined` data.

Use optional chaining for nested data:

```ts
issue?.user?.name;
```

Provide safe fallback values:

```ts
issue?.title || "Untitled Task";
```

or:

```ts
issue?.title ?? "Untitled Task";
```

Never assume arrays always exist.

Instead of:

```tsx
issues.map(...)
```

use:

```tsx
(issues || []).map(...)
```

or normalize the data before rendering.

Always provide safe UI states for:

- Loading
- Empty results
- Missing data
- Errors
- Unauthorized states

Use shadcn/ui components such as `Skeleton`, `Alert`, `Card`, or other suitable components for these states whenever appropriate.

add the files that repeat in the project in component and the files that in spesific route in \_components in the route file itself

---

## 4. Zero TypeScript Compilation Errors

All generated code must compile without TypeScript errors.

- Explicitly type Server Action inputs.
- Explicitly type Server Action outputs.
- Type React component props.
- Type database responses where appropriate.
- Avoid implicit `any`.
- Avoid unsafe type assertions.
- Avoid unnecessary advanced TypeScript patterns that make the code difficult for beginners to maintain.

Prefer simple and readable types such as:

```ts
interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

Keep components and Server Actions modular and understandable.

---

## 5. Component Reusability & Project Structure

Avoid creating very large page components.

Break the UI into reusable components when appropriate.

For example:

```text
components/
  ui/
  shared/
  dashboard/
  forms/
  layout/
```

Keep shadcn/ui base components inside:

```text
components/ui/
```

Build project-specific reusable components on top of them instead of modifying the original shadcn components unnecessarily.

Prefer:

```tsx
<UserCard />
<SearchFilters />
<ListingCard />
<EmptyState />
<PageHeader />
```

instead of putting hundreds of lines inside a single `page.tsx`.

---

## 6. Forms & Validation

Use proper server-side validation for all submitted data.

Frontend validation should improve user experience, but it must never be considered a security layer.

When suitable, use:

- React Hook Form
- Zod
- shadcn/ui Form components

Example flow:

```text
User Form
   ↓
Client-side validation
   ↓
Server Action
   ↓
Server-side Zod validation
   ↓
Session verification
   ↓
Authorization check
   ↓
Database operation
```

Never write directly to the database based solely on client-provided values.

---

## 7. Responsive & Professional UI

Every page should be responsive by default.

Consider:

- Mobile
- Tablet
- Desktop

Use Tailwind responsive breakpoints appropriately.

Prefer clean, modern interfaces using shadcn/ui instead of unnecessarily complicated custom designs.

Maintain consistent:

- Spacing
- Border radius
- Typography
- Form styles
- Button styles
- Cards
- Dialogs
- Colors
- Loading states
- Empty states

---

## 8. Keep the Code Beginner-Friendly

Prefer simple, readable implementations.

Avoid:

- Unnecessary abstractions
- Excessive design patterns
- Deep component nesting
- Over-engineering
- Complex generic TypeScript types
- Large dependency additions when Next.js, Tailwind, or shadcn/ui can already solve the problem

When multiple approaches are possible, prefer the approach that is:

1. Secure
2. Stable
3. Easy to understand
4. Easy to maintain
5. Consistent with Next.js
6. Consistent with shadcn/ui
