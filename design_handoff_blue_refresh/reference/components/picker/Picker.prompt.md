Searchable picker for adding a country or metric — a bottom sheet on phones, a 360px popover anchored to the opening button on wide screens.

```jsx
<Picker
  open={open} mode={isPhone ? 'sheet' : 'popover'}
  title="Add a country" placeholder="Search countries" emptyMessage="No countries match"
  items={countries.map(c => ({ id: c.code, label: c.name, leading: c.flag, hint: c.code, keywords: [c.code3, ...c.aliases] }))}
  onSelect={(it) => add(it.id)} onClose={() => setOpen(false)}
/>
```

- Sheet: 16px top radius, grabber, 40% backdrop, slides up 0.2s. Popover: 12px radius, 1px border, shadow-lg, 12% backdrop, fades 0.12s.
- Options 48px, 10px radius; the keyboard/hover-active option is tinted blue-50.
- Arrow keys move, Enter picks, Escape or backdrop click closes.
