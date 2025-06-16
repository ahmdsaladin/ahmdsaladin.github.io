// Client-side post loader. Expects ?slug=some-post on URL
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const blogPost = document.getElementById('blog-post');
  const postHero = document.getElementById('post-hero');
  const postTitle = document.getElementById('post-title');
  const postSubtitle = document.getElementById('post-subtitle');
  const postDate = document.getElementById('post-date');
  const postReadingTime = document.getElementById('post-reading-time');
  const postTag = document.getElementById('post-tag');
  const postContent = document.getElementById('post-content');
  const tagsList = document.getElementById('tags-list');
  
  // Simple error handler
  const showError = (message) => {
    if (blogPost) {
      blogPost.innerHTML = `<div class="error-message">${message}</div>`;
    }
    console.error(message);
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
    // Try different possible paths for the markdown file
    const possiblePaths = [
      `/blog/posts/${slug}.md`,  // Direct path
      `./posts/${slug}.md`,      // Relative path
      `../posts/${slug}.md`,     // One level up
      `${slug}.md`               // Current directory
    ];
    
    let lastError;
    
    for (const path of possiblePaths) {
      try {
        console.log('Trying to load post from:', path);
        const response = await fetch(path);
        if (!response.ok) {
          console.log(`Failed to load from ${path}:`, response.status);
          continue;
        }
        const content = await response.text();
        console.log('Successfully loaded post content from:', path);
        return content;
      } catch (error) {
        console.warn(`Error loading from ${path}:`, error.message);
        lastError = error;
      }
    }
    
    throw new Error(`Could not load post content from any path. Last error: ${lastError?.message}`);
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
    try {
      // Get post data from index
      const postData = await getPostData();
      if (!postData) {
        throw new Error('Post not found');
      }
      
      // Update post metadata
      document.title = `${postData.title} | Ahmd Saladin's Blog`;
      if (postTitle) postTitle.textContent = postData.title;
      if (postSubtitle) postSubtitle.textContent = postData.excerpt || '';
      
      // Set post date
      if (postDate && postData.date) {
        const dateElement = postDate.querySelector('.date');
        if (dateElement) {
          dateElement.textContent = formatDate(postData.date);
        }
      }
      
      // Set post tags
      if (tagsList && postData.tags && postData.tags.length > 0) {
        tagsList.innerHTML = postData.tags.map(tag => 
          `<a href="/blog?tag=${tag.toLowerCase()}" class="tag">${tag}</a>`
        ).join('');
      }
      
      // Set hero image if available
      if (postHero && postData.cover) {
        postHero.src = postData.cover.startsWith('http') ? 
          postData.cover : 
          `../${postData.cover}`;
        postHero.alt = postData.title;
      }
      
      // Load markdown content
      if (postContent) {
        try {
          const markdown = await loadPostContent(postData);
          const { content } = parseFrontMatter(markdown);
          
          // Set reading time
          if (postReadingTime) {
            const timeElement = postReadingTime.querySelector('.time');
            if (timeElement) {
              const readingTime = calculateReadingTime(content);
              timeElement.textContent = `${readingTime} min read`;
            }
          }
          
          // Render markdown content
          postContent.innerHTML = marked.parse(content);
          
          // Add copy buttons to code blocks
          addCopyButtonsToCodeBlocks();
          
          // Set up anchor links for headings
          setupAnchorLinks();
        } catch (error) {
          postContent.innerHTML = '<p>This post could not be loaded. Please try again later.</p>';
        }
      }
      
    } catch (error) {
      showError('Failed to load the blog post. Please try again later.');
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
