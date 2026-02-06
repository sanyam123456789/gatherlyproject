import api from './axios';

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  creator: {
    _id: string;
    username: string;
    email: string;
  };
  attendees: Array<{
    _id: string;
    username: string;
  }>;
  maxAttendees: number;
  category?: 'concert' | 'travel' | 'trekking';
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  location: string;
  maxAttendees?: number;
  category?: 'concert' | 'travel' | 'trekking';
}

export const eventsApi = {
  getAllEvents: async (): Promise<Event[]> => {
    const response = await api.get('/events');
    return response.data;
  },

  getEventById: async (id: string): Promise<Event> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (data: CreateEventData): Promise<Event> => {
    const response = await api.post('/events', data);
    return response.data;
  },

  joinEvent: async (id: string): Promise<{ message: string; event: Event }> => {
    const response = await api.post(`/events/${id}/join`);
    return response.data;
  },

  leaveEvent: async (id: string): Promise<{ message: string; event: Event }> => {
    const response = await api.post(`/events/${id}/leave`);
    return response.data;
  },

  deleteEvent: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  }
};

export default eventsApi;
