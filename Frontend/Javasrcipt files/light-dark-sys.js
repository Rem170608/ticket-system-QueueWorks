document.addEventListener('DOMContentLoaded', () => {
  const themeSelector = document.getElementById('theme-selector');

  themeSelector.addEventListener('change', (event) => {
    if (event.target.value === 'light') {
      document.documentElement.style.colorScheme = 'light';
    } else if (event.target.value === 'dark') {
      document.documentElement.style.colorScheme = 'dark';
    }
  });
});