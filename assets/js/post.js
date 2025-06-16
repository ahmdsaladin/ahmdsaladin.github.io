// Client-side post loader. Expects ?slug=some-post on URL
(function () {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) {
    document.getElementById('post-content').innerHTML = '<p>Post not found.</p>';
    return;
  }

  const mdPath = `/blog/postss/${slug}.mdx`;
  fetch(mdPath)
    .then(res => {
      if (!res.ok) throw new Error('MD not found');
      return res.text();
    })
    .then(md => {
      // Parse front-matter for meta
      const fm = md.match(/^---[\s\S]*?---/);
      let meta = {};
      if (fm) {
        fm[0].replace(/^---|---$/g, '').split('\n').forEach(line => {
          const idx = line.indexOf(':');
          if (idx > -1) {
            const key = line.slice(0, idx).trim();
            const val = line.slice(idx + 1).trim().replace(/^"|"$/g, '');
            if (key) meta[key] = val;
          }
        });
        md = md.replace(fm[0], '').trim();
      }
      const html = marked.parse(md);
      document.getElementById('post-content').innerHTML = html;

      // Set post title
      const title = meta.title || slug.replace(/-/g, ' ');
      document.getElementById('post-title').textContent = title;

      // Set post date if available
      if (meta.date) {
        document.getElementById('post-date').textContent = new Date(meta.date).toLocaleDateString();
      }

      // Set post tag if available
      if (meta.tag) {
        const tagEl = document.getElementById('post-tag');
        tagEl.textContent = meta.tag;
        tagEl.style.marginLeft = '10px';
        tagEl.style.padding = '2px 8px';
        tagEl.style.borderRadius = '4px';
        tagEl.style.background = 'var(--radical-red)';
      }

      // Choose hero image: prefer meta.image if it is a relative path in the repo,
      // otherwise fall back to the cover image that matches the slug.
      const heroImg = document.getElementById('post-hero');
      let imgSrc = meta.image || '';
      if (imgSrc.startsWith('/')) {
        // Likely points to an assets path we don't have; switch to covers folder.
        imgSrc = `./covers/${slug.replace(/-/g, ' ')} Thumbnail.jpg`;
      }
      if (!imgSrc) {
        imgSrc = `./covers/${slug.replace(/-/g, ' ')} Thumbnail.jpg`;
      }
      heroImg.src = imgSrc;
      heroImg.alt = title;
    })
    .catch(() => {
      document.getElementById('post-content').innerHTML = '<p>Error loading post.</p>';
    });
})();
