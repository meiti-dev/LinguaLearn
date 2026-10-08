/* global React, useState, useEffect, useRef, useMemo, useCallback, datos, tema, UI, MEITI, LIBRERIAS_PREMIUM, Iconos, Animacion, Graficos, render */
// Molde de MEITI: este archivo es el código que corre la app (server/server.js lo carga al arrancar; si lo cambias, reinicia el backend).
({ datos, tema, UI, MEITI }) => {
  const eco = MEITI.obtenerEcosistemaActual();
  const miId = MEITI.obtenerUsuarioActual();
  const [ranking, setRanking] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const res = await MEITI.fetchDatos(`/api/boveda/${MEITI.obtenerTabla('ll_perfiles')}?ecosistema=${eco}`);
      if (res.ok) {
        const ordenados = res.registros.sort((a, b) => (b.puntos || 0) - (a.puntos || 0));
        setRanking(ordenados.map((r, i) => ({ ...r, posicion: i + 1 })));
      } else {
        setError(res.error || MEITI.t('error_loading_ranking', null, 'Error al cargar el ranking'));
      }
      setCargando(false);
    };
    cargar();
  }, []);

  const columnas = [
    {
      clave: 'posicion',
      etiqueta: MEITI.t('col_pos', null, '#'),
      render: (fila) => {
        let colorPos = tema.texto;
        if (fila.posicion === 1) colorPos = '#fbbf24';
        if (fila.posicion === 2) colorPos = '#9ca3af';
        if (fila.posicion === 3) colorPos = '#b45309';
        return (
          <div className="font-black text-lg text-center" style={{ color: colorPos }}>
            {fila.posicion}
          </div>
        );
      }
    },
    {
      clave: 'nombre',
      etiqueta: MEITI.t('col_student', null, 'Estudiante'),
      render: (fila) => {
        const esYo = fila.estudiante_id === miId || fila.usuario_id === miId;
        const avatarIndex = ((fila.posicion - 1) % 35) + 1;
        return (
          <div className="flex items-center gap-3">
            <img 
              src={`http://localhost:4001/avatares/memo_${avatarIndex}.png`} 
              alt="avatar" 
              className="w-10 h-10 rounded-full bg-black/5 object-cover"
            />
            <span className="font-bold" style={{ color: tema.texto }}>
              {fila.nombre || MEITI.t('anonymous_student', null, 'Estudiante')}
            </span>
            {esYo && <UI.Chip tono="exito">{MEITI.t('you_badge', null, 'TÚ')}</UI.Chip>}
          </div>
        );
      }
    },
    {
      clave: 'racha',
      etiqueta: MEITI.t('col_streak', null, 'Racha'),
      render: (fila) => (
        <div className="flex items-center gap-2 text-sm font-medium opacity-80" style={{ color: tema.texto }}>
          <i className="fa-solid fa-fire" style={{ color: tema.colorSecundario }}></i>
          {fila.racha || 0} {MEITI.t('days_streak', null, 'días')}
        </div>
      )
    },
    {
      clave: 'puntos',
      etiqueta: MEITI.t('col_xp', null, 'XP'),
      render: (fila) => (
        <div className="font-black text-lg" style={{ color: tema.colorPrimario }}>
          {fila.puntos || 0} XP
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0 p-2 md:p-4">
      <div className="flex items-center gap-3">
        <i className="fa-solid fa-trophy text-3xl" style={{ color: tema.colorSecundario }}></i>
        <h1 className="text-2xl font-black" style={{ color: tema.texto }}>
          {MEITI.t('ll_leaderboard_title', null, 'Ranking Semanal')}
        </h1>
      </div>

      <UI.Aviso mensaje={error} tono="peligro" onCerrar={() => setError(null)} />

      <UI.Tarjeta className="flex flex-col flex-1 min-h-0 p-0 overflow-hidden">
        {cargando ? (
          <div className="p-8 flex flex-col items-center justify-center flex-1">
            <i className="fa-solid fa-circle-notch fa-spin text-4xl" style={{ color: tema.colorPrimario }}></i>
            <p className="mt-4 font-medium opacity-70" style={{ color: tema.texto }}>
              {MEITI.t('loading_ranking_msg', null, 'Cargando posiciones...')}
            </p>
          </div>
        ) : ranking.length === 0 ? (
          <div className="p-6 flex-1 flex items-center justify-center">
            <UI.EstadoVacio 
              icono="fa-medal" 
              mensaje={MEITI.t('ll_no_ranking_yet', null, 'Aún no hay estudiantes en el ranking.')} 
            />
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col">
            <UI.TablaDatos
              columnas={columnas}
              datos={ranking}
              claveId="id"
              advertirAccionIncompleta={false}
            />
          </div>
        )}
      </UI.Tarjeta>
    </div>
  );
}