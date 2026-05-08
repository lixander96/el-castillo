import { useState, useEffect } from 'react';
import {
  mockSpaces,
  mockReservations,
  type Event,
  type Space,
  type Reservation,
} from '../data/mockData';
import { api } from '../lib/api';

export interface LoadingState {
  loading: boolean;
  error: string | null;
  data: any;
}

export function useData<T>(endpoint: string): LoadingState & { data: T | null } {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        setLoading(true);
        setError(null);
        
        let mockData: any = null;
        
        switch (endpoint) {
          case 'spaces':
            mockData = mockSpaces;
            break;
          case 'reservations':
            mockData = mockReservations;
            break;
          default:
            throw new Error(`Endpoint no soportado: ${endpoint}`);
        }
        
        // Simulate async loading
        setTimeout(() => {
          setData(mockData as T);
          setLoading(false);
        }, 300);
        
      } catch (err) {
        console.error(`Error loading ${endpoint}:`, err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setLoading(false);
      }
    };

    loadData();
  }, [endpoint]);

  return { loading, error, data };
}

export function useEvents() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Event[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<Event[]>('/events');
        if (!cancelled) {
          setData(data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err?.message || 'No se pudieron cargar los eventos');
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { loading, error, data };
}

export function useSpaces() {
  return useData<Space[]>('spaces');
}

export function useReservations() {
  return useData<Reservation[]>('reservations');
}

// Utility functions for filtering and sorting
export function filterEvents(events: any[], filters: {
  category?: string;
  status?: string;
  priceRange?: [number, number];
  dateRange?: [Date, Date];
}) {
  if (!events) return [];
  
  return events.filter(event => {
    if (filters.category && filters.category !== 'all' && 
        event.category.toLowerCase() !== filters.category.toLowerCase()) {
      return false;
    }
    
    if (filters.status && event.status !== filters.status) {
      return false;
    }
    
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      if (event.price < min || event.price > max) {
        return false;
      }
    }
    
    if (filters.dateRange) {
      const eventDate = new Date(event.date);
      const [startDate, endDate] = filters.dateRange;
      if (eventDate < startDate || eventDate > endDate) {
        return false;
      }
    }
    
    return true;
  });
}

export function sortEvents(events: any[], sortBy: 'date' | 'popularity' | 'price') {
  if (!events) return [];
  
  return [...events].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'popularity':
        return b.ticketsSold - a.ticketsSold;
      case 'price':
        return a.price - b.price;
      default:
        return 0;
    }
  });
}
