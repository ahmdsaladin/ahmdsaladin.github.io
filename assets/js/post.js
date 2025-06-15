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
      // Front-matter strip (--- YAML ---) quick & dirty
      md = md.replace(/^---[\s\S]*?---/, '').trim();
      const html = marked.parse(md);
      document.getElementById('post-content').innerHTML = html;
      // Title & hero image from first # or ![]()
      const firstH = document.querySelector('#post-content h1, #post-content h2');
      const title = firstH ? firstH.textContent : slug.replace(/-/g, ' ');
      const header = document.getElementById('post-header');
      header.innerHTML = `<h1>${title}</h1>`;
    })
    .catch(() => {
      document.getElementById('post-content').innerHTML = '<p>Error loading post.</p>';
    });
})();
