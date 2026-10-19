The picker's search field — 44px high, gray-50 fill at rest, white + 2px blue-500 outline on focus, 16px text so iOS never zooms.

```jsx
<SearchInput value={q} onChange={setQ} placeholder="Search countries" autoFocus />
```

- Always 16px (`--font-size-base`) — smaller triggers iOS focus zoom.
- `forceFocus` renders the focused look for documentation.
