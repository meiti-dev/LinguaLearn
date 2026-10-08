/* global React, useState, useEffect, useRef, useMemo, useCallback, datos, tema, UI, MEITI, LIBRERIAS_PREMIUM, Iconos, Animacion, Graficos, render */
// Molde de MEITI: este archivo es el código que corre la app (server/server.js lo carga al arrancar; si lo cambias, reinicia el backend).
({ datos, tema, UI, MEITI }) => {
  const eco = MEITI.obtenerEcosistemaActual();
  const miId = MEITI.obtenerUsuarioActual();
  const [unidades, setUnidades] = useState([]);
  const [lecciones, setLecciones] = useState([]);
  const [progreso, setProgreso] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const [resUni, resLec, resProg] = await Promise.all([
        MEITI.fetchDatos(`/api/boveda/${MEITI.obtenerTabla('ll_unidades')}?ecosistema=${eco}`),
        MEITI.fetchDatos(`/api/boveda/${MEITI.obtenerTabla('ll_lecciones')}?ecosistema=${eco}`),
        MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('ll_progreso')}?ecosistema=${eco}`)
      ]);
      if (resUni.ok) setUnidades(resUni.registros.sort((a, b) => a.orden - b.orden));
      if (resLec.ok) setLecciones(resLec.registros.sort((a, b) => a.orden - b.orden));
      if (resProg.ok) setProgreso(resProg.registros);
      setCargando(false);
    };
    cargar();
  }, []);

  const iniciarLeccion = async (leccion) => {
    const payload = { id: 'sesion_' + miId, usuario_id: miId, leccion_id: leccion.id };
    await MEITI.mutar(`/api/boveda/${MEITI.obtenerTabla('ll_sesion_activa')}?ecosistema=${eco}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, {
      alLograr: () => MEITI.irAPagina('leccion'),
      alFallar: setError
    });
  };

  const esCompletada = (id) => progreso.some(p => p.leccion_id === id && p.completada === 1);

  if (cargando) return <div className="p-8 text-center"><Iconos.LoaderCircle className="animate-spin mx-auto" size={32} color={tema.colorPrimario} /></div>;

  return (
    <div className="flex flex-col gap-8 pb-32 px-2">
      <UI.Aviso mensaje={error} tono="peligro" onCerrar={() => setError(null)} />
      
      {unidades.length === 0 ? (
        <UI.EstadoVacio icono="fa-map" mensaje={MEITI.t('ll_no_units', null, 'Aún no hay unidades disponibles.')} />
      ) : (
        unidades.map((u, i) => {
          const lecs = lecciones.filter(l => l.unidad_id === u.id);
          return (
            <div key={u.id} className="flex flex-col gap-6">
              <div className="p-6 rounded-3xl shadow-sm" style={{ background: tema.colorPrimario, color: '#fff' }}>
                <h2 className="text-2xl font-black">{MEITI.t('ll_unit', null, 'Unidad')} {i + 1}</h2>
                <p className="font-bold opacity-90">{u.titulo}</p>
                <p className="text-sm opacity-75 mt-1">{u.descripcion}</p>
              </div>
              
              <div className="flex flex-col items-center gap-6 py-4">
                {lecs.map((l, j) => {
                  const completada = esCompletada(l.id);
                  const idxPrimeraNoCompletada = lecs.findIndex(lx => !esCompletada(lx.id));
                  const esActual = j === idxPrimeraNoCompletada || (idxPrimeraNoCompletada === -1 && j === lecs.length - 1);
                  const bloqueada = !completada && !esActual && j > idxPrimeraNoCompletada;

                  let bg = tema.superficie;
                  let colorIcono = tema.texto;
                  let Icono = Iconos.Lock;
                  let borde = `4px solid ${tema.texto}22`;

                  if (completada) {
                    bg = tema.colorSecundario;
                    colorIcono = '#fff';
                    Icono = Iconos.Check;
                    borde = `4px solid ${tema.colorSecundario}`;
                  } else if (esActual) {
                    bg = tema.colorPrimario;
                    colorIcono = '#fff';
                    Icono = Iconos.Star;
                    borde = `4px solid ${tema.colorPrimario}66`;
                  }

                  const offset = j % 2 === 0 ? '-20px' : '20px';

                  return (
                    <Animacion.motion.button
                      key={l.id}
                      whileTap={!bloqueada ? { scale: 0.9 } : {}}
                      onClick={() => !bloqueada && iniciarLeccion(l)}
                      disabled={bloqueada}
                      className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all"
                      style={{ background: bg, border: borde, transform: `translateX(${offset})`, opacity: bloqueada ? 0.5 : 1 }}
                    >
                      <Icono size={32} color={colorIcono} />
                      {esActual && (
                        <div className="absolute -top-10 bg-white text-black text-xs font-bold px-3 py-1 rounded-xl shadow-md whitespace-nowrap">
                          {MEITI.t('ll_start', null, '¡Empezar!')}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                        </div>
                      )}
                    </Animacion.motion.button>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}