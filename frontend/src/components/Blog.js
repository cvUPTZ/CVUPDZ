// components/Blog.js
import React from 'react';

function Blog() {
  const posts = [
    { id: 1, title: "10 Tips for a Winning CV", excerpt: "Learn how to make your CV stand out...", image: "blog1.jpg" },
    { id: 2, title: "Mastering the Job Interview", excerpt: "Prepare for success with these interview tips...", image: "blog2.jpg" },
    { id: 3, title: "Navigating the Global Job Market", excerpt: "Explore opportunities beyond borders...", image: "blog3.jpg" }
  ];

  const sectionStyle = {
    padding: '5rem 0',
    backgroundColor: '#f9fafb',
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
  };

  const titleStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2d3748',
    marginBottom: '2rem',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '2rem',
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  };

  const imageStyle = {
    width: '100%',
    height: '12rem',
    objectFit: 'cover',
  };

  const contentStyle = {
    padding: '1.5rem',
  };

  const postTitleStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  };

  const excerptStyle = {
    color: '#718096',
    marginBottom: '1rem',
  };

  const linkStyle = {
    color: '#3182ce',
    textDecoration: 'none',
    transition: 'color 0.2s',
  };

  const hoverLinkStyle = {
    ...linkStyle,
    color: '#2b6cb0',
  };

  return (
    <section id="blog" style={sectionStyle}>
      <div style={containerStyle}>
        <h2 style={titleStyle}>Latest Career Advice</h2>
        <div style={gridStyle}>
          {posts.map(post => (
            <div key={post.id} style={cardStyle}>
              <img src={post.image} alt={post.title} style={imageStyle} />
              <div style={contentStyle}>
                <h3 style={postTitleStyle}>{post.title}</h3>
                <p style={excerptStyle}>{post.excerpt}</p>
                <a href="#" style={linkStyle} onMouseOver={(e) => e.currentTarget.style.color = hoverLinkStyle.color} onMouseOut={(e) => e.currentTarget.style.color = linkStyle.color}>Read More</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Blog;
