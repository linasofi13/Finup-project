"use client";

import { useState } from "react";
import { FaFilter, FaDownload, FaTrash, FaPlus } from "react-icons/fa";

export default function AsignacionPresupuestalPage() {
  // Estado para las bolsas presupuestales
  const [bolsas, setBolsas] = useState([
    {
      id: 1,
      nombre: "Bolsa 1",
      detalle: "Descripción de la bolsa 1",
      valor: "$ 10.000",
      fechaCreacion: "16/11/2022",
    },
    {
      id: 2,
      nombre: "Bolsa 2",
      detalle: "Descripción de la bolsa 2",
      valor: "$ 10.000",
      fechaCreacion: "16/11/2022",
    },
    {
      id: 3,
      nombre: "Bolsa 3",
      detalle: "Descripción de la bolsa 3",
      valor: "$ 10.000",
      fechaCreacion: "16/11/2022",
    },
  ]);

  // Estado para controlar la creación de una nueva Bolsa (en el formulario de la izquierda)
  const [nuevaBolsa, setNuevaBolsa] = useState({
    anio: "",
    entorno: "",
    valorAcuerdo: "",
    evc: "",
  });
  const [mostrandoFormularioBolsa, setMostrandoFormularioBolsa] =
    useState(false);

  // Estado para la asignación parcial (formulario a la derecha)
  const [asignacionParcial, setAsignacionParcial] = useState({
    bolsa: "",
    fecha: "",
    valorAsignado: "",
    evcParcial: "",
    comentarios: "",
  });

  // Manejo de inputs de la Bolsa
  const manejarCambioBolsa = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setNuevaBolsa({ ...nuevaBolsa, [e.target.name]: e.target.value });
  };

  // Manejo de inputs de Asignación Parcial
  const manejarCambioAsignacion = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setAsignacionParcial({
      ...asignacionParcial,
      [e.target.name]: e.target.value,
    });
  };

  // Función para crear una nueva Bolsa
  const crearBolsa = () => {
    if (nuevaBolsa.anio && nuevaBolsa.entorno) {
      const nueva = {
        id: bolsas.length + 1,
        nombre: `Bolsa ${bolsas.length + 1}`,
        detalle: `Acuerdo EVC: ${nuevaBolsa.valorAcuerdo}`,
        valor: `$ ${Number.parseInt(nuevaBolsa.valorAcuerdo || "0").toLocaleString()}`, // <-- Asegúrate de usar comillas
        fechaCreacion: new Date().toLocaleDateString(),
      };

      setBolsas([...bolsas, nueva]);
      // Limpiar el formulario y ocultarlo
      setNuevaBolsa({ anio: "", entorno: "", valorAcuerdo: "", evc: "" });
      setMostrandoFormularioBolsa(false);
    }
  };

  // Función para asignar presupuesto parcial
  const asignarParcial = () => {
    // Aquí podrías implementar la lógica para asignar presupuesto
    alert(
      `Asignación parcial guardada. Comentarios: ${asignacionParcial.comentarios}`,
    );
    // Limpiar
    setAsignacionParcial({
      bolsa: "",
      fecha: "",
      valorAsignado: "",
      evcParcial: "",
      comentarios: "",
    });
  };

  return (
    <div className="p-6 mt-20 bg-white shadow-md rounded-lg flex flex-col space-y-6">
      {/* Encabezado y acciones */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Asignación Presupuestal</h1>
        <div className="flex space-x-2">
          <button className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
            <FaTrash className="mr-2" />
            Eliminar
          </button>
          <button className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
            <FaFilter className="mr-2" />
            Filtrar
          </button>
          <button className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
            <FaDownload className="mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Contenedor principal con dos secciones (Administración Bolsas / Asignación Parcial) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Administración Bolsas Presupuestales */}
        <div className="p-4 bg-gray-100 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">
              Administración Bolsas Presupuestales
            </h2>
            {/* Botón para mostrar formulario de crear Bolsa */}
            <button
              onClick={() =>
                setMostrandoFormularioBolsa(!mostrandoFormularioBolsa)
              }
              className="px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              + Crear Bolsa
            </button>
          </div>

          {/* Formulario condicional para crear Bolsa */}
          {mostrandoFormularioBolsa && (
            <div className="p-3 bg-white rounded-md shadow-md mb-4">
              <div className="flex flex-col space-y-2">
                <input
                  type="text"
                  name="anio"
                  placeholder="Año"
                  className="p-2 border rounded"
                  value={nuevaBolsa.anio}
                  onChange={manejarCambioBolsa}
                />
                <input
                  type="text"
                  name="entorno"
                  placeholder="Entorno"
                  className="p-2 border rounded"
                  value={nuevaBolsa.entorno}
                  onChange={manejarCambioBolsa}
                />
                <input
                  type="number"
                  name="valorAcuerdo"
                  placeholder="Valor año acordado EVC"
                  className="p-2 border rounded"
                  value={nuevaBolsa.valorAcuerdo}
                  onChange={manejarCambioBolsa}
                />
                <input
                  type="text"
                  name="evc"
                  placeholder="EVC"
                  className="p-2 border rounded"
                  value={nuevaBolsa.evc}
                  onChange={manejarCambioBolsa}
                />
              </div>
              <div className="flex justify-end mt-2">
                <button
                  onClick={crearBolsa}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                >
                  Crear
                </button>
              </div>
            </div>
          )}
          {/* Estados de las bolsas: Activo / Inactivo */}
          <div className="flex space-x-4">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
              Activo
            </span>
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
              Inactivo
            </span>
          </div>
        </div>

        {/* Asignación Presupuestal EVC parcial */}
        <div className="p-4 bg-gray-100 rounded-md">
          <h2 className="text-lg font-bold mb-4">
            Asignación Presupuestal EVC Parcial
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <select
              name="bolsa"
              className="p-2 border rounded"
              value={asignacionParcial.bolsa}
              onChange={manejarCambioAsignacion}
            >
              <option value="">Bolsa</option>
              {bolsas.map((b) => (
                <option key={b.id} value={b.nombre}>
                  {b.nombre}
                </option>
              ))}
            </select>
            <input
              type="date"
              name="fecha"
              className="p-2 border rounded"
              value={asignacionParcial.fecha}
              onChange={manejarCambioAsignacion}
            />
            <input
              type="number"
              name="valorAsignado"
              placeholder="Valor asignado"
              className="p-2 border rounded"
              value={asignacionParcial.valorAsignado}
              onChange={manejarCambioAsignacion}
            />
            <input
              type="text"
              name="evcParcial"
              placeholder="EVC"
              className="p-2 border rounded"
              value={asignacionParcial.evcParcial}
              onChange={manejarCambioAsignacion}
            />
          </div>
          <textarea
            name="comentarios"
            placeholder="Comentarios"
            className="w-full p-2 mt-2 border rounded"
            value={asignacionParcial.comentarios}
            onChange={manejarCambioAsignacion}
          ></textarea>
          <div className="flex justify-end mt-4">
            <button
              onClick={asignarParcial}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              + Asignar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Bolsas (parte inferior) */}
      <div className="mt-4 bg-white shadow-md rounded-md p-4 overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 text-left border">Bolsa</th>
              <th className="p-3 text-left border">Detalle</th>
              <th className="p-3 text-left border">Valor (USD)</th>
              <th className="p-3 text-left border">Fecha de Creación</th>
            </tr>
          </thead>
          <tbody>
            {bolsas.map((b) => (
              <tr key={b.id} className="border text-gray-700 hover:bg-gray-50">
                <td className="p-3 border">{b.nombre}</td>
                <td className="p-3 border">{b.detalle}</td>
                <td className="p-3 border">{b.valor}</td>
                <td className="p-3 border">{b.fechaCreacion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Historial de Movimientos (placeholder) */}
      <div className="mt-4 bg-gray-50 rounded-md p-4">
        <h2 className="text-lg font-bold">Historial de Movimientos</h2>
        <p className="text-gray-600 mt-2">Ver movimientos previos</p>
        {/* Aquí podrías renderizar otra tabla o registros de movimientos */}
      </div>
    </div>
  );
}
