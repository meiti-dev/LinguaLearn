import React, { useState, useEffect } from 'react';
import { LIBRERIAS_PREMIUM } from '../core/libreriasPremium.js';

const { Iconos, Animacion, Graficos } = LIBRERIAS_PREMIUM;

// 🛡️ Ladrillo Forjado por IA y Aprobado por el Pentágono (MEITI)
const LinguaLearn_muukb9ph__LL_VisorLeccion = ({ datos, tema, UI, MEITI }) => {
  const eco = MEITI.obtenerEcosistemaActual();
  const miId = MEITI.obtenerUsuarioActual();
  const [leccionId, setLeccionId] = useState(null);
  const [ejercicios, setEjercicios] = useState([]);
  const [idxActual, setIdxActual] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState('');
  const [estadoFeedback, setEstadoFeedback] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [terminado, setTerminado] = useState(false);
  
  const [leccionPuntos, setLeccionPuntos] = useState(10);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const resSesion = await MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('ll_sesion_activa')}?ecosistema=${eco}`);
      if (resSesion.ok && resSesion.registros.length > 0) {
        const lId = resSesion.registros[0].leccion_id;
        setLeccionId(lId);
        
        const [resEjs, resLec, resPerf] = await Promise.all([
          MEITI.fetchDatos(`/api/boveda/${MEITI.obtenerTabla('ll_ejercicios')}?ecosistema=${eco}`),
          MEITI.fetchDatos(`/api/boveda/${MEITI.obtenerTabla('ll_lecciones')}?ecosistema=${eco}`),
          MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('ll_perfiles')}?ecosistema=${eco}`)
        ]);

        if (resEjs.ok) {
          setEjercicios(resEjs.registros.filter(e => e.leccion_id === lId).sort((a,b) => a.orden - b.orden));
        }
        if (resLec.ok) {
          const lec = resLec.registros.find(l => l.id === lId);
          if (lec) setLeccionPuntos(lec.puntos || 10);
        }
        if (resPerf.ok && resPerf.registros.length > 0) {
          setPerfil(resPerf.registros[0]);
        }
      } else {
        setError(MEITI.t('ll_no_active_lesson', null, 'No hay lección activa. Vuelve al camino.'));
      }
      setCargando(false);
    };
    cargar();
  }, []);

  const comprobar = () => {
    if (!respuestaSeleccionada) return;
    const ej = ejercicios[idxActual];
    if (respuestaSeleccionada.toLowerCase().trim() === ej.respuesta_correcta.toLowerCase().trim()) {
      setEstadoFeedback('correcta');
    } else {
      setEstadoFeedback('incorrecta');
    }
  };

  const continuar = async () => {
    setEstadoFeedback(null);
    setRespuestaSeleccionada('');
    if (idxActual < ejercicios.length - 1) {
      setIdxActual(idxActual + 1);
    } else {
      finalizarLeccion();
    }
  };

  const finalizarLeccion = async () => {
    setTerminado(true);
    const payloadProgreso = { id: 'prog_' + Date.now(), usuario_id: miId, leccion_id: leccionId, completada: 1, fecha: new Date().toISOString() };
    
    const mutaciones = [
      { url: `/api/boveda/${MEITI.obtenerTabla('ll_progreso')}?ecosistema=${eco}`, opciones: { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payloadProgreso) } }
    ];

    if (perfil) {
      const payloadPerfil = { ...perfil, puntos: (perfil.puntos || 0) + leccionPuntos, racha: (perfil.racha || 0) + 1 };
      mutaciones.push({ url: `/api/boveda/${MEITI.obtenerTabla('ll_perfiles')}?ecosistema=${eco}`, opciones: { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payloadPerfil) } });
    } else {
      const nuevoPerfil = { id: 'perf_' + miId, usuario_id: miId, estudiante_id: miId, nombre: 'Estudiante', puntos: leccionPuntos, racha: 1 };
      mutaciones.push({ url: `/api/boveda/${MEITI.obtenerTabla('ll_perfiles')}?ecosistema=${eco}`, opciones: { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(nuevoPerfil) } });
    }

    await MEITI.mutarVarias(mutaciones, {
      alLograr: () => {},
      alFallar: () => {}
    });
  };

  if (cargando) return <div className="p-8 text-center"><Iconos.LoaderCircle className="animate-spin mx-auto" size={32} color={tema.colorPrimario} /></div>;
  if (error) return <UI.Aviso mensaje={error} tono="peligro" onCerrar={() => MEITI.irAPagina('camino')} />;
  if (ejercicios.length === 0) return <UI.EstadoVacio icono="fa-book-open" mensaje={MEITI.t('ll_no_exercises', null, 'Esta lección no tiene ejercicios aún.')} />;

  if (terminado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-4">
        <Animacion.motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <Iconos.Trophy size={80} color={tema.colorSecundario} />
        </Animacion.motion.div>
        <h2 className="text-3xl font-black" style={{ color: tema.texto }}>{MEITI.t('ll_lesson_complete', null, '¡Lección Completada!')}</h2>
        <p className="opacity-70" style={{ color: tema.texto }}>{MEITI.t('ll_lesson_complete_desc', null, 'Has ganado puntos de experiencia.')}</p>
        <button onClick={() => MEITI.irAPagina('camino')} className="w-full py-4 rounded-2xl font-black text-lg mt-8" style={{ background: tema.colorPrimario, color: '#fff' }}>
          {MEITI.t('ll_btn_finish', null, 'Continuar')}
        </button>
      </div>
    );
  }

  const ej = ejercicios[idxActual];
  const progresoPct = ((idxActual) / ejercicios.length) * 100;
  let opciones = [];
  try { opciones = JSON.parse(ej.opciones || '[]'); } catch(e) {}

  return (
    <div className="flex flex-col pb-32 px-2">
      <div className="flex items-center gap-4 py-4">
        <button onClick={() => MEITI.irAPagina('camino')}><Iconos.X size={28} color={tema.texto} className="opacity-50" /></button>
        <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: tema.texto + '22' }}>
          <div className="h-full transition-all duration-500" style={{ width: `${progresoPct}%`, background: tema.colorSecundario }}></div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-8">
        <h2 className="text-2xl font-bold" style={{ color: tema.texto }}>{ej.pregunta}</h2>
        
        {ej.tipo === 'opcion_multiple' ? (
          <div className="flex flex-col gap-3">
            {opciones.map((op, i) => (
              <button 
                key={i}
                onClick={() => !estadoFeedback && setRespuestaSeleccionada(op)}
                className="p-4 rounded-2xl border-2 text-left font-bold text-lg transition-all"
                style={{ 
                  borderColor: respuestaSeleccionada === op ? tema.colorPrimario : tema.texto + '22',
                  background: respuestaSeleccionada === op ? tema.colorPrimario + '11' : 'transparent',
                  color: respuestaSeleccionada === op ? tema.colorPrimario : tema.texto
                }}
              >
                {op}
              </button>
            ))}
          </div>
        ) : (
          <UI.Campo 
            tipo="text" 
            valor={respuestaSeleccionada} 
            onChange={e => !estadoFeedback && setRespuestaSeleccionada(e.target.value)} 
            placeholder={MEITI.t('ll_type_answer', null, 'Escribe tu respuesta aquí...')}
          />
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 p-4 bg-white border-t" style={{ borderColor: tema.texto + '11', background: tema.fondo }}>
        {!estadoFeedback ? (
          <button 
            onClick={comprobar}
            disabled={!respuestaSeleccionada}
            className="w-full py-4 rounded-2xl font-black text-lg transition-opacity"
            style={{ background: tema.colorPrimario, color: '#fff', opacity: respuestaSeleccionada ? 1 : 0.5 }}
          >
            {MEITI.t('ll_btn_check', null, 'Comprobar')}
          </button>
        ) : null}
      </div>

      <Animacion.AnimatePresence>
        {estadoFeedback && (
          <Animacion.motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-0 inset-x-0 p-6 rounded-t-3xl flex flex-col gap-4 z-50"
            style={{ background: estadoFeedback === 'correcta' ? '#dcfce7' : '#fee2e2' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: estadoFeedback === 'correcta' ? '#16a34a' : '#dc2626', color: '#fff' }}>
                {estadoFeedback === 'correcta' ? <Iconos.Check size={24} /> : <Iconos.X size={24} />}
              </div>
              <h3 className="text-2xl font-black" style={{ color: estadoFeedback === 'correcta' ? '#16a34a' : '#dc2626' }}>
                {estadoFeedback === 'correcta' ? MEITI.t('ll_correct', null, '¡Excelente!') : MEITI.t('ll_incorrect', null, 'Respuesta incorrecta')}
              </h3>
            </div>
            {estadoFeedback === 'incorrecta' && (
              <div className="text-red-800">
                <span className="font-bold">{MEITI.t('ll_correct_answer', null, 'Solución correcta:')}</span> {ej.respuesta_correcta}
              </div>
            )}
            <button 
              onClick={continuar}
              className="w-full py-4 rounded-2xl font-black text-lg"
              style={{ background: estadoFeedback === 'correcta' ? '#16a34a' : '#dc2626', color: '#fff' }}
            >
              {MEITI.t('ll_btn_continue', null, 'Continuar')}
            </button>
          </Animacion.motion.div>
        )}
      </Animacion.AnimatePresence>
    </div>
  );
};

export default LinguaLearn_muukb9ph__LL_VisorLeccion;
