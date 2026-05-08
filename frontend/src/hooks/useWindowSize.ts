import { useState, useEffect } from 'react';

interface WindowSize {
    width: number,
    height: number,
}

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // Solo se ejecuta en el lado del cliente
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Configura el listener para eventos de redimensionamiento
    window.addEventListener('resize', handleResize);

    // Ejecuta la función de redimensionamiento para establecer el tamaño inicial
    handleResize();

    // Limpia el listener cuando el componente se desmonta
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

export default useWindowSize;