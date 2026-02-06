const { Blog, User } = require('../models');

// @desc    Create new blog post
// @route   POST /api/blogs
// @access  Private
const createBlog = async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const blog = await Blog.create({
      title,
      content,
      tags: tags || [],
      author: req.userId
    });

    await blog.populate('author', 'username email');

    res.status(201).json({
      message: 'Blog post created successfully',
      blog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all blog posts
// @route   GET /api/blogs
// @access  Public
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'username email')
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    console.error('Get all blogs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single blog post
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username email');

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json(blog);
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update blog post
// @route   PUT /api/blogs/:id
// @access  Private
const updateBlog = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Check if user is the author
    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.tags = tags || blog.tags;

    await blog.save();
    await blog.populate('author', 'username email');

    res.json({
      message: 'Blog post updated successfully',
      blog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete blog post
// @route   DELETE /api/blogs/:id
// @access  Private
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Check if user is the author
    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog
};
