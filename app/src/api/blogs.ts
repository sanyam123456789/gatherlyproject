import api from './axios';

export interface Blog {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
    email: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogData {
  title: string;
  content: string;
  tags?: string[];
}

export const blogsApi = {
  getAllBlogs: async (): Promise<Blog[]> => {
    const response = await api.get('/blogs');
    return response.data;
  },

  getBlogById: async (id: string): Promise<Blog> => {
    const response = await api.get(`/blogs/${id}`);
    return response.data;
  },

  createBlog: async (data: CreateBlogData): Promise<Blog> => {
    const response = await api.post('/blogs', data);
    return response.data;
  },

  updateBlog: async (id: string, data: CreateBlogData): Promise<Blog> => {
    const response = await api.put(`/blogs/${id}`, data);
    return response.data;
  },

  deleteBlog: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  }
};

export default blogsApi;
