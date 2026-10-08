import React, { useState, useEffect } from 'react';
import { LIBRERIAS_PREMIUM } from '../core/libreriasPremium.js';

const { Iconos, Animacion, Graficos } = LIBRERIAS_PREMIUM;

// 🛡️ Ladrillo Forjado por IA y Aprobado por el Pentágono (MEITI)
const LinguaLearn_muukb9ph__LL_GestorCatalogos = ({ datos, tema, UI, MEITI }) => {
  const eco = MEITI.obtenerEcosistemaActual();
  const tabla = MEITI.obtenerTabla('ll_catalogos');
  
  const [catalogos, setCatalogos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [pestana, setPestana] = useState('nivel');
  
  const vacio = { id: '', clave: '', etiqueta: '' };
  const [form, setForm] = useState(vacio);

  const esAdmin = MEITI.miRolEnLaApp() === 'admin' || MEITI.soyDuenoDeLaApp();

  const cargar = async () => {
    setCargando(true);
    const res = await MEITI.fetchDatos(`/api/boveda/${tabla}?ecosistema=${eco}`);
    if (res.ok) {
      setCatalogos(res.registros || []);
    } else {
      setError(res.error || MEITI.t('err_load_catalogs', null, 'Error al cargar los catálogos.'));
    }
    setCargando(false);
  };

  useEffect(() => {
    if (esAdmin) cargar();
  }, [esAdmin]);

  if (!esAdmin) {
    return <UI.Aviso tono="peligro" mensaje={MEITI.t('admin_only', null, 'Esta sección es solo para administradores.')} />;
  }

  const guardar = async (e) => {
    e.preventDefault();
    setError(null);
    setExito(null);

    if (!form.clave.trim() || !form.etiqueta.trim()) {
      setError(MEITI.t('err_empty_fields', null, 'La clave y la etiqueta son obligatorias.'));
      return;
    }

    setGuardando(true);
    const esNuevo = !form.id;
    const payload = {
      id: esNuevo ? `cat_${Date.now()}` : form.id,
      tipo: pestana,
      clave: form.clave.trim(),
      etiqueta: form.etiqueta.trim()
    };

    await MEITI.mutar(`/api/boveda/${tabla}?ecosistema=${eco}`, {
      method: esNuevo ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, {
      alLograr: () => {
        setExito(MEITI.t('success_saved', null, 'Registro guardado correctamente.'));
        setForm(vacio);
        cargar();
        setGuardando(false);
      },
      alFallar: (err) => {
        setError(err || MEITI.t('err_save', null, 'Error al guardar el registro.'));
        setGuardando(false);
      }
    });
  };

  const borrar = async (id) => {
    if (!await MEITI.confirmar(MEITI.t('confirm_delete_cat', null, '¿Borrar este registro del catálogo?'), { titulo: MEITI.t('delete', null, 'Borrar'), confirmar: MEITI.t('yes_delete', null, 'Sí, borrar'), tono: 'peligro' })) return;
    
    setError(null);
    setExito(null);

    await MEITI.mutar(`/api/boveda/${tabla}?ecosistema=${eco}&id=${id}`, {
      method: 'DELETE'
    }, {
      alLograr: () => {
        setExito(MEITI.t('success_deleted', null, 'Registro eliminado.'));
        if (form.id === id) setForm(vacio);
        cargar();
      },
      alFallar: (err) => setError(err || MEITI.t('err_delete', null, 'Error al eliminar el registro.'))
    });
  };

  const editar = (fila) => {
    setForm({ id: fila.id, clave: fila.clave || '', etiqueta: fila.etiqueta || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cambiarPestana = (p) => {
    setPestana(p);
    setForm(vacio);
    setError(null);
    setExito(null);
  };

  const filtrados = catalogos.filter(c => c.tipo === pestana);

  const columnas = [
    { clave: 'clave', etiqueta: MEITI.t('col_key', null, 'Clave Interna') },
    { clave: 'etiqueta', etiqueta: MEITI.t('col_label', null, 'Etiqueta Visible') }
  ];

  const pestanasDef = [
    { id: 'nivel', titulo: MEITI.t('tab_levels', null, 'Niveles de Idioma'), icono: 'fa-layer-group' },
    { id: 'tipo_ejercicio', titulo: MEITI.t('tab_exercises', null, 'Tipos de Ejercicio'), icono: 'fa-dumbbell' }
  ];

  return (
    <div className="flex flex-col gap-6 pb-28">
      <UI.Pestanas pestanas={pestanasDef} activa={pestana} onCambio={cambiarPestana} />

      <Animacion.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} key={`form-${pestana}`}>
        <UI.Tarjeta>
          <div className="flex items-center gap-2 mb-4">
            <Iconos.Tags size={20} color={tema.colorPrimario} />
            <UI.Etiqueta>{form.id ? MEITI.t('edit_record', null, 'Editar Registro') : MEITI.t('new_record', null, 'Nuevo Registro')}</UI.Etiqueta>
          </div>
          
          <UI.Aviso mensaje={error} tono="peligro" onCerrar={() => setError(null)} />
          <UI.Aviso mensaje={exito} tono="exito" onCerrar={() => setExito(null)} />

          <form onSubmit={guardar} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex-1">
                <UI.Campo 
                  etiqueta={MEITI.t('f_key', null, 'Clave Interna (sin espacios)')} 
                  tipo="text" 
                  valor={form.clave} 
                  onChange={e => setForm({...form, clave: e.target.value})} 
                  placeholder={pestana === 'nivel' ? 'ej: a1, b2, c1' : 'ej: multiple_choice, fill_blanks'} 
                />
              </div>
              <div className="flex-1">
                <UI.Campo 
                  etiqueta={MEITI.t('f_label', null, 'Etiqueta Visible')} 
                  tipo="text" 
                  valor={form.etiqueta} 
                  onChange={e => setForm({...form, etiqueta: e.target.value})} 
                  placeholder={pestana === 'nivel' ? 'ej: Principiante (A1)' : 'ej: Opción Múltiple'} 
                />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <UI.Boton tipo="submit" variante="primario" disabled={guardando}>
                <span className="flex items-center gap-2">
                  <Iconos.Save size={16} /> 
                  {guardando ? MEITI.t('saving', null, 'Guardando...') : (form.id ? MEITI.t('btn_update', null, 'Actualizar') : MEITI.t('btn_create', null, 'Crear Registro'))}
                </span>
              </UI.Boton>
              {form.id && (
                <UI.Boton tipo="button" variante="secundario" onClick={() => setForm(vacio)}>
                  <span className="flex items-center gap-2"><Iconos.X size={16} /> {MEITI.t('btn_cancel', null, 'Cancelar')}</span>
                </UI.Boton>
              )}
            </div>
          </form>
        </UI.Tarjeta>
      </Animacion.motion.div>

      <Animacion.motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} key={`list-${pestana}`}>
        <UI.Tarjeta className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Iconos.List size={20} color={tema.colorSecundario} />
            <UI.Etiqueta>{MEITI.t('records_list', null, 'Registros Actuales')}</UI.Etiqueta>
          </div>
          
          {cargando ? (
            <div className="p-8 text-center">
              <Iconos.LoaderCircle className="animate-spin mx-auto mb-2" size={32} color={tema.colorSecundario} />
              <p style={{color: tema.texto}}>{MEITI.t('loading', null, 'Cargando...')}</p>
            </div>
          ) : filtrados.length === 0 ? (
            <UI.EstadoVacio icono="fa-tags" mensaje={MEITI.t('empty_catalog', null, 'No hay registros en esta categoría todavía.')} />
          ) : (
            <UI.TablaDatos 
              columnas={columnas} 
              datos={filtrados} 
              claveId="id" 
              onEditar={editar} 
              onBorrar={(fila) => borrar(fila.id)} 
            />
          )}
        </UI.Tarjeta>
      </Animacion.motion.div>
    </div>
  );
};

export default LinguaLearn_muukb9ph__LL_GestorCatalogos;
