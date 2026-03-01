(function() {
  if (customElements.get('blog-code-highlight')) return;
  
  class CodeHighlight extends HTMLElement {
    connectedCallback() {
      const cfg = (window.__BLOG_PLUGIN_CONFIG__ || {})['code-highlight'] || {};
      const theme = cfg.theme || 'github';
      
      const loadHLJS = async () => {
        // Load highlight.js CSS
        const themeLink = document.createElement('link');
        themeLink.rel = 'stylesheet';
        themeLink.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${theme}.min.css`;
        document.head.appendChild(themeLink);
        
        // Load highlight.js JS
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
        
        return new Promise((resolve) => {
          script.onload = resolve;
          document.head.appendChild(script);
        });
      };
      
      loadHLJS().then(() => {
        if (window.hljs) {
          window.hljs.highlightAll();
        } else if (window.hljsHighlightAll) {
          window.hljsHighlightAll();
        }
      });
    }
  }
  
  customElements.define('blog-code-highlight', CodeHighlight);
})();
