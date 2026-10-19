// Resolves the Country Comparator component namespace for cards and kits.
// Prefers the compiled bundle (_ds_bundle.js); if it isn't present yet, it
// fetches the component sources and transpiles them in the page (needs
// React, ReactDOM and @babel/standalone loaded first).
(function () {
  const FILES = [
    'components/core/interaction.js', 'components/core/Icon.jsx', 'components/core/Button.jsx',
    'components/core/IconButton.jsx', 'components/forms/SearchInput.jsx', 'components/picker/Picker.jsx',
    'components/brand/Mark.jsx', 'components/navigation/Header.jsx', 'components/navigation/Footer.jsx',
    'components/table/ComparisonTable.jsx',
  ];
  const NAMES = ['Icon', 'Button', 'IconButton', 'SearchInput', 'Picker', 'filterItems', 'Mark', 'Header', 'Footer', 'ComparisonTable'];
  const find = () => {
    for (const k of Object.keys(window)) {
      try { const v = window[k]; if (v && typeof v === 'object' && v.ComparisonTable && v.Button && v.Picker) return v; } catch (e) { /* cross-origin frame */ }
    }
    return null;
  };
  let pending = null;
  window.ccLoad = function (root) {
    const ns = find();
    if (ns) return Promise.resolve(ns);
    if (pending) return pending;
    pending = Promise.all(FILES.map((f) => fetch(root + f).then((r) => r.text()))).then((texts) => {
      const src = texts.map((t) => t.replace(/^import .*$/gm, '').replace(/^export (function|const)/gm, '$1')).join('\n');
      const code = window.Babel.transform(src + '\nwindow.__CC = {' + NAMES.join(',') + '};', { presets: ['react'] }).code;
      new Function(code)();
      return window.__CC;
    });
    return pending;
  };
})();
