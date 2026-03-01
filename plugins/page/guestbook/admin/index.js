(function() {
  if (customElements.get('blog-guestbook-admin')) return;
  class GuestbookAdmin extends HTMLElement {
    constructor() {
      super();
      this._messages = [];
    }
    connectedCallback() {
      this._render();
      this._load();
    }
    async _load() {
      try {
        const res = await fetch('/api/plugin-route/guestbook/data');
        this._messages = (await res.json()).reverse();
        this._renderList();
      } catch { this._renderList(); }
    }
    _render() {
      this.innerHTML = `
        <style>
          .gba-wrap { font-family: -apple-system, sans-serif; }
          .gba-stats { display: flex; gap: 16px; margin-bottom: 24px; }
          .gba-stat { background: var(--card, #fff); border: 1px solid var(--border, #e5e7eb); border-radius: 8px; padding: 16px 24px; }
          .gba-stat-num { font-size: 28px; font-weight: 700; color: var(--foreground, #111); }
          .gba-stat-label { font-size: 12px; color: var(--muted-foreground, #6b7280); margin-top: 2px; }
          .gba-table { width: 100%; border-collapse: collapse; background: var(--card, #fff); border-radius: 8px; overflow: hidden; border: 1px solid var(--border, #e5e7eb); }
          .gba-table th { background: var(--secondary, #f3f4f6); padding: 10px 16px; text-align: left; font-size: 12px; color: var(--muted-foreground, #6b7280); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
          .gba-table td { padding: 12px 16px; border-top: 1px solid var(--border, #e5e7eb); font-size: 14px; color: var(--foreground, #111); vertical-align: top; }
          .gba-del { background: none; border: 1px solid #fca5a5; color: #ef4444; border-radius: 4px; padding: 4px 10px; font-size: 12px; cursor: pointer; transition: all 0.15s; }
          .gba-del:hover { background: #fef2f2; }
          .gba-empty { text-align: center; padding: 40px; color: var(--muted-foreground, #6b7280); }
          .gba-msg { max-width: 300px; white-space: pre-wrap; word-break: break-word; }
          .gba-name-link { color: var(--primary, #3b82f6); text-decoration: none; }
          .gba-name-link:hover { text-decoration: underline; }
        </style>
        <div class="gba-wrap">
          <div class="gba-stats" id="gba-stats"><div class="gba-stat"><div class="gba-stat-num">...</div><div class="gba-stat-label">总留言数</div></div></div>
          <div id="gba-list"></div>
        </div>`;
    }
    _renderList() {
      const statsEl = this.querySelector('#gba-stats');
      const listEl = this.querySelector('#gba-list');
      if (!listEl) return;

      if (statsEl) statsEl.innerHTML = `<div class="gba-stat"><div class="gba-stat-num">${this._messages.length}</div><div class="gba-stat-label">总留言数</div></div>`;

      if (this._messages.length === 0) {
        listEl.innerHTML = '<div class="gba-empty">暂无留言</div>';
        return;
      }
      const rows = this._messages.map((m, i) => {
        const time = m._createdAt ? new Date(m._createdAt).toLocaleString('zh-CN') : '-';
        const nameHtml = m.site ? `<a href="${m.site}" target="_blank" rel="noopener" class="gba-name-link">${m.name}</a>` : m.name;
        // 真实索引（reversed显示，但删除用原始索引）
        const realIdx = this._messages.length - 1 - i;
        return `<tr>
          <td>${nameHtml}</td>
          <td><div class="gba-msg">${(m.message||'').replace(/</g,'&lt;')}</div></td>
          <td style="color:var(--muted-foreground,#6b7280)">${time}</td>
          <td><button class="gba-del" data-idx="${realIdx}">删除</button></td>
        </tr>`;
      }).join('');
      listEl.innerHTML = `<table class="gba-table">
        <thead><tr><th>昵称</th><th>留言</th><th>时间</th><th>操作</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;

      listEl.querySelectorAll('.gba-del').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('确认删除该留言？')) return;
          const idx = btn.dataset.idx;
          try {
            const res = await fetch(`/api/plugin-route/guestbook/data/${idx}`, { method: 'DELETE' });
            const d = await res.json();
            if (d.success) { await this._load(); }
            else alert('删除失败: ' + (d.error || '未知错误'));
          } catch { alert('网络错误'); }
        });
      });
    }
  }
  customElements.define('blog-guestbook-admin', GuestbookAdmin);
})();
