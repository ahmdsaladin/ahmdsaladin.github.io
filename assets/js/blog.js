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

  // Get DOM elements
  const grid = document.getElementById('blog-grid');
  const loadingSpinner = document.getElementById('loading-spinner');
  const errorMessage = document.getElementById('error-message');
  const retryButton = document.getElementById('retry-button');
  
  if (!grid) return;

  // Show loading state
  function showLoading() {
    loadingSpinner.style.display = 'flex';
    errorMessage.style.display = 'none';
    grid.style.display = 'none';
  }

  
  // Show error state
  function showError(message) {
    loadingSpinner.style.display = 'none';
    errorMessage.style.display = 'block';
    grid.style.display = 'none';
    
    const errorText = errorMessage.querySelector('p');
    if (errorText) {
      errorText.textContent = message || 'Failed to load blog posts. Please try again later.';
    }
  }
  
  // Show blog grid
  function showBlog() {
    loadingSpinner.style.display = 'none';
    errorMessage.style.display = 'none';
    grid.style.display = 'grid';
  }

  // Function to create a blog card
  function createBlogCard(post, isFeatured = false) {
    const card = document.createElement('article');
    card.className = `blog-card ${isFeatured ? 'featured' : ''}`;
    
    // Format date for the featured post
    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    card.innerHTML = `
      <div class="blog-card-img-container">
        <img 
          class="blog-card-img" 
          src="${post.cover}" 
          alt="${post.title}"
          loading="${isFeatured ? 'eager' : 'lazy'}"
          onerror="this.onerror=null; this.src='../assets/images/placeholder-blog.jpg'"
        >
        ${isFeatured ? '<span class="featured-badge">Featured</span>' : ''}
      </div>
      <div class="blog-card-content">
        <span class="blog-card-date">${formattedDate}</span>
        <h2 class="blog-card-title">
          <a href="post.html?slug=${post.slug}">${post.title}</a>
        </h2>
        <p class="blog-card-excerpt">${post.excerpt || 'Read more about this article...'}</p>
        <a class="blog-card-link" href="post.html?slug=${post.slug}">
          Read More
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    `;
    
    return card;
  }

  // Slugify function to convert titles to URL-friendly slugs
  function slugify(str) {
    return str
      .replace(/ Thumbnail\.jpg$/i, '') // Remove thumbnail suffix
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .trim()
      .replace(/\s+/g, '-'); // Replace spaces with hyphens
  }

  // Convert slug to title case
  function toTitle(slug) {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Process posts data (fallback in case index.json fails)
  const fallbackPosts = covers.map(cover => ({
    title: toTitle(cover.replace('.jpg', '')),
    excerpt: `This is a sample excerpt for ${toTitle(cover.replace('.jpg', ''))}. Click to read more.`,
    date: new Date().toISOString().split('T')[0],
    slug: slugify(cover.replace('.jpg', '')),
    cover: `../blog/covers/${cover}`,
    tags: ['sample', 'fallback']
  }));

  // Handle retry button click
  if (retryButton) {
    retryButton.addEventListener('click', initBlog);
  }

  // Fetch posts from the blog index
  const loadPosts = async () => {
    try {
      const response = await fetch('/blog/index.json');
      if (!response.ok) {
        throw new Error('Failed to load blog posts');
      }
      const data = await response.json();
      
      // Map the data to match the expected format
      return data.map(post => ({
        ...post,
        cover: post.cover || `../blog/covers/${post.slug.replace(/\//g, '-')}.jpg`,
        slug: post.slug || slugify(post.title)
      }));
    } catch (error) {
      console.error('Error loading posts:', error);
      throw new Error('Failed to load blog posts. Please try again later.');
    }
  };

  // Initialize the blog
  const initBlog = async () => {
    showLoading();
    
    try {
      let posts;
      try {
        // Try to load posts from index.json
        posts = await loadPosts();
      } catch (error) {
        console.warn('Using fallback posts:', error.message);
        posts = fallbackPosts;
      }
      
      // Clear existing content
      grid.innerHTML = '';
      
      if (!posts || posts.length === 0) {
        showError('No blog posts found.');
        return;
      }
      
      // Add posts to the grid with animation
      posts.forEach((post, index) => {
        const card = createBlogCard(post, index === 0);
        grid.appendChild(card);
        
        // Add animation to cards
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        
        // Trigger reflow
        void card.offsetWidth;
        
        // Animate in
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
      
      // Show the blog grid
      showBlog();
      
    } catch (error) {
      console.error('Error loading blog posts:', error);
      showError('Failed to load blog posts. Please try again later.');
    }
  };
  
  // Start loading posts
  initBlog();
});
