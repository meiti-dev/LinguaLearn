/* global React, useState, useEffect, useRef, useMemo, useCallback, datos, tema, UI, MEITI, LIBRERIAS_PREMIUM, Iconos, Animacion, Graficos, render */
// Molde de MEITI: este archivo es el código que corre la app (server/server.js lo carga al arrancar; si lo cambias, reinicia el backend).
({ datos, tema, UI, MEITI }) => {
  const eco = MEITI.obtenerEcosistemaActual();
  const [perfiles, setPerfiles] = useState([]);
  const [progreso, setProgreso] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const [resPerf, resProg] = await Promise.all([
        MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('ll_perfiles')}?ecosistema=${eco}`),
        MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('ll_progreso')}?ecosistema=${eco}`)
      ]);

      if (!resPerf.ok || !resProg.ok) {
        setError(MEITI.t('err_load_metrics', null, 'Error al cargar las métricas.'));
      } else {
        setPerfiles(resPerf.registros || []);
        setProgreso(resProg.registros || []);
      }
      setCargando(false);
    };
    cargar();
  }, []);

  if (cargando) return <UI.Tarjeta><div className="p-8 text-center"><Iconos.LoaderCircle className="animate-spin mx-auto mb-2" size={32} color={tema.colorPrimario} /><p style={{color: tema.texto}}>{MEITI.t('loading_metrics', null, 'Calculando métricas...')}</p></div></UI.Tarjeta>;

  const totalAlumnos = perfiles.length;
  const leccionesCompletadas = progreso.filter(p => String(p.completada) === '1').length;
  const rachaPromedio = totalAlumnos > 0 ? (perfiles.reduce((acc, p) => acc + (Number(p.racha) || 0), 0) / totalAlumnos).toFixed(1) : 0;

  const hoy = new Date();
  const ultimos7Dias = Array.from({length: 7}, (_, i) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const datosGrafico = ultimos7Dias.map(fecha => {
    const completadasEseDia = progreso.filter(p => String(p.completada) === '1' && (p.fecha || '').startsWith(fecha)).length;
    return {
      fecha: fecha.split('-').slice(1).join('/'),
      completadas: completadasEseDia
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <UI.Aviso mensaje={error} tono="peligro" onCerrar={() => setError(null)} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Animacion.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <UI.Tarjeta className="flex items-center gap-4 p-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: tema.colorPrimario + '22', color: tema.colorPrimario }}>
              <Iconos.Users size={28} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider opacity-70" style={{ color: tema.texto }}>{MEITI.t('total_students', null, 'Total Alumnos')}</p>
              <p className="text-3xl font-black" style={{ color: tema.texto }}>{totalAlumnos}</p>
            </div>
          </UI.Tarjeta>
        </Animacion.motion.div>

        <Animacion.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <UI.Tarjeta className="flex items-center gap-4 p-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: tema.colorSecundario + '22', color: tema.colorSecundario }}>
              <Iconos.BookOpenCheck size={28} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider opacity-70" style={{ color: tema.texto }}>{MEITI.t('lessons_done', null, 'Lecciones Completadas')}</p>
              <p className="text-3xl font-black" style={{ color: tema.texto }}>{leccionesCompletadas}</p>
            </div>
          </UI.Tarjeta>
        </Animacion.motion.div>

        <Animacion.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <UI.Tarjeta className="flex items-center gap-4 p-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#f59e0b22', color: '#f59e0b' }}>
              <Iconos.Flame size={28} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider opacity-70" style={{ color: tema.texto }}>{MEITI.t('avg_streak', null, 'Racha Promedio')}</p>
              <p className="text-3xl font-black" style={{ color: tema.texto }}>{rachaPromedio} <span className="text-base font-normal opacity-70">{MEITI.t('days', null, 'días')}</span></p>
            </div>
          </UI.Tarjeta>
        </Animacion.motion.div>
      </div>

      <Animacion.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
        <UI.Tarjeta className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Iconos.TrendingUp size={20} color={tema.colorPrimario} />
            <UI.Etiqueta>{MEITI.t('activity_7d', null, 'Actividad (Últimos 7 días)')}</UI.Etiqueta>
          </div>
          {progreso.length === 0 ? (
            <UI.EstadoVacio icono="fa-chart-bar" mensaje={MEITI.t('no_activity_data', null, 'No hay datos de actividad para graficar.')} />
          ) : (
            <div className="w-full h-64">
              <Graficos.ResponsiveContainer width="100%" height="100%">
                <Graficos.BarChart data={datosGrafico}>
                  <Graficos.CartesianGrid strokeDasharray="3 3" stroke={tema.texto + '22'} vertical={false} />
                  <Graficos.XAxis dataKey="fecha" stroke={tema.texto} opacity={0.7} fontSize={12} tickLine={false} axisLine={false} />
                  <Graficos.YAxis stroke={tema.texto} opacity={0.7} fontSize={12} tickLine={false} axisLine={false} />
                  <Graficos.Tooltip 
                    contentStyle={{ backgroundColor: tema.superficie, borderColor: tema.colorPrimario + '44', color: tema.texto, borderRadius: '0.5rem' }}
                    itemStyle={{ color: tema.colorPrimario, fontWeight: 'bold' }}
                  />
                  <Graficos.Bar dataKey="completadas" name={MEITI.t('lessons', null, 'Lecciones')} fill={tema.colorPrimario} radius={[4, 4, 0, 0]} />
                </Graficos.BarChart>
              </Graficos.ResponsiveContainer>
            </div>
          )}
        </UI.Tarjeta>
      </Animacion.motion.div>
    </div>
  );
}