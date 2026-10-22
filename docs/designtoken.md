# Design Tokens & UI Implementation Specification
## RealEstateIQ — Real Estate Price Prediction ML Application

**Application name:** RealEstateIQ  
**Frontend:** Next.js  
**Reference:** [Estalio — Premium Real Estate Agency Template on Dribbble](https://dribbble.com/shots/26952559-Estalio-Premium-Real-Estate-Agency-Template)  
**Purpose:** Implementation contract for Antigravity's Gemini agent.  
**Priority:** Mobile-first, responsive, reference-led visual fidelity.  
**Status:** Approved to create; values identified as provisional must be verified against the original reference.

---

## 1. Non-negotiable implementation rules

1. Use **Next.js** for the frontend. Reuse the existing project architecture if one already exists; inspect it before creating or replacing files.
2. Treat the Estalio Dribbble link above as the primary visual reference. Review the supplied reference and assets before implementing pages.
3. Follow this document as the design and motion contract. **Do not invent a different visual style, add arbitrary animations, or redesign sections without a functional reason.**
4. Aim for the closest feasible visual match to the reference, especially its section composition, content proportions, typography hierarchy, image placement, whitespace, colors, controls, and interaction behavior. Do not claim a specific similarity percentage without screenshot comparison.
5. Build **mobile-first**. Start with narrow screens and progressively enhance for tablet, laptop, and desktop.
6. Use original reference assets when legitimately available. If unavailable, use the generated/project-provided architectural assets or source/generate close alternatives. Do not use unrelated stock imagery or random placeholders.
7. Keep this as a real-estate price prediction application. Preserve the features described in the project requirements; do not copy unrelated real-estate agency functionality as if it were required.
8. All shared components must consume the same design tokens. Avoid page-specific styling that causes visual drift.
9. Inspect the current repository and dependencies before installing libraries or changing configuration. Do not replace existing working functionality merely to match this document.
10. No fake functionality: forms, authentication states, filters, pagination, prediction actions and admin actions must connect to the project's real API/state or clearly indicate when backend integration is pending.

## Application identity

- The application/product name is **RealEstateIQ**.
- Use **RealEstateIQ** consistently in the product's visible branding, page metadata, document references, and UI copy where the application name is needed.
- Do not use “Estalio” as the application's name. Estalio is the design reference/template only.
- Do not rename the project to Estalio or copy its brand identity/logo. Create a suitable RealEstateIQ wordmark treatment consistent with the approved visual direction.

## 2. Product scope and page map

The source project document describes a user module and an admin module. Build the following pages/states as appropriate to the existing application:

### Public and user pages
- Home / landing page
- Sign in
- Registration
- Property price prediction form
- Prediction result
- Prediction history
- User profile and account settings

### Admin pages
- Admin dashboard with key counts/statistics
- Registered-user management
- Prediction records/history
- Prediction reports with date-range filtering
- Admin profile/settings

### Shared UI states
- Loading and submitting
- Empty states
- Validation errors
- API/backend errors
- Success confirmation
- Disabled controls
- Pagination and filtering states
- Mobile navigation open/closed

Do not add unsupported claims such as guaranteed model accuracy, real-time market data, verified property prices, testimonials, or performance statistics. Any displayed numbers must come from the actual project/data or be explicitly marked as sample content during development.

## 3. Visual direction

### Agreed direction
- Premium, light, editorial real-estate aesthetic.
- Elegant **serif headings** paired with clean **sans-serif interface text**.
- Warm light surfaces, dark readable text, restrained borders, generous but controlled whitespace.
- Architectural/property photography is a key visual ingredient, especially on the landing page.
- One restrained accent color; avoid competing accent colors.
- Admin screens must share the same visual identity as public pages, while prioritizing data readability.
- Preserve Estalio's actual composition wherever the reference can be verified. Adapt only where the ML workflow requires different content or controls.

### Palette candidates
The following colors were published with the supplied Dribbble reference. Treat these as **reference palette candidates**, not final semantic assignments. Verify their actual usage against the reference before locking roles.

| Name | Hex | Proposed use (verify first) |
|---|---|---|
| Near-black | `#0D0B0B` | Main text / dark elements |
| Warm off-white | `#F1F0EF` | Main light surface |
| Deep warm brown | `#4D312E` | Optional secondary accent |
| Muted slate blue | `#5F7091` | Possible restrained accent |
| Charcoal violet | `#484651` | Secondary dark tone |
| Deep blue | `#3C5484` | Possible primary-action tone |
| Cool gray | `#9DA0A9` | Muted UI tone |
| Muted slate | `#797C90` | Secondary UI tone |

Rules:
- Prefer warm off-white and near-black as the foundation if consistent with the reference.
- Select **one** primary accent after checking the reference. Do not use all palette colors as equal accents.
- Keep text contrast accessible. Do not use pale gray for essential labels or controls.
- Define semantic CSS variables for background, surface, text, muted text, border, accent, accent-hover, focus, success, warning and error.
- Status colors are functional and must be paired with text/icons, never color alone.
- Avoid introducing gradients, glassmorphism, neon colors, heavy shadows or excessive rounded cards unless visible in the reference.

## 4. Typography tokens

Exact font families and weights must be verified from the original template/assets. Do not guess that an illustrative font is the original.

### Font roles
- `--font-display`: elegant editorial serif for hero and major headings.
- `--font-body`: readable sans-serif for paragraphs and general interface copy.
- `--font-ui`: sans-serif for labels, inputs, navigation, buttons, tables and metadata; may share the body family.
- `--font-numeric`: use the body/UI font for tables and data; a display face may be used selectively for the primary predicted-price figure only if legible and consistent with the reference.

### Type scale — provisional starting point
Use responsive `clamp()` values and refine after comparing screenshots:
- Hero heading: `clamp(2.5rem, 8vw, 6rem)`
- Page heading: `clamp(2rem, 5vw, 3.75rem)`
- Section heading: `clamp(1.75rem, 4vw, 3rem)`
- Card heading: `1.125rem–1.5rem`
- Body: `1rem` (do not reduce below comfortable readability)
- Supporting/meta: typically `0.8125rem–0.9375rem`, with adequate contrast
- Form labels: typically `0.875rem–1rem`

Typography rules:
- Preserve deliberate line breaks and heading width from the reference where visible.
- Avoid excessive letter spacing or all-caps text unless the reference uses it.
- Body copy should have comfortable line-height, usually around `1.5–1.7`.
- Headings should use a tighter line-height, tuned to the selected font.
- Do not use serif fonts for dense tables, field labels, or long UI instructions.

## 5. Spacing, layout and shape tokens

Exact values are not yet verified. Use this consistent base scale, then tune against the reference:
- `--space-1: 0.25rem`
- `--space-2: 0.5rem`
- `--space-3: 0.75rem`
- `--space-4: 1rem`
- `--space-5: 1.5rem`
- `--space-6: 2rem`
- `--space-7: 3rem`
- `--space-8: 4rem`
- `--space-9: 6rem`

Layout:
- Use a consistent responsive page gutter; start around `1rem` on small phones, `1.5rem` on larger screens, and `2.5rem–4rem` on wide screens, then match the reference.
- Use a centered max-width content container where the reference indicates one.
- Avoid horizontal overflow at every viewport.
- Use CSS Grid/Flexbox and fluid sizing instead of fixed desktop widths.
- Keep section spacing generous on large screens but reduce it proportionally on mobile.
- Use image aspect ratios and `object-position` intentionally to preserve the subject and composition.
- Define radius tokens only after checking the reference. Use restrained radii; do not make every element pill-shaped.
- Borders should be subtle and consistent. Avoid default heavy shadows.

## 6. Mobile-first responsive requirements

Mobile is the primary design target, not a secondary adaptation.

### Breakpoints
Use project conventions if already present. Otherwise, begin with:
- Small: `0–479px`
- Mobile / large phone: `480–767px`
- Tablet: `768–1023px`
- Desktop: `1024–1439px`
- Wide desktop: `1440px+`

Treat these as implementation breakpoints, not strict device categories.

### Mobile rules
- Stack multi-column layouts vertically where needed.
- Make primary actions easy to reach and clearly visible.
- Navigation should collapse into an accessible menu with a visible open/close state.
- Inputs and select controls must be comfortable to tap; aim for approximately 44px minimum interactive height.
- Avoid dense tables overflowing the viewport. Use responsive columns, a horizontal scroll container with clear affordance, or a mobile record/card presentation.
- Keep hero text readable over photography. Use the correct crop, a verified overlay if necessary, and preserve contrast.
- Do not place essential copy or CTA outside the mobile crop.
- Use responsive image sources/sizes and lazy-load below-the-fold imagery.
- Avoid heavy 3D effects and long animation sequences on smaller or lower-powered devices.
- Respect `prefers-reduced-motion`; provide a functional reduced-motion experience.
- Test navigation, forms, results, history, admin tables, dialogs and footer on real narrow viewport sizes.
- Do not simply shrink the desktop page. Recompose it thoughtfully while preserving the reference's hierarchy.

### Required test widths
At minimum, test at approximately `360px`, `390px`, `768px`, `1024px`, `1280px`, and `1440px`. Check for clipping, overflow, text wrapping, image crop, tap targets and navigation usability.

## 7. Homepage composition

Use the exact section order and layout from the reference wherever visible and verifiable. Do not assume the illustrative sections below are the exact Estalio section sequence. If a section is not present in the reference, include it only if required for the ML product and style it consistently.

### Hero
- Large architectural image is the primary visual anchor.
- Editorial serif headline, concise supporting copy and clear primary CTA.
- CTA should lead to the prediction workflow.
- Keep navigation clear and restrained.
- Use intentional image cropping across breakpoints.
- Use supplied/generated architectural assets where original reference images cannot be accessed.
- Do not add floating 3D objects unless they support the reference's visual language and do not obstruct copy or controls.

### Supporting sections
Where appropriate to the reference and product, explain the estimation workflow, show relevant property insights, introduce the prediction form, display recent prediction history, provide a concise about/approach section, answer genuine FAQs, and end with a clear CTA and footer. These are product proposals, not verified reference sections. Preserve the original order of any sections confirmed in the actual reference.

## 8. Prediction form and result

### Property form
The project document identifies these inputs:
- Location
- Total area / square feet
- Bedrooms
- Bathrooms
- Year built
- Garage availability

Implementation:
- Group fields logically and use explicit labels.
- Use appropriate input types, validation and helpful error messages.
- Provide keyboard focus and disabled/loading states.
- On mobile, prefer a single-column form unless the fields can remain comfortable and readable in a two-column arrangement.
- Primary action label should clearly communicate property price prediction.
- Never show a fabricated successful prediction when the backend/model is unavailable.

### Result state
- Make the predicted value the strongest numerical element.
- Display the submitted property attributes and prediction timestamp.
- Provide a clear action to make another prediction and a route to prediction history.
- Only show confidence, explanatory factors or accuracy indicators if the backend/model actually supplies valid values.
- Clearly label the output as an estimate, not a guaranteed sale price.

## 9. Prediction history and admin UI

### History
- Use readable date, location, area and estimated-price columns/fields as supported by actual data.
- Include loading, empty, error and pagination/filter states where applicable.
- On mobile, avoid forcing a full desktop table into a narrow viewport.

### Admin dashboard
- Reuse the application's typography, color roles, controls, spacing and surface styling.
- Show user/prediction counts only when backed by actual data.
- Keep data visualizations restrained, legible and useful.
- Tables must have accessible headings, row actions and visible focus states.
- Use clear confirmation for destructive actions.
- Do not invent statistics or charts just to fill empty space.

### Date reports
- Provide date-range inputs and a clear apply/reset flow.
- Preserve selected filters visibly.
- Make empty results and invalid date ranges understandable.
- Export actions are optional and must only be shown if implemented.

## 10. Motion and interaction contract

**Core stack:**
- **GSAP** — animation engine for selected, reference-appropriate motion and 3D floating objects where justified.
- **Lenis** — smooth scrolling, coordinated with GSAP ScrollTrigger when both are used.
- Use CSS transitions for simple hover/focus/pressed states; do not use GSAP for every tiny interaction.

### Strict reference-led motion rules
1. Inspect the actual reference and supplied recording/screenshots first.
2. Reproduce observable motion patterns where feasible.
3. Do not invent elaborate effects just because GSAP is installed.
4. 3D floating objects are permitted only where they support the reference composition, remain subtle, and never obscure text, inputs, buttons or navigation.
5. Motion must support hierarchy and feedback rather than delay the user.
6. Provide fallbacks for touch devices, reduced motion and low-powered devices.
7. Do not hijack scrolling or block native touch/keyboard behavior.
8. Avoid excessive parallax, cursor-following effects, constant floating, scroll-jacking or long entrance delays unless clearly verified in the reference.
9. All interactive states must work without animation.

### Microinteractions
Apply only where appropriate and consistent with the reference:
- Buttons: restrained hover/pressed/focus feedback.
- Navigation: clear active/hover state.
- Cards/images: subtle image or surface response on hover, only when the reference supports it.
- Inputs: visible focus, validation and disabled states.
- Menus/dialogs: clear entry/exit and keyboard behavior.
- Loading: useful feedback without excessive motion.
- Tables/filters: clear selected and hover states.

### Motion timing — provisional
Do not treat these as exact reference values. Start with short, restrained transitions and tune after visual inspection:
- Simple hover/focus: about `150–250ms`
- Small UI transition: about `200–350ms`
- Section reveal: about `400–700ms` only if reference-supported
- Use a restrained ease-out curve for entrances and a quick ease for interaction feedback.
- Avoid animating layout-heavy properties when transforms/opacity can achieve the same result.

### Lenis and GSAP integration
- Avoid conflicting scroll handlers or duplicate smooth-scroll implementations.
- If using GSAP ScrollTrigger with Lenis, integrate their update/refresh lifecycle according to the installed versions' official documentation.
- Clean up animation contexts, event listeners and triggers when React components unmount.
- Ensure route changes, modals, anchor links, keyboard navigation and reduced-motion mode still behave correctly.
- If smooth scrolling interferes with accessibility or mobile performance, disable or reduce it for that context.

## 11. Asset requirements

- Prefer original Estalio assets if available and permitted.
- Use the user-provided generated architectural hero image as a candidate asset; verify its actual project path before referencing it.
- If original assets are unavailable, source/generate cohesive architecture photography with similar subject, lighting, framing, tone and composition.
- Do not claim generated assets are the original Estalio assets.
- Do not create a new image for every section unnecessarily; use a cohesive, curated set.
- Images must have appropriate `alt` text when informative; decorative images should have empty alt text.
- Use responsive image sizing, suitable formats and lazy loading below the fold.
- Do not stretch images or use unrelated generic placeholders in the final UI.

## 12. Accessibility, quality and performance

- Use semantic HTML and accessible form labels.
- Ensure keyboard operation, visible focus, accessible menu/dialog behavior and appropriate ARIA only when needed.
- Preserve adequate contrast and readable text sizes.
- Respect `prefers-reduced-motion`.
- Prevent layout shifts by specifying image dimensions/aspect ratios.
- Lazy-load below-the-fold images and avoid unnecessary client-side JavaScript.
- Use Next.js image optimization where suitable.
- Avoid animation libraries or 3D packages beyond what the design needs.
- Keep prediction and admin actions understandable without visual effects.
- Never sacrifice mobile usability for a desktop-only visual trick.

## 13. Implementation workflow for Antigravity

Follow this sequence strictly:

1. **Inspect** the existing repository, routes, dependencies, backend/API integration and assets before editing.
2. **Study the reference** and any supplied screenshots/recordings. Record which details are verified and which are approximations.
3. **Map the pages** to the product scope and existing backend features.
4. **Define tokens** in one shared source (CSS variables / theme configuration) and use them across components.
5. **Build mobile-first** shared layout and primitives before page-specific UI.
6. **Implement pages** in the product page map without fabricating data or functionality.
7. **Add motion** only after static layouts are close to the reference. Use GSAP/Lenis according to the motion contract.
8. **Compare screenshots** at matching viewport sizes and iteratively correct layout, typography, imagery, color, spacing and interaction differences.
9. **Test responsiveness and accessibility** across the required viewport widths and reduced-motion settings.
10. **Report honestly** which pages and interactions are complete, what remains, and which reference details could not be verified.

## 14. Visual QA checklist

Before considering a page complete, verify:
- [ ] Section order and composition match the reference wherever verified.
- [ ] Content width, alignment and whitespace are close to the reference.
- [ ] Font family/weight hierarchy is consistent.
- [ ] Palette roles and accent usage are consistent.
- [ ] Image subjects, crop and aspect ratios are intentional.
- [ ] Buttons, inputs, borders and radii use shared tokens.
- [ ] Hover, focus, pressed, loading, error and success states work.
- [ ] Mobile layout is designed rather than merely scaled down.
- [ ] No horizontal overflow or clipped content at test widths.
- [ ] GSAP/Lenis effects are subtle, functional and reference-led.
- [ ] Reduced-motion and touch-device fallbacks work.
- [ ] No fake predictions, fabricated metrics or dead controls.
- [ ] Screenshot comparison has been performed and differences documented.

## 15. What is verified vs. provisional

### Agreed project decisions
- Next.js frontend.
- Mobile-first and responsive across phone, tablet and desktop.
- Premium light/editorial direction.
- Serif headings and sans-serif interface text.
- Neutral interface with one restrained accent.
- Estalio is the primary visual reference for RealEstateIQ.
- Match actual reference composition where verifiable.
- GSAP for selected animation and suitable 3D floating objects.
- Lenis for smooth scrolling.
- Microinteractions and hover effects must be reference-led.
- Apply a consistent visual identity to public, user and admin pages.

### Provisional / requires reference verification
- Exact font families, font weights and type scale.
- Exact semantic color assignments.
- Spacing, container widths, border radii and shadows.
- Exact section order and proportions when not visible in available material.
- Specific animation timings, easing, distances and 3D behaviors.
- Whether any specific optional landing-page section appears in the original template.

**Final instruction:** When a value or behavior is unverified, do not present it as an exact reference detail. Use the provisional defaults only as implementation starting points, compare with the original reference, and refine. The goal is the closest feasible, mobile-first reproduction—not a generic redesign inspired by luxury real estate.
