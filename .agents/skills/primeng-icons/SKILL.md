---
name: primeng-icons
description: Guidelines and specifications for using PrimeIcons and PrimeNG icon components (like p-iconfield and p-inputicon) in PrimeNG 18+ and 21.
---

# PrimeNG Icons Skill (PrimeNG v20)

## 1. PrimeIcons Overview
In PrimeNG 20, icons are consumed using standard CSS-based classes through the `primeicons` package. 
We do NOT import individual standalone SVG icon components from `@primeicons/angular` (which is for v21+).

Instead, add the icon class (e.g. `pi pi-user`) directly to the icon elements or to `<p-inputicon>`.

Example:
```html
<i class="pi pi-check"></i>
<i class="pi pi-times"></i>
```

You can customize the size and color using standard Tailwind or CSS classes:
```html
<i class="pi pi-check text-indigo-500 text-sm"></i>
```

## 2. Icon Fields (p-iconfield and p-inputicon)
In PrimeNG 20, the correct way to group form inputs with icons is using the `<p-iconfield>` and `<p-inputicon>` components.

### Syntax
Wrap the input element (like `input pInputText`, `<p-password>`, or similar) and the `<p-inputicon>` component inside `<p-iconfield>`.
Pass the class names for the desired icon directly to the `<p-inputicon>` component. Do NOT nest SVG elements or use `@primeicons/angular` imports.

```html
<p-iconfield>
  <p-inputicon class="pi pi-search" />
  <input type="text" pInputText placeholder="Search" class="w-full" />
</p-iconfield>
```

```html
<p-iconfield>
  <input type="text" pInputText />
  <p-inputicon class="pi pi-spinner pi-spin" />
</p-iconfield>
```

### Key Considerations
1. The `<p-inputicon>` component should have the `class` attribute indicating the icon classes (e.g. `class="pi pi-user"`).
2. Do not use manual padding classes inside `<p-iconfield>`, as PrimeNG handles the positioning and padding of the input automatically.
3. Import `IconFieldModule` and `InputIconModule` from `primeng/iconfield` and `primeng/inputicon` in the component's imports block. Do NOT import `@primeicons/angular` components.
