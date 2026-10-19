Icon-only controls from the comparison table and picker; every variant keeps a 44px touch target.

```jsx
<IconButton variant="add" size="md" label="Add country" onClick={openPicker} />
<IconButton variant="remove" label="Remove Japan" onClick={() => remove('JP')} />
<IconButton variant="handle" label="Reorder Population" />
<IconButton variant="close" label="Close" onClick={close} />
```

- `add`: blue-700 fill + shadow-sm, hover blue-800, press scale .94; disabled → gray-300, no shadow.
- `remove`: red-600 24px, hover red-700, press .92; disabled 35% opacity. Edit mode only.
- `handle`: gray-400 grip on transparent, hover gray-50 fill. `cursor: grab`.
- `close`: muted × on transparent, hover gray-50.
