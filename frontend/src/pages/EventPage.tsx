import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchEventBySlug, EventResponse } from '../lib/api';
import EventModal from '../components/EventModal';
import { Calendar } from 'lucide-react';
import { LoginModal } from '../components/LoginModal';

const EventPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchEventBySlug(slug);
        if (!cancelled) setEvent(data);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Evento no encontrado');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (event) {
      document.title = `${event.title} · El Castillo Barracas`;
    }
  }, [event]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-medium mb-2">Evento no encontrado</h2>
        <p className="text-muted-foreground mb-4">{error || 'El evento que buscás ya no está disponible.'}</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-primary hover:underline"
        >
          Volver a la agenda
        </button>
      </div>
    );
  }

  return (
    <>
      <EventModal
        event={event as any}
        setShowLoginModal={setShowLoginModal}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) navigate('/');
        }}
      />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
};

export default EventPage;
