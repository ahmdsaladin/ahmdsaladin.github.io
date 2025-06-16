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

      // Determine title
      const title = meta.title || slug.replace(/-/g, ' ');
      document.getElementById('post-title').textContent = title;

            // Hero background image
      let heroImg = params.get('img');
      if (!heroImg) {
        heroImg = meta.image ? meta.image : `./covers/${slug.replace(/-/g, ' ')} Thumbnail.jpg`;
      }
      const distEl = document.getElementById('hero-distortion');
      if (distEl && window.GridDistortionInit && THREE) {
        GridDistortionInit(distEl, { imageSrc: heroImg, grid: 15, mouse: 0.1, strength: 0.15, relaxation: 0.9 });
      }
    })
    .catch(() => {
      document.getElementById('post-content').innerHTML = '<p>Error loading post.</p>';
    });
})();
