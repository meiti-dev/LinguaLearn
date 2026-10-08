import React, { useState, useEffect } from 'react';
import { LIBRERIAS_PREMIUM } from '../core/libreriasPremium.js';

const { Iconos, Animacion, Graficos } = LIBRERIAS_PREMIUM;

// 🛡️ Ladrillo Forjado por IA y Aprobado por el Pentágono (MEITI)
const LinguaLearn_muukb9ph__LL_GestorContenido = ({ datos, tema, UI, MEITI }) => {
  const eco = MEITI.obtenerEcosistemaActual();
  const [pestana, setPestana] = useState('unidades');
  const [unidades, setUnidades] = useState([]);
  const [lecciones, setLecciones] = useState([]);
  const [ejercicios, setEjercicios] = useState([]);
  const [catalogos, setCatalogos] = useState([]);
  const [error, setError] = useState(null);

  const [formU, setFormU] = useState({ id: '', titulo: '', descripcion: '', orden: '' });
  const [formL, setFormL] = useState({ id: '', unidad_id: '', titulo: '', orden: '', puntos: '10' });
  const [formE, setFormE] = useState({ id: '', leccion_id: '', tipo: '', pregunta: '', opciones: '', respuesta_correcta: '', orden: '' });

  const cargar = async () => {
    const [resU, resL, resE, resC] = await Promise.all([
      MEITI.fetchDatos(`/api/boveda/${MEITI.obtenerTabla('ll_unidades')}?ecosistema=${eco}`),
      MEITI.fetchDatos(`/api/boveda/${MEITI.obtenerTabla('ll_lecciones')}?ecosistema=${eco}`),
      MEITI.fetchDatos(`/api/boveda/${MEITI.obtenerTabla('ll_ejercicios')}?ecosistema=${eco}`),
      MEITI.fetchDatos(`/api/boveda/${MEITI.obtenerTabla('ll_catalogos')}?ecosistema=${eco}`)
    ]);
    if (resU.ok) setUnidades(resU.registros);
    if (resL.ok) setLecciones(resL.registros);
    if (resE.ok) setEjercicios(resE.registros);
    if (resC.ok) setCatalogos(resC.registros);
  };

  useEffect(() => { cargar(); }, []);

  if (MEITI.miRolEnLaApp() !== 'admin' && !MEITI.soyDuenoDeLaApp()) {
    return <UI.Aviso tono="peligro" mensaje={MEITI.t('ll_admin_only', null, 'Acceso denegado. Solo profesores.')} />;
  }

  const tiposEjercicio = catalogos.filter(c => c.tipo === 'tipo_ejercicio');

  const guardarUnidad = async (e) => {
    e.preventDefault();
    const payload = { id: formU.id || 'uni_' + Date.now(), titulo: formU.titulo, descripcion: formU.descripcion, orden: Number(formU.orden) || 1 };
    await MEITI.mutar(`/api/boveda/${MEITI.obtenerTabla('ll_unidades')}?ecosistema=${eco}`, { method: formU.id ? 'PUT' : 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) }, { alLograr: () => { setFormU({id:'', titulo:'', descripcion:'', orden:''}); cargar(); }, alFallar: setError });
  };

  const borrarUnidad = async (id) => {
    if (!await MEITI.confirmar(MEITI.t('ll_del_unit', null, '¿Borrar unidad?'), { titulo: MEITI.t('delete', null, 'Borrar'), confirmar: MEITI.t('delete_yes', null, 'Sí, borrar'), tono: 'peligro' })) return;
    await MEITI.mutar(`/api/boveda/${MEITI.obtenerTabla('ll_unidades')}?ecosistema=${eco}&id=${id}`, { method: 'DELETE' }, { alLograr: cargar, alFallar: setError });
  };

  const guardarLeccion = async (e) => {
    e.preventDefault();
    const payload = { id: formL.id || 'lec_' + Date.now(), unidad_id: formL.unidad_id, titulo: formL.titulo, orden: Number(formL.orden) || 1, puntos: Number(formL.puntos) || 10 };
    await MEITI.mutar(`/api/boveda/${MEITI.obtenerTabla('ll_lecciones')}?ecosistema=${eco}`, { method: formL.id ? 'PUT' : 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) }, { alLograr: () => { setFormL({id:'', unidad_id:'', titulo:'', orden:'', puntos:'10'}); cargar(); }, alFallar: setError });
  };

  const borrarLeccion = async (id) => {
    if (!await MEITI.confirmar(MEITI.t('ll_del_lesson', null, '¿Borrar lección?'), { titulo: MEITI.t('delete', null, 'Borrar'), confirmar: MEITI.t('delete_yes', null, 'Sí, borrar'), tono: 'peligro' })) return;
    await MEITI.mutar(`/api/boveda/${MEITI.obtenerTabla('ll_lecciones')}?ecosistema=${eco}&id=${id}`, { method: 'DELETE' }, { alLograr: cargar, alFallar: setError });
  };

  const guardarEjercicio = async (e) => {
    e.preventDefault();
    let opcionesJSON = formE.opciones;
    if (formE.tipo === 'opcion_multiple' && formE.opciones && !formE.opciones.trim().startsWith('[')) {
      opcionesJSON = JSON.stringify(formE.opciones.split(',').map(s => s.trim()));
    }
    const payload = { id: formE.id || 'ej_' + Date.now(), leccion_id: formE.leccion_id, tipo: formE.tipo, pregunta: formE.pregunta, opciones: opcionesJSON, respuesta_correcta: formE.respuesta_correcta, orden: Number(formE.orden) || 1 };
    await MEITI.mutar(`/api/boveda/${MEITI.obtenerTabla('ll_ejercicios')}?ecosistema=${eco}`, { method: formE.id ? 'PUT' : 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) }, { alLograr: () => { setFormE({id:'', leccion_id:'', tipo:'', pregunta:'', opciones:'', respuesta_correcta:'', orden:''}); cargar(); }, alFallar: setError });
  };

  const borrarEjercicio = async (id) => {
    if (!await MEITI.confirmar(MEITI.t('ll_del_exercise', null, '¿Borrar ejercicio?'), { titulo: MEITI.t('delete', null, 'Borrar'), confirmar: MEITI.t('delete_yes', null, 'Sí, borrar'), tono: 'peligro' })) return;
    await MEITI.mutar(`/api/boveda/${MEITI.obtenerTabla('ll_ejercicios')}?ecosistema=${eco}&id=${id}`, { method: 'DELETE' }, { alLograr: cargar, alFallar: setError });
  };

  return (
    <div className="flex flex-col gap-6 pb-28 flex-1 min-h-0">
      <UI.Pestanas 
        pestanas={[
          {id:'unidades', titulo: MEITI.t('ll_units', null, 'Unidades')}, 
          {id:'lecciones', titulo: MEITI.t('ll_lessons', null, 'Lecciones')},
          {id:'ejercicios', titulo: MEITI.t('ll_exercises', null, 'Ejercicios')}
        ]}
        activa={pestana}
        onCambio={setPestana}
      />
      <UI.Aviso mensaje={error} tono="peligro" onCerrar={() => setError(null)} />

      {pestana === 'unidades' && (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
          <UI.Tarjeta>
            <UI.Etiqueta>{formU.id ? MEITI.t('ll_edit_unit', null, 'Editar Unidad') : MEITI.t('ll_new_unit', null, 'Nueva Unidad')}</UI.Etiqueta>
            <form onSubmit={guardarUnidad} className="flex flex-col gap-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex-1"><UI.Campo etiqueta={MEITI.t('ll_title', null, 'Título')} tipo="text" valor={formU.titulo} onChange={e => setFormU({...formU, titulo: e.target.value})} /></div>
                <div className="flex-1"><UI.Campo etiqueta={MEITI.t('ll_order', null, 'Orden')} tipo="number" valor={formU.orden} onChange={e => setFormU({...formU, orden: e.target.value})} /></div>
                <div className="md:col-span-2 flex-1"><UI.Campo etiqueta={MEITI.t('ll_desc', null, 'Descripción')} tipo="text" valor={formU.descripcion} onChange={e => setFormU({...formU, descripcion: e.target.value})} /></div>
              </div>
              <div className="flex gap-2">
                <UI.Boton tipo="submit" variante="primario">{MEITI.t('ll_save', null, 'Guardar')}</UI.Boton>
                {formU.id && <UI.Boton tipo="button" variante="secundario" onClick={() => setFormU({id:'', titulo:'', descripcion:'', orden:''})}>{MEITI.t('ll_cancel', null, 'Cancelar')}</UI.Boton>}
              </div>
            </form>
          </UI.Tarjeta>
          <UI.Tarjeta className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0">
              <UI.TablaDatos 
                columnas={[{clave:'orden', etiqueta: MEITI.t('ll_order_col', null, '#')}, {clave:'titulo', etiqueta: MEITI.t('ll_title_col', null, 'Título')}]}
                datos={unidades}
                claveId="id"
                onEditar={f => setFormU({id: f.id, titulo: f.titulo, descripcion: f.descripcion, orden: f.orden})}
                onBorrar={f => borrarUnidad(f.id)}
              />
            </div>
          </UI.Tarjeta>
        </div>
      )}

      {pestana === 'lecciones' && (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
          <UI.Tarjeta>
            <UI.Etiqueta>{formL.id ? MEITI.t('ll_edit_lesson', null, 'Editar Lección') : MEITI.t('ll_new_lesson', null, 'Nueva Lección')}</UI.Etiqueta>
            <form onSubmit={guardarLeccion} className="flex flex-col gap-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex-1"><UI.Campo etiqueta={MEITI.t('ll_unit', null, 'Unidad')} tipo="select" valor={formL.unidad_id} onChange={e => setFormL({...formL, unidad_id: e.target.value})} opciones={[{value:'', label: MEITI.t('ll_select', null, 'Seleccionar...')}, ...unidades.map(u => ({value: u.id, label: u.titulo}))]} /></div>
                <div className="flex-1"><UI.Campo etiqueta={MEITI.t('ll_title', null, 'Título')} tipo="text" valor={formL.titulo} onChange={e => setFormL({...formL, titulo: e.target.value})} /></div>
                <div className="flex-1"><UI.Campo etiqueta={MEITI.t('ll_order', null, 'Orden')} tipo="number" valor={formL.orden} onChange={e => setFormL({...formL, orden: e.target.value})} /></div>
                <div className="flex-1"><UI.Campo etiqueta={MEITI.t('ll_points', null, 'Puntos')} tipo="number" valor={formL.puntos} onChange={e => setFormL({...formL, puntos: e.target.value})} /></div>
              </div>
              <div className="flex gap-2">
                <UI.Boton tipo="submit" variante="primario">{MEITI.t('ll_save', null, 'Guardar')}</UI.Boton>
                {formL.id && <UI.Boton tipo="button" variante="secundario" onClick={() => setFormL({id:'', unidad_id:'', titulo:'', orden:'', puntos:'10'})}>{MEITI.t('ll_cancel', null, 'Cancelar')}</UI.Boton>}
              </div>
            </form>
          </UI.Tarjeta>
          <UI.Tarjeta className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0">
              <UI.TablaDatos 
                columnas={[{clave:'titulo', etiqueta: MEITI.t('ll_lesson_col', null, 'Lección')}, {clave:'unidad_id', etiqueta: MEITI.t('ll_unit_col', null, 'Unidad'), render: f => unidades.find(u => u.id === f.unidad_id)?.titulo || '---'}]}
                datos={lecciones}
                claveId="id"
                onEditar={f => setFormL({id: f.id, unidad_id: f.unidad_id, titulo: f.titulo, orden: f.orden, puntos: f.puntos})}
                onBorrar={f => borrarLeccion(f.id)}
              />
            </div>
          </UI.Tarjeta>
        </div>
      )}

      {pestana === 'ejercicios' && (
        <div className="flex flex-col gap-6 flex-1 min-h-0">
          <UI.Tarjeta>
            <UI.Etiqueta>{formE.id ? MEITI.t('ll_edit_exercise', null, 'Editar Ejercicio') : MEITI.t('ll_new_exercise', null, 'Nuevo Ejercicio')}</UI.Etiqueta>
            <form onSubmit={guardarEjercicio} className="flex flex-col gap-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex-1"><UI.Campo etiqueta={MEITI.t('ll_lesson', null, 'Lección')} tipo="select" valor={formE.leccion_id} onChange={e => setFormE({...formE, leccion_id: e.target.value})} opciones={[{value:'', label: MEITI.t('ll_select', null, 'Seleccionar...')}, ...lecciones.map(l => ({value: l.id, label: l.titulo}))]} /></div>
                <div className="flex-1"><UI.Campo etiqueta={MEITI.t('ll_type', null, 'Tipo')} tipo="select" valor={formE.tipo} onChange={e => setFormE({...formE, tipo: e.target.value})} opciones={[{value:'', label: MEITI.t('ll_select', null, 'Seleccionar...')}, ...tiposEjercicio.map(t => ({value: t.clave, label: t.etiqueta}))]} /></div>
                <div className="md:col-span-2 flex-1"><UI.Campo etiqueta={MEITI.t('ll_question', null, 'Pregunta')} tipo="text" valor={formE.pregunta} onChange={e => setFormE({...formE, pregunta: e.target.value})} /></div>
                {formE.tipo === 'opcion_multiple' && (
                  <div className="md:col-span-2 flex-1"><UI.Campo etiqueta={MEITI.t('ll_options', null, 'Opciones (separadas por coma)')} tipo="text" valor={formE.opciones} onChange={e => setFormE({...formE, opciones: e.target.value})} placeholder={MEITI.t('ll_options_ph', null, 'Ej: Gato, Perro, Pájaro')} /></div>
                )}
                <div className="flex-1"><UI.Campo etiqueta={MEITI.t('ll_correct_answer', null, 'Respuesta Correcta')} tipo="text" valor={formE.respuesta_correcta} onChange={e => setFormE({...formE, respuesta_correcta: e.target.value})} /></div>
                <div className="flex-1"><UI.Campo etiqueta={MEITI.t('ll_order', null, 'Orden')} tipo="number" valor={formE.orden} onChange={e => setFormE({...formE, orden: e.target.value})} /></div>
              </div>
              <div className="flex gap-2">
                <UI.Boton tipo="submit" variante="primario">{MEITI.t('ll_save', null, 'Guardar')}</UI.Boton>
                {formE.id && <UI.Boton tipo="button" variante="secundario" onClick={() => setFormE({id:'', leccion_id:'', tipo:'', pregunta:'', opciones:'', respuesta_correcta:'', orden:''})}>{MEITI.t('ll_cancel', null, 'Cancelar')}</UI.Boton>}
              </div>
            </form>
          </UI.Tarjeta>
          <UI.Tarjeta className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0">
              <UI.TablaDatos 
                columnas={[
                  {clave:'pregunta', etiqueta: MEITI.t('ll_question_col', null, 'Pregunta')}, 
                  {clave:'leccion_id', etiqueta: MEITI.t('ll_lesson_col', null, 'Lección'), render: f => lecciones.find(l => l.id === f.leccion_id)?.titulo || '---'},
                  {clave:'tipo', etiqueta: MEITI.t('ll_type_col', null, 'Tipo'), render: f => tiposEjercicio.find(t => t.clave === f.tipo)?.etiqueta || f.tipo}
                ]}
                datos={ejercicios}
                claveId="id"
                onEditar={f => {
                  let ops = f.opciones;
                  try {
                    const parsed = JSON.parse(f.opciones);
                    if (Array.isArray(parsed)) ops = parsed.join(', ');
                  } catch(e) {}
                  setFormE({id: f.id, leccion_id: f.leccion_id, tipo: f.tipo, pregunta: f.pregunta, opciones: ops || '', respuesta_correcta: f.respuesta_correcta, orden: f.orden});
                }}
                onBorrar={f => borrarEjercicio(f.id)}
              />
            </div>
          </UI.Tarjeta>
        </div>
      )}
    </div>
  );
};

export default LinguaLearn_muukb9ph__LL_GestorContenido;
