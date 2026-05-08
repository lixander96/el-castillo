import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchProfile, setAuthToken } from '../lib/api';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const nav = useNavigate();

  useEffect(() => {
    const token = params.get('token');

    const run = async () => {
      if (!token) {
        nav('/login', { replace: true });
        return;
      }

      setAuthToken(token);
      try {
        const user = await fetchProfile();
        localStorage.setItem('user', JSON.stringify(user));
        nav('/', { replace: true });
      } catch (error) {
        console.error('Failed to complete Google login', error);
        setAuthToken(undefined);
        nav('/login', { replace: true });
      }
    };

    run();
  }, [params, nav]);

  return null;
}
