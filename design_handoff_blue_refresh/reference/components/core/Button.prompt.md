The app's text button — 44px tall, 10px radius, 14px medium label; used in the pinned table toolbar.

```jsx
<Button icon="plus" onClick={openMetricPicker}>Add metric</Button>
<Button variant={editing ? 'primary' : 'default'} aria-pressed={editing} onClick={toggle}>
  {editing ? 'Done' : 'Edit'}
</Button>
```

- `default`: white fill, gray-200 border; hover → blue-50 fill, blue-300 border, blue-700 text.
- `primary`: blue-700 fill, white text; hover → blue-800. Only the active Edit state uses it.
- `icon` shifts padding to 12px left / 16px right. Disabled drops to 45% opacity.
