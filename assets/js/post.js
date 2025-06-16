// Client-side post loader. Expects ?slug=some-post on URL
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const loadingSpinner = document.getElementById('loading-spinner');
  const errorMessage = document.getElementById('error-message');
  const blogPost = document.getElementById('blog-post');
  const retryButton = document.getElementById('retry-button');
  const postHero = document.getElementById('post-hero');
  const postTitle = document.getElementById('post-title');
  const postSubtitle = document.getElementById('post-subtitle');
  const postDate = document.getElementById('post-date');
  const postReadingTime = document.getElementById('post-reading-time');
  const postTag = document.getElementById('post-tag');
  const postContent = document.getElementById('post-content');
  const tagsList = document.getElementById('tags-list');
  
  // Show loading state
  const showLoading = () => {
    loadingSpinner.style.display = 'flex';
    errorMessage.style.display = 'none';
    blogPost.style.display = 'none';
  };
  
  // Show error state
  const showError = (message) => {
    loadingSpinner.style.display = 'none';
    errorMessage.style.display = 'block';
    errorMessage.querySelector('p').textContent = message;
    blogPost.style.display = 'none';
  };
  
  // Show blog post content
  const showBlog = () => {
    loadingSpinner.style.display = 'none';
    errorMessage.style.display = 'none';
    blogPost.style.display = 'block';
    
    // Trigger animation
    requestAnimationFrame(() => {
      blogPost.style.opacity = '0';
      blogPost.style.transform = 'translateY(20px)';
      blogPost.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      
      // Trigger reflow
      void blogPost.offsetWidth;
      
      // Animate in
      blogPost.style.opacity = '1';
      blogPost.style.transform = 'translateY(0)';
    });
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Calculate reading time
  const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };
  
  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  
  if (!slug) {
    showError('Post not found. Missing post slug.');
    return;
  }
  
  // Get the post data from the blog index
  const getPostData = async () => {
    const indexUrl = '/blog/index.json';
    console.log('Loading blog index from:', indexUrl);
    
    try {
      const response = await fetch(indexUrl);
      if (!response.ok) {
        console.error('Failed to load blog index. Status:', response.status);
        throw new Error(`Failed to load blog index: ${response.statusText}`);
      }
      
      const posts = await response.json();
      console.log('Successfully loaded blog index with', posts.length, 'posts');
      
      const post = posts.find(p => p.slug === slug);
      if (!post) {
        console.error('Post not found in index. Slug:', slug);
        console.log('Available slugs:', posts.map(p => p.slug));
        throw new Error(`Post with slug "${slug}" not found`);
      }
      
      console.log('Found post data:', post);
      return post;
      
    } catch (error) {
      console.error('Error in getPostData:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      throw new Error(`Failed to load post data: ${error.message}`);
    }
  };
  
  // Load the post content
  const loadPostContent = async (postData) => {
    const postPath = `/blog/posts/${slug}.md`;
    console.log('Loading post from:', postPath);
    
    try {
      const response = await fetch(postPath);
      if (!response.ok) {
        console.error('Failed to fetch post. Status:', response.status);
        throw new Error(`Post content not found at ${postPath}`);
      }
      const content = await response.text();
      console.log('Successfully loaded post content');
      return content;
    } catch (error) {
      console.error('Error loading post content:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      throw new Error(`Failed to load post content: ${error.message}`);
    }
  };
  
  // Parse front matter from markdown
  const parseFrontMatter = (markdown) => {
    const frontMatter = {};
    const frontMatterMatch = markdown.match(/^---\s*([\s\S]*?)\s*---/);
    
    if (frontMatterMatch) {
      const frontMatterText = frontMatterMatch[1];
      frontMatterText.split('\n').forEach(line => {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex !== -1) {
          const key = line.slice(0, separatorIndex).trim();
          const value = line.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '');
          frontMatter[key] = value;
        }
      });
      
      return {
        frontMatter,
        content: markdown.slice(frontMatterMatch[0].length).trim()
      };
    }
    
    return { frontMatter: {}, content: markdown };
  };
  
  // Initialize the post
  const initPost = async () => {
    showLoading();
    
    try {
      // Get post data from index
      const postData = await getPostData();
      if (!postData) {
        throw new Error('Post not found');
      }
      
      // Load post content
      const markdown = await loadPostContent(postData);
      const { frontMatter, content } = parseFrontMatter(markdown);
      
      // Update post metadata
      document.title = `${frontMatter.title || postData.title} | Ahmd Saladin's Blog`;
      
      // Set post content
      postTitle.textContent = frontMatter.title || postData.title;
      postSubtitle.textContent = frontMatter.description || postData.excerpt || '';
      
      // Set post date
      if (frontMatter.date || postData.date) {
        const date = frontMatter.date || postData.date;
        postDate.querySelector('.date').textContent = formatDate(date);
      } else {
        postDate.style.display = 'none';
      }
      
      // Set reading time
      const readingTime = calculateReadingTime(content);
      postReadingTime.querySelector('.time').textContent = `${readingTime} min read`;
      
      // Set post tags
      if (frontMatter.tags || postData.tags) {
        const tags = frontMatter.tags ? 
          frontMatter.tags.split(',').map(tag => tag.trim()) : 
          postData.tags || [];
          
        tagsList.innerHTML = tags.map(tag => 
          `<a href="/blog?tag=${tag.toLowerCase()}" class="tag">${tag}</a>`
        ).join('');
      } else {
        document.querySelector('.post-tags').style.display = 'none';
      }
      
      // Set post category/tag
      if (frontMatter.category) {
        postTag.querySelector('.tag').textContent = frontMatter.category;
      } else if (postData.tags && postData.tags.length > 0) {
        postTag.querySelector('.tag').textContent = postData.tags[0];
      } else {
        postTag.style.display = 'none';
      }
      
      // Set hero image if available
      if (frontMatter.image || postData.cover) {
        const imageUrl = frontMatter.image || 
          (postData.cover.startsWith('http') ? postData.cover : `../${postData.cover}`);
        postHero.src = imageUrl;
        postHero.alt = frontMatter.title || postData.title;
      } else {
        postHero.parentElement.style.display = 'none';
      }
      
      // Render markdown content
      const html = marked.parse(content);
      postContent.innerHTML = enhanceMarkdownContent(html);
      
      // Add copy buttons to code blocks
      addCopyButtonsToCodeBlocks();
      
      // Set up anchor links for headings
      setupAnchorLinks();
      
      // Show the blog post
      showBlog();
      
    } catch (error) {
      console.error('Error loading post:', error);
      showError(error.message || 'Failed to load the blog post. Please try again later.');
    }
  };
  
  // Set up retry button
  if (retryButton) {
    retryButton.addEventListener('click', initPost);
  }
  
  // Initialize the post
  initPost();

  // Helper function to enhance markdown content
  function enhanceMarkdownContent(html) {
    // Wrap tables for responsive scrolling
    html = html.replace(/<table([^>]*)>/g, 
      '<div class="table-container"><table$1>');
    html = html.replace(/<\/table>/g, '</table></div>');
    
    // Add figure and figcaption to images with alt text
    html = html.replace(
      /<img([^>]*)alt="([^"]*)"([^>]*)>/g, 
      (match, p1, p2, p3) => 
        `<figure class="post-image">
          <img${p1}${p3} alt="${p2}" loading="lazy">
          <figcaption>${p2}</figcaption>
        </figure>`
    );
    
    // Add target="_blank" to external links
    html = html.replace(
      /<a([^>]*href=["'](http|https|ftp):\/\/[^"']+["'][^>]*)>/g,
      '<a$1 target="_blank" rel="noopener noreferrer">'
    );
    
    // Add syntax highlighting to code blocks
    html = html.replace(
      /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
      '<pre class="language-$1"><code class="language-$1">$2</code></pre>'
    );
    
    return html;
  }

  // Helper function to set up anchor links
  function setupAnchorLinks() {
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
      if (!heading.id) {
        heading.id = heading.textContent
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
      }
      
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.className = 'anchor-link';
      link.innerHTML = '#';
      link.setAttribute('aria-label', 'Permalink to this section');
      
      if (!heading.querySelector('.anchor-link')) {
        heading.classList.add('heading-with-anchor');
        heading.insertBefore(link, heading.firstChild);
      }
    });
  }

  // Helper function to add copy buttons to code blocks
  function addCopyButtonsToCodeBlocks() {
    document.querySelectorAll('pre > code').forEach(codeBlock => {
      const pre = codeBlock.parentNode;
      if (pre.previousElementSibling?.classList?.contains('code-block-header')) {
        return; // Skip if already has a header
      }
      
      const header = document.createElement('div');
      header.className = 'code-block-header';
      
      const language = [...codeBlock.classList]
        .find(cls => cls.startsWith('language-'))
        ?.replace('language-', '') || 'code';
      
      const langLabel = document.createElement('span');
      langLabel.className = 'code-language';
      langLabel.textContent = language;
      
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.innerHTML = 'Copy';
      copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(codeBlock.textContent).then(() => {
          copyButton.textContent = 'Copied!';
          setTimeout(() => {
            copyButton.textContent = 'Copy';
          }, 2000);
        });
      });
      
      header.appendChild(langLabel);
      header.appendChild(copyButton);
      pre.parentNode.insertBefore(header, pre);
    });
  }

  // Helper function to show error messages
  function showError(message) {
    console.error('Error:', message);
    
    // If we have an error message element, update it
    if (errorMessage) {
      const errorText = errorMessage.querySelector('p');
      if (errorText) {
        errorText.textContent = message;
      }
      loadingSpinner.style.display = 'none';
      errorMessage.style.display = 'block';
      blogPost.style.display = 'none';
    } else {
      // Fallback in case the error message element doesn't exist
      const errorEl = document.createElement('div');
      errorEl.className = 'error-message';
      errorEl.innerHTML = `
        <p>${message}</p>
        <button class="btn" id="retry-button">Try Again</button>
      `;
      document.body.appendChild(errorEl);
      
      // Add event listener to retry button
      const retryBtn = errorEl.querySelector('#retry-button');
      if (retryBtn) {
        retryBtn.addEventListener('click', initPost);
      }
    }
  }
})();
