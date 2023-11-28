document.addEventListener('DOMContentLoaded', () => {
    const prefersDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (prefersDarkTheme) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.add('light-theme');
    }
});