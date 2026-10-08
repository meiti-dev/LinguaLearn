/* global React, useState, useEffect, useRef, useMemo, useCallback, datos, tema, UI, MEITI, LIBRERIAS_PREMIUM, Iconos, Animacion, Graficos, render */
// Molde de MEITI: este archivo es el código que corre la app (server/server.js lo carga al arrancar; si lo cambias, reinicia el backend).
({ datos, tema, UI, MEITI }) => {
  const eco = MEITI.obtenerEcosistemaActual();
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const [resPerf, resProg, resLec] = await Promise.all([
        MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('ll_perfiles')}?ecosistema=${eco}`),
        MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('ll_progreso')}?ecosistema=${eco}`),
        MEITI.fetchDatos(`/api/boveda/${MEITI.obtenerTabla('ll_lecciones')}?ecosistema=${eco}`)
      ]);

      if (!resPerf.ok || !resProg.ok || !resLec.ok) {
        setError(MEITI.t('err_load_students', null, 'Error al cargar la lista de estudiantes.'));
      } else {
        const perfiles = resPerf.registros || [];
        const progreso = resProg.registros || [];
        const totalLecciones = (resLec.registros || []).length;

        const datosProcesados = perfiles.map(p => {
          const progUsuario = progreso.filter(pr => pr.usuario_id === p.usuario_id && String(pr.completada) === '1');
          const ultima = progUsuario.length > 0 
            ? progUsuario.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0].fecha 
            : null;
          const avancePct = totalLecciones > 0 ? Math.min(100, Math.round((progUsuario.length / totalLecciones) * 100)) : 0;

          return {
            ...p,
            lecciones_completadas: progUsuario.length,
            ultima_practica: ultima,
            avance_pct: avancePct
          };
        });

        setAlumnos(datosProcesados.sort((a, b) => b.avance_pct - a.avance_pct));
      }
      setCargando(false);
    };
    cargar();
  }, []);

  const columnas = [
    {
      clave: 'nombre',
      etiqueta: MEITI.t('col_student', null, 'Estudiante'),
      render: (f) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: tema.colorPrimario + '33', color: tema.colorPrimario }}>
            {(f.nombre || '?').charAt(0).toUpperCase()}
          </div>
          <span className="font-bold" style={{ color: tema.texto }}>{f.nombre || MEITI.t('unnamed', null, 'Sin nombre')}</span>
        </div>
      )
    },
    {
      clave: 'avance_pct',
      etiqueta: MEITI.t('col_progress', null, 'Avance del Curso'),
      render: (f) => (
        <div className="flex items-center gap-3 w-full max-w-[200px]">
          <span className="text-sm font-mono font-bold w-10 text-right" style={{ color: tema.texto }}>{f.avance_pct}%</span>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: tema.texto + '22' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${f.avance_pct}%`, backgroundColor: f.avance_pct === 100 ? '#10b981' : tema.colorPrimario }} />
          </div>
        </div>
      )
    },
    {
      clave: 'racha',
      etiqueta: MEITI.t('col_streak', null, 'Racha'),
      render: (f) => (
        <div className="flex items-center gap-1 font-bold" style={{ color: Number(f.racha) > 0 ? '#f59e0b' : tema.texto, opacity: Number(f.racha) > 0 ? 1 : 0.5 }}>
          <Iconos.Flame size={16} />
          <span>{f.racha || 0}</span>
        </div>
      )
    },
    {
      clave: 'puntos',
      etiqueta: MEITI.t('col_points', null, 'Puntos XP'),
      tipo: 'numero'
    },
    {
      clave: 'ultima_practica',
      etiqueta: MEITI.t('col_last_seen', null, 'Última Práctica'),
      render: (f) => f.ultima_practica ? <span className="text-sm opacity-80" style={{ color: tema.texto }}>{new Date(f.ultima_practica).toLocaleDateString()}</span> : <span className="text-sm opacity-50" style={{ color: tema.texto }}>{MEITI.t('never', null, 'Nunca')}</span>
    }
  ];

  return (
    <Animacion.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 }}>
      <UI.Tarjeta className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Iconos.ListChecks size={20} color={tema.colorSecundario} />
          <UI.Etiqueta>{MEITI.t('students_list', null, 'Lista de Estudiantes')}</UI.Etiqueta>
        </div>
        
        <UI.Aviso mensaje={error} tono="peligro" onCerrar={() => setError(null)} />

        {cargando ? (
          <div className="p-8 text-center">
            <Iconos.LoaderCircle className="animate-spin mx-auto mb-2" size={32} color={tema.colorSecundario} />
            <p style={{color: tema.texto}}>{MEITI.t('loading_students', null, 'Cargando estudiantes...')}</p>
          </div>
        ) : alumnos.length === 0 ? (
          <UI.EstadoVacio icono="fa-users-slash" mensaje={MEITI.t('no_students', null, 'Todavía no hay estudiantes registrados.')} />
        ) : (
          <UI.TablaDatos 
            columnas={columnas} 
            datos={alumnos} 
            claveId="usuario_id" 
            advertirAccionIncompleta={false}
          />
        )}
      </UI.Tarjeta>
    </Animacion.motion.div>
  );
}