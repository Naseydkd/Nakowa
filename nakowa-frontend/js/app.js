import { router } from './core/router.js';
import { initAuth } from './core/auth.js';
import { ui } from './core/ui.js';

document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    router.init();
    ui.init();
});
