import React, { useState, useEffect } from 'react';
import { LIBRERIAS_PREMIUM } from '../core/libreriasPremium.js';

const { Iconos, Animacion, Graficos } = LIBRERIAS_PREMIUM;

// 🛡️ Ladrillo Forjado por IA y Aprobado por el Pentágono (MEITI)
const LinguaLearn_muukb9ph__LL_ResumenAlumno = ({ datos, tema, UI, MEITI }) => {
  const eco = MEITI.obtenerEcosistemaActual();
  const miId = MEITI.obtenerUsuarioActual();
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const res = await MEITI.fetchDatosPropios(`/api/boveda/${MEITI.obtenerTabla('ll_perfiles')}?ecosistema=${eco}`);
      if (res.ok && res.registros.length > 0) {
        setPerfil(res.registros[0]);
      } else {
        const nuevoPerfil = { id: 'perf_' + miId, usuario_id: miId, estudiante_id: miId, nombre: 'Estudiante', puntos: 0, racha: 0 };
        await MEITI.mutar(`/api/boveda/${MEITI.obtenerTabla('ll_perfiles')}?ecosistema=${eco}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(nuevoPerfil) }, { alLograr: () => setPerfil(nuevoPerfil) });
      }
      setCargando(false);
    };
    cargar();
  }, []);

  if (cargando) return <div className="p-8 text-center"><Iconos.LoaderCircle className="animate-spin mx-auto" size={32} color={tema.colorPrimario} /></div>;

  return (
    <div className="flex flex-col gap-6 pb-28">
      <div className="flex items-center justify-between px-2">
        <h1 className="text-2xl font-black" style={{ color: tema.texto }}>{MEITI.t('ll_home_title', null, 'Tu Progreso')}</h1>
        <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
          <Iconos.User size={20} color={tema.texto} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Animacion.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <UI.Tarjeta className="flex flex-col items-center justify-center p-6 text-center gap-2">
            <Iconos.Flame size={40} color={tema.colorSecundario} />
            <span className="text-3xl font-black" style={{ color: tema.texto }}>{perfil?.racha || 0}</span>
            <span className="text-sm font-bold opacity-70 uppercase tracking-wider" style={{ color: tema.texto }}>{MEITI.t('ll_streak_days', null, 'Días de racha')}</span>
          </UI.Tarjeta>
        </Animacion.motion.div>

        <Animacion.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <UI.Tarjeta className="flex flex-col items-center justify-center p-6 text-center gap-2">
            <Iconos.Star size={40} color={tema.colorPrimario} />
            <span className="text-3xl font-black" style={{ color: tema.texto }}>{perfil?.puntos || 0}</span>
            <span className="text-sm font-bold opacity-70 uppercase tracking-wider" style={{ color: tema.texto }}>{MEITI.t('ll_total_points', null, 'Puntos EXP')}</span>
          </UI.Tarjeta>
        </Animacion.motion.div>
      </div>

      <UI.Tarjeta className="p-6 flex flex-col gap-4 mt-4">
        <div className="flex items-center gap-3">
          <Iconos.Target size={24} color={tema.colorPrimario} />
          <h2 className="text-xl font-bold" style={{ color: tema.texto }}>{MEITI.t('ll_ready_to_learn', null, '¿Listo para aprender?')}</h2>
        </div>
        <p className="opacity-80 text-sm" style={{ color: tema.texto }}>{MEITI.t('ll_home_desc', null, 'Continúa tu camino de aprendizaje y mantén tu racha activa.')}</p>
        <button 
          onClick={() => MEITI.irAPagina('camino')}
          className="w-full py-4 rounded-2xl font-black text-lg shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 mt-2"
          style={{ background: tema.colorPrimario, color: '#fff' }}
        >
          {MEITI.t('ll_btn_continue', null, 'Continuar Ruta')}
          <Iconos.ArrowRight size={20} />
        </button>
      </UI.Tarjeta>
    </div>
  );
};

export default LinguaLearn_muukb9ph__LL_ResumenAlumno;
