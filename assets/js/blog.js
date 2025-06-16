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

  // Process posts data
  const posts = covers.map(cover => {
    const slug = slugify(cover);
    return {
      slug,
      cover: `./covers/${cover}`,
      title: toTitle(slug.replace(/-/g, ' ')),
      date: new Date().toISOString().split('T')[0],
      excerpt: `Explore the latest insights on ${toTitle(slug.replace(/-/g, ' '))}.`,
      tags: ['Design', 'UI/UX', '2025']
    };
  });

  // Handle retry button click
  if (retryButton) {
    retryButton.addEventListener('click', initBlog);
  }

  // Simulate API call with loading state
  const loadPosts = () => {
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          resolve(posts);
        }, 800); // Simulate network delay
      } catch (error) {
        reject(error);
      }
    });
  };

  // Initialize the blog
  const initBlog = async () => {
    showLoading();
    
    try {
      const posts = await loadPosts();
      
      if (!posts || posts.length === 0) {
        showError('No blog posts found.');
        return;
      }
      
      // Clear the grid
      grid.innerHTML = '';
      
      // Add featured post
      const featuredPost = posts[0];
      const featuredCard = createBlogCard(featuredPost, true);
      grid.appendChild(featuredCard);
      
      // Add other posts in a grid
      const postsGrid = document.createElement('div');
      postsGrid.className = 'blog-grid-inner';
      
      // Show loading more indicator
      const loadingMore = document.createElement('div');
      loadingMore.className = 'loading-spinner';
      loadingMore.innerHTML = `
        <div class="spinner"></div>
        <p>Loading more posts...</p>
      `;
      
      // Append loading indicator first
      grid.appendChild(postsGrid);
      grid.appendChild(loadingMore);
      
      // Simulate loading more posts with a delay
      setTimeout(() => {
        loadingMore.remove();
        
        // Add posts to the grid
        posts.slice(1).forEach(post => {
          const card = createBlogCard(post);
          postsGrid.appendChild(card);
        });
        
        // Show the blog grid
        showBlog();
        
        // Add animation to cards
        const cards = document.querySelectorAll('.blog-card');
        cards.forEach((card, index) => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
          
          // Trigger reflow
          void card.offsetWidth;
          
          // Animate in
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
        
      }, 1000);
      
    } catch (error) {
      console.error('Error loading blog posts:', error);
      showError('Failed to load blog posts. Please try again later.');
    }
  };
  
  // Start loading posts
  initBlog();
});
