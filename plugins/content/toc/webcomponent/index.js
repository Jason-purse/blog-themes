(function() {
  if (customElements.get('blog-toc')) return;
  
  class TableOfContents extends HTMLElement {
    connectedCallback() {
      const cfg = (window.__BLOG_PLUGIN_CONFIG__ || {})['toc'] || {};
      const maxDepth = cfg.maxDepth || 'h3';
      const position = cfg.position || 'right';
      
      // Determine which headings to include
      const selectors = [];
      if (maxDepth === 'h2') selectors.push('h2');
      else if (maxDepth === 'h3') selectors.push('h2', 'h3');
      else selectors.push('h2', 'h3', 'h4');
      
      // Find all headings in the article
      const headings = [];
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach((el, idx) => {
          const id = el.id || `heading-${sel}-${idx}`;
          if (!el.id) el.id = id;
          headings.push({ id, text: el.innerText, level: parseInt(sel.charAt(1)) });
        });
      });
      
      if (headings.length === 0) return;
      
      // Create TOC container
      const container = document.createElement('nav');
      container.className = `blog-toc ${position}`;
      container.innerHTML = `
        <div class="blog-toc-title">目录</div>
        <ul class="blog-toc-list">
          ${headings.map(h => `
            <li>
              <a href="#${h.id}" class="toc-${h.level === 2 ? 'h2' : h.level === 3 ? 'h3' : 'h4'}" data-target="${h.id}">
                ${h.text}
              </a>
            </li>
          `).join('')}
        </ul>
      `;
      
      document.body.appendChild(container);
      
      // Scroll spy - highlight current section
      const links = container.querySelectorAll('a');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            links.forEach(l => l.classList.remove('active'));
            const activeLink = container.querySelector(`a[data-target="${entry.target.id}"]`);
            if (activeLink) activeLink.classList.add('active');
          }
        });
      }, { rootMargin: '-80px 0px -60% 0px' });
      
      headings.forEach(h => {
        const el = document.getElementById(h.id);
        if (el) observer.observe(el);
      });
      
      this._cleanup = () => {
        observer.disconnect();
        container.remove();
      };
    }
    
    disconnectedCallback() {
      this._cleanup?.();
    }
  }
  
  customElements.define('blog-toc', TableOfContents);
})();
