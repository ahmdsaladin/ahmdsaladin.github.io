document.addEventListener('DOMContentLoaded', () => {
  const covers = [
    'Ethical Design User Privacy 2025 Thumbnail.jpg',
    '3D Elements UI Trends 2025 Thumbnail.jpg',
    'AI-Driven Design Systems 2025 Thumbnail.jpg',
    'AR UX Immersive User Journeys Thumbnail.jpg',
    'Canvas to Code Thumbnail.jpg',
    'Chaos in Design Thumbnail.jpg',
    'Cross-Platform UX Design Thumbnail.jpg',
    'Dark Mode UI Design Tips 2025 Thumbnail.jpg',
    'Designing as Remembering Thumbnail.jpg',
    'Designing for Ghosts Thumbnail.jpg',
    'Figma AI Collab Design Thumbnail.jpg',
    'Figma Multiplayer Features 2025 Thumbnail.jpg',
    'Figma Plugins Productivity 2025 Thumbnail.jpg',
    'Figma vs Adobe XD Rapid Prototyping 2025 Thumbnail.jpg',
    'From Static to Cinematic Thumbnail.jpg',
    'Future-Proofing Voice UX 2025 Thumbnail.jpg',
    'Gamification UX 2025 Thumbnail.jpg',
    'Gen Z UI UX Design 2025 Thumbnail.jpg',
    'Hidden Geometry of Design Thumbnail.jpg',
    'Inclusive UX Accessibility 2025 Thumbnail.jpg',
    'Logos as Modern Sigils Thumbnail.jpg',
    'Micro-Interactions UI Thumbnail.jpg',
    'Minimalism UI Balance 2025 Thumbnail.jpg',
    'Motion Design Lottie Animations 2025 Thumbnail.jpg',
    'No-Code Figma Design 2025 Thumbnail.jpg',
    'Sustainable UI Design 2025 Thumbnail.jpg',
    'Through the Glass, Dimly Thumbnail.jpg',
    'Typography Trends UI 2025 Thumbnail.jpg',
    'UI as Performance Thumbnail.jpg',
    'Vernacular Design Thumbnail.jpg'
  ];

  function slugify(str) {
    return str.toLowerCase()
      .replace(/ thumbnail\.jpg$/, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function toTitle(slug) {
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  const posts = covers.map(c => {
    const slug = slugify(c);
    return {
      slug,
      cover: './covers/' + c,
      title: toTitle(slug)
    };
  });

  const grid = document.getElementById('blog-grid');
  if (!grid) return;

  posts.forEach((p, idx) => {
    const card = document.createElement('div');
    card.className = 'blog-card' + (idx === 0 ? ' featured' : '');
    card.innerHTML = `
      <img class="blog-card-img" src="${p.cover}" alt="${p.title}">
      <div class="blog-card-content">
        <a class="blog-card-title" href="post.html?slug=${p.slug}">${p.title}</a>
        <a class="blog-card-link" href="post.html?slug=${p.slug}">Read More</a>
      </div>`;
    grid.appendChild(card);
  });
});
