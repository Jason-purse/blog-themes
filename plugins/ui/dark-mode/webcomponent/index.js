(function() {
  if (customElements.get('blog-dark-mode')) return;
  
  class DarkModeToggle extends HTMLElement {
    connectedCallback() {
      const cfg = (window.__BLOG_PLUGIN_CONFIG__ || {})['dark-mode'] || {};
      const followSystem = cfg.followSystem ?? true;
      const position = cfg.position || 'top-right';
      
      // Get initial theme
      const getInitialTheme = () => {
        const stored = localStorage.getItem('blog-theme');
        if (stored) return stored;
        if (followSystem && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
        return 'light';
      };
      
      const currentTheme = getInitialTheme();
      document.documentElement.dataset.theme = currentTheme;
      
      // Create toggle button
      const btn = document.createElement('button');
      btn.className = 'blog-dark-mode-btn';
      btn.setAttribute('aria-label', '切换深色/浅色模式');
      btn.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
      
      // Button styles
      const style = document.createElement('style');
      style.textContent = `
        .blog-dark-mode-btn {
          position: fixed;
          ${position === 'top-left' ? 'left: 24px;' : 'right: 24px;'}
          top: 24px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .blog-dark-mode-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        [data-theme="dark"] .blog-dark-mode-btn {
          background: #1e293b;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(btn);
      
      // Toggle handler
      btn.addEventListener('click', () => {
        const newTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = newTheme;
        localStorage.setItem('blog-theme', newTheme);
        btn.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
      });
      
      // Listen for system changes
      if (followSystem) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
          if (!localStorage.getItem('blog-theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.dataset.theme = newTheme;
            btn.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
          }
        });
      }
      
      this._cleanup = () => {
        btn.remove();
        style.remove();
      };
    }
    
    disconnectedCallback() {
      this._cleanup?.();
    }
  }
  
  customElements.define('blog-dark-mode', DarkModeToggle);
})();
