export const ui = {
    init() {
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('main-sidebar');
        const mainContent = document.getElementById('main-content');
        const header = document.getElementById('main-header');

        if (menuToggle && sidebar && mainContent && header) {
            menuToggle.addEventListener('click', () => {
                const isMobile = window.innerWidth <= 768;
                
                if (isMobile) {
                    sidebar.classList.toggle('open');
                } else {
                    sidebar.classList.toggle('collapsed');
                    mainContent.classList.toggle('expanded');
                    header.classList.toggle('expanded');
                }
            });
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                sidebar && 
                !sidebar.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }
};
