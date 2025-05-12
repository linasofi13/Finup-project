"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaTrash,
  FaFilter,
  FaDownload,
  FaPlus,
  FaEye,
  FaTimes,
  FaExclamationTriangle,
  FaGlobe,
  FaLink,
  FaClock,
  FaHistory,
  FaCalendar,
  FaSearch,
} from "react-icons/fa";
import { RiTeamFill } from "react-icons/ri";
import * as XLSX from "xlsx";
import axios from "axios";
import {
  UserGroupIcon,
  CalendarIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

// Interfaces
interface Entorno {
  id: number;
  name: string;
  status: boolean;
}

interface TechnicalLeader {
  id: number;
  name: string;
}

interface Provider {
  id: number;
  name: string;
  company?: string;
  cost_usd?: number;
  country?: string;
}

interface EVC_Q {
  id: number;
  year: number;
  q: number;
  allocated_budget: number;
  allocated_percentage: number;
  evc_financials?: { id: number; provider: Provider }[];
  total_spendings?: number;
  percentage?: number;
  budget_message?: string;
}

interface EVC {
  id: number;
  name: string;
  description: string;
  status: boolean;
  creation_date: string;
  updated_at: string;
  entorno: Entorno | null;
  technical_leader: TechnicalLeader | null;
  functional_leader: { id: number; name: string } | null;
  evc_qs: EVC_Q[];
  entorno_id?: number;
  technical_leader_id?: number;
  functional_leader_id?: number;
}

interface ManualSpending {
  value_usd: number;
  concept: string;
}

const tableOptions = [
  { label: "Talentos", value: "provider" },
  { label: "Equipos de Evaluación (EVC)", value: "evc" },
  { label: "Entornos", value: "entorno" },
  { label: "Cuatrimestre de EVC", value: "evc_q" },
];

// Color palette for EVCs
const evcColors = [
  "#B3E5FC", // lighter blue
  "#FFE082", // slightly darker yellow
  "#FFD59E", // light pastel orange
];

function ProgressBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span>{label}:</span>
        <span className="font-bold">{value}%</span>
      </div>
      <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden relative">
        <div
          className={`h-3 rounded-full transition-all duration-500 absolute left-0 ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function EvcCard({
  evc,
  entornosData,
  onShowDetails,
  onManageQuarters,
  index,
  selected,
  onSelect,
  onStatusChange,
}: {
  evc: EVC;
  entornosData: { [key: number]: string };
  onShowDetails: (evc: EVC) => void;
  onManageQuarters: (evc: EVC) => void;
  index: number;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onStatusChange: (evc: EVC) => Promise<void>;
}) {
  // Assign color from palette
  const bgColor = evcColors[index % evcColors.length];
  // Status badge

  const status = evc.status ? "Activo" : "Inactivo";
  const statusColor = evc.status
    ? "bg-green-400 text-green-900"
    : "bg-red-500 text-white";

  // Progress bar calculations
  const totalAssigned = evc.evc_qs.reduce(
    (sum, q) => sum + (q.allocated_budget || 0),
    0,
  );
  const totalSpent = evc.evc_qs.reduce(
    (sum, q) => sum + (q.total_spendings || 0),
    0,
  );
  const totalAssignedPercentage = evc.evc_qs.reduce(
    (sum, q) => sum + (q.allocated_percentage || 0),
    0,
  );
  const totalSpentPercentage = evc.evc_qs.reduce(
    (sum, q) => sum + (q.percentage || 0),
    0,
  );

  const asignado = totalAssignedPercentage;
  const gastado = totalSpentPercentage;
  const progreso =
    evc.evc_qs.length > 0
      ? Math.round(
          evc.evc_qs.reduce((sum, q) => sum + (q.percentage || 0), 0) /
            evc.evc_qs.length,
        )
      : 0;

  const qActual =
    evc.evc_qs?.length > 0 ? evc.evc_qs[evc.evc_qs.length - 1].q : 1;

  return (
    <div
      className={`rounded-2xl shadow-lg p-6 w-full text-gray-900 relative flex flex-col min-h-[320px] group transition-all duration-200 ${selected ? "border-2 border-yellow-400 bg-yellow-50" : ""}`}
      style={{ background: !selected ? bgColor : undefined }}
    >
      {/* Selection checkbox */}
      <input
        type="checkbox"
        className="absolute top-3 right-3 h-4 w-4 accent-yellow-500 z-10 rounded shadow-sm bg-white border border-gray-300 transition-opacity duration-200 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        checked={selected}
        onChange={(e) => onSelect(e.target.checked)}
        title="Seleccionar EVC"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
      />

      {/* Checkmark overlay when selected */}
      {selected && (
        <span className="absolute top-2 right-2 z-20 bg-yellow-400 text-white rounded-full p-1 shadow pointer-events-none">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </span>
      )}

      {/* Status badge with toggle button */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={async (e) => {
            e.stopPropagation();
            await onStatusChange(evc);
          }}
          className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors duration-200 hover:opacity-80 ${statusColor}`}
        >
          {status}
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-white/30 rounded-full p-3">
          <span className="text-3xl text-gray-800">
            <RiTeamFill />
          </span>
        </div>
        <div>
          <div className="font-extrabold text-xl md:text-2xl text-gray-900">
            {evc.name}
          </div>
          <div className="text-base md:text-lg font-medium text-gray-800 opacity-90">
            {evc.description || "Proyecto"}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {evc.entorno_id && (
          <span className="flex items-center gap-1 bg-white/50 text-xs px-3 py-1 rounded-full text-gray-900 font-semibold">
            {entornosData[evc.entorno_id] || "Entorno"}
          </span>
        )}
        <span className="flex items-center gap-1 bg-white/30 text-xs px-3 py-1 rounded-full text-gray-800">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Creado: {new Date(evc.creation_date).toLocaleDateString()}
        </span>
      </div>

      {/* Details Row */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-xs text-gray-700 font-semibold">Q Actual:</div>
          <div className="font-extrabold text-xl md:text-2xl text-gray-900">
            {qActual}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-1 bg-white/30 hover:bg-white/50 text-xs px-4 py-2 rounded-lg transition font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
            onClick={() => onShowDetails(evc)}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 5-4.03 9-9 9s-9-4-9-9 4.03-9 9-9 9 4 9 9z"
              />
            </svg>
            Ver
          </button>
          <button
            className="flex items-center gap-1 bg-white/30 hover:bg-white/50 text-xs px-4 py-2 rounded-lg transition font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
            onClick={() => onManageQuarters(evc)}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Gestionar EVC
          </button>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-2 mt-auto">
        <ProgressBar label="Asignado" value={asignado} color="bg-green-400" />
        <ProgressBar label="Gastado" value={gastado} color="bg-orange-400" />
        <ProgressBar label="Progreso" value={progreso} color="bg-blue-400" />
      </div>
    </div>
  );
}

function QuarterCard({
  quarter,
  onUpdatePercentage,
}: {
  quarter: EVC_Q;
  onUpdatePercentage: (id: number, percentage: number) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(quarter.allocated_percentage);
  const [uploading, setUploading] = useState(false);
  const [manualSpendings, setManualSpendings] = useState<{
    [quarterId: number]: ManualSpending;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePercentageSave = async () => {
    if (editValue >= 0 && editValue <= 100) {
      await onUpdatePercentage(quarter.id, editValue);
      setIsEditing(false);
    }
  };

  const handleManualSpending = async () => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/evc-financials/evc_financials/concept`,
        {
          evc_q_id: quarter.id,
          value_usd: manualSpendings[quarter.id]?.value_usd,
          concept: manualSpendings[quarter.id]?.concept,
        },
      );
      setManualSpendings((prev) => ({
        ...prev,
        [quarter.id]: { value_usd: 0, concept: "" },
      }));
      // Refresh quarter data
      const response = await axios.get(
        `http://127.0.0.1:8000/evc_qs/${quarter.id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error adding manual spending:", error);
      throw error;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("evc_q_id", quarter.id.toString());

    setUploading(true);
    try {
      await axios.post(
        "http://127.0.0.1:8000/evc-financials/evc_financials/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      // Refresh quarter data
      const response = await axios.get(
        `http://127.0.0.1:8000/evc_qs/${quarter.id}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow flex flex-col">
      <div className="flex flex-wrap gap-4 mb-2">
        <div className="text-base font-semibold text-gray-700">
          Año: <span className="font-bold text-gray-900">{quarter.year}</span>
        </div>
        <div className="text-base font-semibold text-gray-700">
          Quarter: <span className="font-bold text-gray-900">Q{quarter.q}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Asignado</span>
          <span className="text-sm font-bold text-gray-900">
            {quarter.allocated_percentage}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative">
          <div
            className="h-2 bg-green-400 rounded-full absolute left-0 transition-all duration-500"
            style={{ width: `${Math.min(quarter.allocated_percentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Gastado</span>
          <span className="text-sm font-bold text-gray-900">
            {quarter.percentage || 0}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative">
          <div
            className="h-2 bg-orange-400 rounded-full absolute left-0 transition-all duration-500"
            style={{ width: `${Math.min(quarter.percentage || 0, 100)}%` }}
          />
        </div>
      </div>

      <div className="mb-2 text-sm text-gray-700">
        Presupuesto:{" "}
        <span className="font-bold text-gray-900">
          ${quarter.allocated_budget.toLocaleString()}
        </span>
      </div>

      <div className="mb-2 text-sm text-gray-700 flex items-center gap-2">
        Porcentaje asignado:
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={editValue}
              onChange={(e) => setEditValue(parseFloat(e.target.value))}
              className="w-20 px-2 py-1 border rounded text-gray-900 font-bold"
            />
            <button
              onClick={handlePercentageSave}
              className="p-1 text-green-600 hover:text-green-700"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditValue(quarter.allocated_percentage);
              }}
              className="p-1 text-red-600 hover:text-red-700"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">
              {quarter.allocated_percentage}%
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-600 hover:text-gray-700"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="mb-2 text-sm text-gray-700">
        Presupuesto gastado:{" "}
        <span className="font-bold text-gray-900">
          ${quarter.total_spendings?.toLocaleString() ?? 0}
        </span>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Estado:</div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold
          ${
            quarter.percentage && quarter.percentage >= 100
              ? "bg-red-100 text-red-800"
              : quarter.percentage && quarter.percentage >= 80
                ? "bg-orange-100 text-orange-800"
                : quarter.percentage && quarter.percentage >= 50
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
          }
        `}
        >
          {quarter.budget_message}
        </span>
      </div>

      {/* Manual Spending Form */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Agregar Gasto Manual
        </h4>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Valor USD"
            value={manualSpendings[quarter.id]?.value_usd || ""}
            onChange={(e) =>
              setManualSpendings((prev) => ({
                ...prev,
                [quarter.id]: {
                  ...prev[quarter.id],
                  value_usd: parseFloat(e.target.value),
                },
              }))
            }
            className="w-full px-3 py-2 border rounded text-sm"
          />
          <input
            type="text"
            placeholder="Concepto"
            value={manualSpendings[quarter.id]?.concept || ""}
            onChange={(e) =>
              setManualSpendings((prev) => ({
                ...prev,
                [quarter.id]: {
                  ...prev[quarter.id],
                  concept: e.target.value,
                },
              }))
            }
            className="w-full px-3 py-2 border rounded text-sm"
          />
          <button
            onClick={async () => {
              const value = manualSpendings[quarter.id]?.value_usd;
              const concept = manualSpendings[quarter.id]?.concept;
              if (!value || isNaN(value) || value <= 0) {
                setManualSpendingStatus(
                  (
                    prev: Record<number, { error?: string; success?: string }>,
                  ) => ({
                    ...prev,
                    [quarter.id]: {
                      error: "Ingrese un valor válido mayor a 0",
                    },
                  }),
                );
                return;
              }
              if (!concept || concept.trim() === "") {
                setManualSpendingStatus(
                  (
                    prev: Record<number, { error?: string; success?: string }>,
                  ) => ({
                    ...prev,
                    [quarter.id]: { error: "Ingrese un concepto" },
                  }),
                );
                return;
              }
              try {
                await axios.post(
                  `http://127.0.0.1:8000/evc-financials/evc_financials/concept`,
                  {
                    evc_q_id: quarter.id,
                    value_usd: value,
                    concept,
                  },
                );
                setManualSpendings((prev) => ({
                  ...prev,
                  [quarter.id]: { value_usd: 0, concept: "" },
                }));
                setManualSpendingStatus(
                  (
                    prev: Record<number, { error?: string; success?: string }>,
                  ) => ({
                    ...prev,
                    [quarter.id]: { success: "Gasto manual agregado" },
                  }),
                );
                setTimeout(
                  () =>
                    setManualSpendingStatus((prev) => ({
                      ...prev,
                      [quarter.id]: {},
                    })),
                  2000,
                );
              } catch (error) {
                setManualSpendingStatus(
                  (
                    prev: Record<number, { error?: string; success?: string }>,
                  ) => ({
                    ...prev,
                    [quarter.id]: { error: "Error al agregar gasto manual" },
                  }),
                );
              }
            }}
            className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
          >
            Agregar Gasto
          </button>
          {manualSpendingStatus[quarter.id]?.error && (
            <div className="text-red-500 text-xs mt-1">
              {manualSpendingStatus[quarter.id].error}
            </div>
          )}
          {manualSpendingStatus[quarter.id]?.success && (
            <div className="text-green-600 text-xs mt-1">
              {manualSpendingStatus[quarter.id].success}
            </div>
          )}
        </div>
      </div>

      {/* PDF Upload Drag-and-Drop */}
      <div className="mt-4">
        <div
          className={`w-full px-4 py-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${uploadStatus[quarter.id]?.uploading ? "bg-blue-50" : "hover:bg-blue-50"}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={async (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (!file) return;
            setUploadStatus((prev) => ({
              ...prev,
              [quarter.id]: { uploading: true },
            }));
            const formData = new FormData();
            formData.append("file", file);
            formData.append("evc_q_id", quarter.id.toString());
            try {
              await axios.post(
                "http://127.0.0.1:8000/evc-financials/evc_financials/upload",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } },
              );
              setUploadStatus((prev) => ({
                ...prev,
                [quarter.id]: {
                  uploading: false,
                  success: "Factura PDF subida",
                },
              }));
              setTimeout(
                () =>
                  setUploadStatus((prev) => ({ ...prev, [quarter.id]: {} })),
                2000,
              );
            } catch (error) {
              setUploadStatus((prev) => ({
                ...prev,
                [quarter.id]: {
                  uploading: false,
                  error: "Error al subir factura PDF",
                },
              }));
            }
          }}
        >
          {uploadStatus[quarter.id]?.uploading ? (
            <>
              <svg
                className="animate-spin h-6 w-6 text-blue-500 mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-blue-600">Subiendo...</span>
            </>
          ) : (
            <>
              <svg
                className="w-8 h-8 text-blue-500 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <span className="text-blue-700">
                Arrastra y suelta aquí tu factura PDF
              </span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadStatus((prev) => ({
                    ...prev,
                    [quarter.id]: { uploading: true },
                  }));
                  const formData = new FormData();
                  formData.append("file", file);
                  formData.append("evc_q_id", quarter.id.toString());
                  try {
                    await axios.post(
                      "http://127.0.0.1:8000/evc-financials/evc_financials/upload",
                      formData,
                      { headers: { "Content-Type": "multipart/form-data" } },
                    );
                    setUploadStatus((prev) => ({
                      ...prev,
                      [quarter.id]: {
                        uploading: false,
                        success: "Factura PDF subida",
                      },
                    }));
                    setTimeout(
                      () =>
                        setUploadStatus((prev) => ({
                          ...prev,
                          [quarter.id]: {},
                        })),
                      2000,
                    );
                  } catch (error) {
                    setUploadStatus((prev) => ({
                      ...prev,
                      [quarter.id]: {
                        uploading: false,
                        error: "Error al subir factura PDF",
                      },
                    }));
                  }
                }}
              />
            </>
          )}
          {uploadStatus[quarter.id]?.error && (
            <div className="text-red-500 text-xs mt-1">
              {uploadStatus[quarter.id].error}
            </div>
          )}
          {uploadStatus[quarter.id]?.success && (
            <div className="text-green-600 text-xs mt-1">
              {uploadStatus[quarter.id].success}
            </div>
          )}
        </div>
      </div>

      {/* Add Talento (Provider) */}
      <div className="mt-4">
        <div className="flex gap-2 items-center mb-2">
          <label className="block text-sm font-medium">Agregar Talento</label>
          <button
            className="ml-auto px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
            onClick={() =>
              setProviderFilterModal({ quarterId: quarter.id, open: true })
            }
            type="button"
          >
            Filtrar Talentos
          </button>
        </div>
        <select
          className="p-2 border rounded w-full"
          value={providerSelections[quarter.id] || ""}
          onChange={(e) =>
            setProviderSelections((prev) => ({
              ...prev,
              [quarter.id]: e.target.value,
            }))
          }
        >
          <option value="">-- Seleccionar Talento --</option>
          {getFilteredProviders(quarter.id).map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
        <button
          className="mt-3 px-4 py-2 bg-green-200 text-green-800 rounded hover:bg-green-300 text-sm transition-colors duration-150"
          onClick={async () => {
            const providerId = providerSelections[quarter.id];
            if (!providerId) return;
            try {
              await axios.post(
                "http://127.0.0.1:8000/evc-financials/evc_financials/",
                { evc_q_id: quarter.id, provider_id: parseInt(providerId, 10) },
              );
              setProviderSelections((prev) => ({ ...prev, [quarter.id]: "" }));
              // Optionally refresh data here
            } catch (error) {
              alert("Error al agregar talento");
            }
          }}
        >
          Agregar
        </button>
      </div>
    </div>
  );
}

export default function EvcsPage() {
  // Estados principales
  const [evcs, setEvcs] = useState<EVC[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [selectedEvc, setSelectedEvc] = useState<EVC | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [entornosData, setEntornosData] = useState<{ [key: number]: string }>(
    {},
  );
  const [technicalLeadersData, setTechnicalLeadersData] = useState<{
    [key: number]: string;
  }>({});
  const [functionalLeadersData, setFunctionalLeadersData] = useState<{
    [key: number]: string;
  }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [evcToDelete, setEvcToDelete] = useState<EVC | null>(null);
  const [showQuartersModal, setShowQuartersModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    entorno_id: "",
  });
  const [filteredEvcs, setFilteredEvcs] = useState<EVC[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedEvcsForExport, setSelectedEvcsForExport] = useState<number[]>(
    [],
  );
  const [financialSelections, setFinancialSelections] = useState<{
    [key: number]: string;
  }>({});
  const [availableTechnicalLeaders, setAvailableTechnicalLeaders] = useState<
    TechnicalLeader[]
  >([]);
  const [availableFunctionalLeaders, setAvailableFunctionalLeaders] = useState<
    { id: number; name: string }[]
  >([]);
  const [availableEntornos, setAvailableEntornos] = useState<Entorno[]>([]);
  const [availableProviders, setAvailableProviders] = useState<Provider[]>([]);

  // Add new state variables for OCR
  const [uploading, setUploading] = useState(false);
  const [extractedValues, setExtractedValues] = useState<{
    [key: number]: number;
  }>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: number]: string }>(
    {},
  );
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Colores para entornos
  const entornoColors: { [key: number]: string } = {
    1: "bg-[#faa0c5]", // Rosa claro
    2: "bg-[#00c389]", // Verde
    3: "bg-[#fdda24]", // Amarillo
    4: "bg-[#ff7f41]", // Naranja
    5: "bg-[#59CBE8]", // Azul claro
  };

  // Update color map types
  const colorMap: { [key: number]: string } = {
    1: "bg-[#e497b1]",
    2: "bg-[#00a974]",
    3: "bg-[#e3c31f]",
    4: "bg-[#e66a2d]",
    5: "bg-[#41b3d3]",
  };

  // Obtener el color del entorno
  const getEntornoColor = (entorno_id: number | null | undefined) => {
    return entorno_id
      ? entornoColors[entorno_id] || "bg-[#59CBE8]"
      : "bg-[#59CBE8]";
  };

  // Obtener color de acento
  const getContainerColor = (entorno_id: number | null | undefined) => {
    return entorno_id
      ? colorMap[entorno_id] || "bg-[#59CBE8]/50"
      : "bg-[#59CBE8]/50";
  };

  // Modelo EVC
  const [newEvc, setNewEvc] = useState({
    name: "",
    description: "",
    technical_leader_id: "",
    functional_leader_id: "",
    entorno_id: "",
    status: true,
  });

  // Modelo EVC_Q
  const [newQuarter, setNewQuarter] = useState({
    year: "",
    q: "",
    allocated_budget: "",
    allocated_percentage: "",
  });

  // Add state for selected EVCs for deletion
  const [selectedEvcsForDelete, setSelectedEvcsForDelete] = useState<number[]>(
    [],
  );
  const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Add new state variable for manual spending
  const [manualSpendings, setManualSpendings] = useState<{
    [quarterId: number]: ManualSpending;
  }>({});

  // ... at the top, add state for feedback per quarter ...
  const [manualSpendingStatus, setManualSpendingStatus] = useState<
    Record<number, { error?: string; success?: string }>
  >({});
  const [uploadStatus, setUploadStatus] = useState<{
    [quarterId: number]: {
      uploading: boolean;
      error?: string;
      success?: string;
    };
  }>({});
  const [providerSelections, setProviderSelections] = useState<{
    [quarterId: number]: string;
  }>({});

  // Add after other useState hooks in EvcsPage
  const [providerFilterModal, setProviderFilterModal] = useState<{
    quarterId: number | null;
    open: boolean;
  }>({ quarterId: null, open: false });
  const [activeProviderFilters, setActiveProviderFilters] = useState<{
    price: boolean;
    country: boolean;
  }>({ price: false, country: false });
  const [providerPriceRange, setProviderPriceRange] = useState<
    [number, number]
  >([0, 10000]);
  const [providerSelectedCountries, setProviderSelectedCountries] = useState<
    string[]
  >([]);
  const [providerCountryOptions, setProviderCountryOptions] = useState<
    string[]
  >([]);

  // Compute min/max price for slider
  const providerPrices = availableProviders
    .map((p) => p.cost_usd ?? 0)
    .filter((v) => !isNaN(v));
  const minProviderPrice = providerPrices.length
    ? Math.min(...providerPrices)
    : 0;
  const maxProviderPrice = providerPrices.length
    ? Math.max(...providerPrices)
    : 10000;

  // Get all unique countries
  useEffect(() => {
    const countries = Array.from(
      new Set(availableProviders.map((p) => p.country).filter(Boolean)),
    ) as string[];
    setProviderCountryOptions(countries);
  }, [availableProviders]);

  // Filter providers for a given quarter
  const getFilteredProviders = (quarterId: number) => {
    let filtered = [...availableProviders];
    if (activeProviderFilters.price) {
      filtered = filtered.filter((p) => {
        const price = p.cost_usd ?? 0;
        return price >= providerPriceRange[0] && price <= providerPriceRange[1];
      });
    }
    if (activeProviderFilters.country && providerSelectedCountries.length > 0) {
      filtered = filtered.filter((p) =>
        providerSelectedCountries.includes(p.country ?? ""),
      );
    }
    return filtered;
  };

  // Efectos iniciales
  useEffect(() => {
    fetchEvcs();
    fetchAvailableTechnicalLeaders();
    fetchAvailableFunctionalLeaders();
    fetchAvailableEntornos();
    fetchAvailableProviders();
    loadEntornosData();
    loadTechnicalLeadersData();
    loadFunctionalLeadersData();
  }, []);

  // Cargar data de líderes
  const loadTechnicalLeadersData = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/technical-leaders/technical-leaders/",
      );
      const data: { [key: number]: string } = {};
      response.data.forEach((leader: TechnicalLeader) => {
        data[leader.id] = leader.name;
      });
      setTechnicalLeadersData(data);
    } catch (error) {
      console.error("Error cargando líderes técnicos:", error);
    }
  };

  const loadFunctionalLeadersData = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/functional-leaders/functional-leaders",
      );
      const data: { [key: number]: string } = {};
      response.data.forEach((leader: any) => {
        data[leader.id] = leader.name;
      });
      setFunctionalLeadersData(data);
    } catch (error) {
      console.error("Error cargando líderes funcionales:", error);
    }
  };

  // Cargar data de entornos
  const loadEntornosData = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/entornos/entornos/",
      );
      const data: { [key: number]: string } = {};
      response.data.forEach((entorno: Entorno) => {
        data[entorno.id] = entorno.name;
      });
      setEntornosData(data);
      console.log("Entornos cargados:", data);
    } catch (error) {
      console.error("Error cargando entornos:", error);
    }
  };

  // Handlers EVC
  const handleEvcChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewEvc((prev) => ({
      ...prev,
      [name]: name === "status" ? value === "true" : value,
    }));
  };

  // Handlers EVC_Q
  const handleQuarterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setNewQuarter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handlers EVC_Financial
  const handleFinancialChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    evc_q_id: number,
  ) => {
    const { value } = e.target;
    setFinancialSelections((prev) => ({
      ...prev,
      [evc_q_id]: value,
    }));
  };

  // Fetch data del backend
  const fetchEvcs = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/evcs/evcs/");
      console.log("EVCs recibidos:", response.data);
      console.log("Primer EVC:", response.data[0]);
      setEvcs(response.data);
    } catch (error) {
      console.error("Error al cargar EVCs:", error);
    }
  };

  const fetchAvailableTechnicalLeaders = async () => {
    try {
      const resp = await axios.get(
        "http://127.0.0.1:8000/technical-leaders/technical-leaders/",
      );
      setAvailableTechnicalLeaders(resp.data);
    } catch (error) {
      console.error("Error al cargar líderes técnicos:", error);
    }
  };

  const fetchAvailableFunctionalLeaders = async () => {
    try {
      const resp = await axios.get(
        "http://127.0.0.1:8000/functional-leaders/functional-leaders",
      );
      setAvailableFunctionalLeaders(resp.data);
    } catch (error) {
      console.error("Error al cargar líderes funcionales:", error);
    }
  };

  const fetchAvailableEntornos = async () => {
    try {
      const resp = await axios.get("http://127.0.0.1:8000/entornos/entornos/");
      setAvailableEntornos(resp.data);
    } catch (error) {
      console.error("Error al cargar entornos:", error);
    }
  };

  const fetchAvailableProviders = async () => {
    try {
      const resp = await axios.get(
        "http://127.0.0.1:8000/providers/providers/",
      );
      setAvailableProviders(resp.data);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
    }
  };

  const fetchProvidersByEvcQ = async (evc_q_id: number) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/evc-financials/evc-financials/${evc_q_id}/providers`,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return []; // No providers found
      }
      console.error(`Error fetching providers for EVC_Q ${evc_q_id}:`, error);
      return [];
    }
  };

  const fetchSpendingsByEvcQ = async (evc_q_id: number) => {
    try {
      console.log(`Fetching spendings for EVC_Q ID: ${evc_q_id}`);
      const response = await axios.get(
        `http://127.0.0.1:8000/evc-financials/evc_financials/${evc_q_id}/spendings`,
      );

      console.log(`Spendings for EVC_Q ${evc_q_id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching spendings for EVC_Q ${evc_q_id}:`, error);
      return {
        evc_q_id,
        total_spendings: 0,
        percentage: 0,
        message: "Error fetching spendings",
      };
    }
  };

  // Crear EVC
  const createEvc = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/evcs/evcs/", {
        name: newEvc.name,
        description: newEvc.description,
        technical_leader_id: parseInt(newEvc.technical_leader_id, 10) || null,
        functional_leader_id: parseInt(newEvc.functional_leader_id, 10) || null,
        entorno_id: parseInt(newEvc.entorno_id, 10) || null,
        status: newEvc.status,
      });
      console.log("EVC creada:", response.data);
      fetchEvcs();
      setShowForm(false);
      setAlertMsg("");
      setNewEvc({
        name: "",
        description: "",
        technical_leader_id: "",
        functional_leader_id: "",
        entorno_id: "",
        status: true,
      });
    } catch (error) {
      console.error("Error creando EVC:", error);
      setAlertMsg("Error al crear la EVC");
    }
  };

  // Crear EVC_Q
  const createQuarter = async (evcId: number) => {
    try {
      // Validate inputs
      const year = parseInt(newQuarter.year, 10);
      const q = parseInt(newQuarter.q, 10);
      const allocated_budget = parseFloat(newQuarter.allocated_budget);
      const allocated_percentage = parseFloat(newQuarter.allocated_percentage);

      // Check for invalid values
      if (
        isNaN(year) ||
        isNaN(q) ||
        isNaN(allocated_budget) ||
        isNaN(allocated_percentage)
      ) {
        setAlertMsg("Por favor complete todos los campos con valores válidos");
        return;
      }

      // Validate quarter number
      if (q < 1 || q > 4) {
        setAlertMsg("El quarter debe ser un número entre 1 y 4");
        return;
      }

      // Validate year
      const currentYear = new Date().getFullYear();
      if (year < currentYear - 1 || year > currentYear + 1) {
        setAlertMsg(
          `El año debe estar entre ${currentYear - 1} y ${currentYear + 1}`,
        );
        return;
      }

      // Validate budget and percentage
      if (allocated_budget <= 0) {
        setAlertMsg("El presupuesto debe ser mayor a 0");
        return;
      }

      if (allocated_percentage < 0 || allocated_percentage > 100) {
        setAlertMsg("El porcentaje debe estar entre 0 y 100");
        return;
      }

      const response = await axios.post(
        "http://127.0.0.1:8000/evc-qs/evc_qs/",
        {
          evc_id: evcId,
          year,
          q,
          allocated_budget,
          allocated_percentage,
        },
      );

      console.log("Quarter creado:", response.data);

      // Fetch the updated EVC with the new quarter
      const updatedEvc = await axios.get(
        `http://127.0.0.1:8000/evcs/evcs/${evcId}`,
      );

      // Update the selected EVC state
      setSelectedEvc(updatedEvc.data);

      // Update the evcs list to reflect the new quarter

      setEvcs((prevEvcs) =>
        prevEvcs.map((evc) => (evc.id === evcId ? updatedEvc.data : evc)),
      );

      // Reset the form
      setNewQuarter({
        year: "",
        q: "",
        allocated_budget: "",
        allocated_percentage: "",
      });
      setAlertMsg("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMsg =
          error.response?.data?.detail || "Error al crear el quarter";
        setAlertMsg(errorMsg);
        console.error("Error creando quarter:", error.response?.data);
      } else if (error instanceof Error) {
        console.error("Error creando quarter:", error.message);
        setAlertMsg(error.message);
      } else {
        console.error("Error creando quarter:", error);
        setAlertMsg("Error al crear el quarter");
      }
    }
  };

  // Crear EVC_Financial
  const createFinancial = async (evcId: number, evc_q_id: number) => {
    const provider_id = financialSelections[evc_q_id];
    if (!provider_id) {
      setAlertMsg("Seleccione un proveedor");
      return;
    }
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/evc-financials/evc_financials/",
        {
          evc_q_id: evc_q_id,
          provider_id: parseInt(provider_id, 10) || null,
        },
      );
      console.log("Financial creado:", response.data);
      const updatedEvc = await axios.get(
        `http://127.0.0.1:8000/evcs/evcs/${evcId}`,
      );
      setSelectedEvc(updatedEvc.data);
      setFinancialSelections((prev) => ({
        ...prev,
        [evc_q_id]: "", // Resetear selección para este quarter
      }));
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creando financial:", error.message);
        setAlertMsg(error.message);
      } else if (axios.isAxiosError(error)) {
        const errorMsg =
          error.response?.data?.detail || "Error al asignar el proveedor";
        setAlertMsg(errorMsg);
      } else {
        console.error("Error creando financial:", String(error));
        setAlertMsg("Error al asignar el proveedor");
      }
    }
  };

  // Eliminar EVC
  const deleteEvc = async (evcId: number) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/evcs/evcs/${evcId}`);
      setEvcs((prev) => prev.filter((e) => e.id !== evcId));
      setShowDeleteModal(false);
      setEvcToDelete(null);
      setShowDetailModal(false);
    } catch (error) {
      console.error("Error eliminando EVC:", error);
      setAlertMsg("Error al eliminar la EVC");
    }
  };

  const handleDeleteClick = (evc: EVC) => {
    setEvcToDelete(evc);
    setShowDeleteModal(true);
  };

  // Mostrar vista detallada
  const showEvcDetails = async (evc: EVC) => {
    try {
      // Fetch Spendings with message for each EVC_Q
      const evcQsWithSpendings = await Promise.all(
        evc.evc_qs.map(async (quarter) => {
          const { total_spendings, percentage, message } =
            await fetchSpendingsByEvcQ(quarter.id);
          return {
            ...quarter,
            total_spendings,
            percentage,
            budget_message: message,
          };
        }),
      );

      // Fetch providers for each EVC_Q
      const evcQsWithProviders = await Promise.all(
        evcQsWithSpendings.map(async (quarter) => {
          const providers = await fetchProvidersByEvcQ(quarter.id);
          return {
            ...quarter,
            evc_financials: providers.map((provider: Provider) => ({
              id: provider.id,
              provider,
            })),
          };
        }),
      );

      // Update the selected EVC with enriched evc_qs
      setSelectedEvc({
        ...evc,
        evc_qs: evcQsWithProviders,
      });
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching providers for EVC details:", error);
      setSelectedEvc(evc); // Fallback to original EVC
      setShowDetailModal(true);
    }
  };

  // Obtener todos los proveedores asignados al EVC
  const getEvcProviders = () => {
    if (!selectedEvc?.evc_qs) return [];
    const providers = new Map();
    selectedEvc.evc_qs.forEach((quarter) => {
      if (quarter.evc_financials) {
        quarter.evc_financials.forEach((financial) => {
          if (financial.provider) {
            providers.set(financial.provider.id, financial.provider);
          }
        });
      }
    });
    return Array.from(providers.values());
  };

  // Funciones para manejar filtrado
  const applyFilters = () => {
    let result = [...evcs];

    if (filters.entorno_id !== "") {
      const entornoIdNumber = parseInt(filters.entorno_id);
      result = result.filter((evc) => {
        console.log("Comparing:", {
          evc_entorno: evc.entorno_id,
          filter_entorno: entornoIdNumber,
          equals: evc.entorno_id === entornoIdNumber,
        });
        return evc.entorno_id === entornoIdNumber;
      });
    }
    console.log("Filtered results:", result);
    setFilteredEvcs(result);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilters({
      entorno_id: "",
    });
    setFilteredEvcs([]);
    setShowFilterModal(false);
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    const selectedEvcsData = evcs.filter((evc) =>
      selectedEvcsForExport.includes(evc.id),
    );

    // Crear hoja principal de EVCs
    const evcsData = selectedEvcsData.map((evc) => ({
      Nombre: evc.name,
      Descripción: evc.description,
      Estado: evc.status ? "Activo" : "Inactivo",
      Entorno: evc.entorno_id ? entornosData[evc.entorno_id] : "",
      "Líder Técnico": evc.technical_leader_id
        ? technicalLeadersData[evc.technical_leader_id]
        : "",
      "Líder Funcional": evc.functional_leader_id
        ? functionalLeadersData[evc.functional_leader_id]
        : "",
      "Quarters Asignados": evc.evc_qs ? evc.evc_qs.length : 0,
      "Fecha Creación": new Date(evc.creation_date).toLocaleDateString(),
      "Última Actualización": new Date(evc.updated_at).toLocaleDateString(),
    }));

    // Crear hoja de quarters
    const quartersData = selectedEvcsData.flatMap((evc) =>
      evc.evc_qs.map((quarter) => ({
        EVC: evc.name,
        Año: quarter.year,
        Quarter: `Q${quarter.q}`,
        Presupuesto: quarter.allocated_budget,
        Porcentaje: quarter.allocated_percentage,
        Talentos:
          quarter.evc_financials?.map((f) => f.provider.name).join(", ") || "",
      })),
    );

    const wb = XLSX.utils.book_new();

    // Agregar hoja de EVCs
    const wsEvcs = XLSX.utils.json_to_sheet(evcsData);
    XLSX.utils.book_append_sheet(wb, wsEvcs, "EVCs");

    // Agregar hoja de Quarters
    const wsQuarters = XLSX.utils.json_to_sheet(quartersData);
    XLSX.utils.book_append_sheet(wb, wsQuarters, "Quarters");

    XLSX.writeFile(wb, "evcs_con_quarters.xlsx");
    setShowExportModal(false);
    setSelectedEvcsForExport([]);
  };

  // Add OCR functionality
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    evc_q_id: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("evc_q_id", evc_q_id.toString());

    setUploading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/evc-financials/evc_financials/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setUploadedFiles((prev) => ({
        ...prev,
        [evc_q_id]: file.name,
      }));

      setExtractedValues((prev) => ({
        ...prev,
        [evc_q_id]: response.data.value_usd,
      }));

      console.log("Archivo procesado:", response.data);

      // Actualizar EVC seleccionado
      if (selectedEvc) {
        const updatedEvc = await axios.get(
          `http://127.0.0.1:8000/evcs/evcs/${selectedEvc.id}`,
        );
        setSelectedEvc(updatedEvc.data);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error al subir archivo:", err.message);
      } else {
        console.error("Error al subir archivo:", String(err));
      }
      setAlertMsg("Error al procesar la factura");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileUpload = (quarterId: number) => {
    fileInputRefs.current[quarterId]?.click();
  };

  const [gastosModal, setGastosModal] = useState<{
    open: boolean;
    quarter: EVC_Q | null;
    gastos: any[];
  }>({ open: false, quarter: null, gastos: [] });

  // Function to fetch all gastos for a quarter
  const fetchGastosByQuarter = async (quarter: EVC_Q) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/evc-financials/evc_financials/`,
      );
      // Filter by quarter id
      const gastos = res.data.filter((g: any) => g.evc_q_id === quarter.id);
      setGastosModal({ open: true, quarter, gastos });
    } catch (err) {
      setGastosModal({ open: true, quarter, gastos: [] });
    }
  };

  // Add status update function
  const handleStatusChange = async (evc: EVC) => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/evcs/evcs/${evc.id}`,
        {
          status: !evc.status,
        },
      );

      // Update the EVCs list with the new status
      setEvcs((prevEvcs) =>
        prevEvcs.map((e) =>
          e.id === evc.id ? { ...e, status: !e.status } : e,
        ),
      );

      // If this EVC is currently selected, update its status in selectedEvc
      if (selectedEvc?.id === evc.id) {
        setSelectedEvc((prev) =>
          prev ? { ...prev, status: !prev.status } : null,
        );
      }
    } catch (error) {
      console.error("Error updating EVC status:", error);
      setAlertMsg("Error al actualizar el estado del EVC");
    }
  };

  // Render
  return (
    <div className="p-6 mt-20 bg-white shadow-md rounded-lg flex flex-col">
      {/* Panel de acciones */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">EVCs</h1>
        <div className="flex space-x-2">
          <label className="flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="mr-2 accent-yellow-500"
              checked={
                selectedEvcsForDelete.length ===
                  (filteredEvcs.length > 0
                    ? filteredEvcs.length
                    : evcs.length) &&
                (filteredEvcs.length > 0 ? filteredEvcs.length : evcs.length) >
                  0
              }
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedEvcsForDelete(
                    (filteredEvcs.length > 0 ? filteredEvcs : evcs).map(
                      (evc) => evc.id,
                    ),
                  );
                } else {
                  setSelectedEvcsForDelete([]);
                }
              }}
            />
            Seleccionar todos
          </label>
          <button
            className={`flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 ${selectedEvcsForDelete.length === 0 || deleting ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={selectedEvcsForDelete.length === 0 || deleting}
            onClick={() => setShowDeleteSelectedModal(true)}
          >
            <FaTrash className="mr-2" /> Eliminar
          </button>
          <button
            className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            onClick={() => setShowFilterModal(true)}
          >
            <FaFilter className="mr-2" />
            {filteredEvcs.length > 0
              ? `Filtrado (${filteredEvcs.length})`
              : "Filtrar"}
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            <FaDownload className="mr-2" /> Exportar
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            <FaPlus className="mr-2" /> Crear EVC
          </button>
        </div>
      </div>

      {/* Formulario para crear EVC */}
      {showForm && (
        <div className="p-6 bg-gray-100 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Crear EVC</h2>
            <FaTimes
              className="text-red-500 cursor-pointer"
              onClick={() => setShowForm(false)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Nombre de la EVC"
              className="p-2 border rounded"
              value={newEvc.name}
              onChange={handleEvcChange}
            />
            <input
              type="text"
              name="description"
              placeholder="Descripción"
              className="p-2 border rounded"
              value={newEvc.description}
              onChange={handleEvcChange}
            />
            <div>
              <label className="block font-semibold">Líder Técnico</label>
              <select
                name="technical_leader_id"
                className="p-2 border rounded w-full"
                value={newEvc.technical_leader_id}
                onChange={handleEvcChange}
              >
                <option value="">-- Seleccionar --</option>
                {availableTechnicalLeaders.map((leader) => (
                  <option key={leader.id} value={leader.id}>
                    {leader.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold">Líder Funcional</label>
              <select
                name="functional_leader_id"
                className="p-2 border rounded w-full"
                value={newEvc.functional_leader_id}
                onChange={handleEvcChange}
              >
                <option value="">-- Seleccionar --</option>
                {availableFunctionalLeaders.map((leader) => (
                  <option key={leader.id} value={leader.id}>
                    {leader.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold">Entorno</label>
              <select
                name="entorno_id"
                className="p-2 border rounded w-full"
                value={newEvc.entorno_id}
                onChange={handleEvcChange}
              >
                <option value="">-- Seleccionar --</option>
                {availableEntornos.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold">Estado</label>
              <select
                name="status"
                className="p-2 border rounded w-full"
                value={newEvc.status.toString()}
                onChange={handleEvcChange}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
          {alertMsg && (
            <div className="mt-2 bg-yellow-100 text-yellow-800 p-2 rounded-md flex items-center">
              <FaExclamationTriangle className="mr-2" />
              {alertMsg}
            </div>
          )}
          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              onClick={createEvc}
            >
              Crear EVC
            </button>
          </div>
        </div>
      )}

      {/* Modal de selección para exportación */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Seleccionar EVCs para exportar
              </h2>
              <FaTimes
                className="text-red-500 cursor-pointer"
                onClick={() => setShowExportModal(false)}
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedEvcsForExport.length === evcs.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedEvcsForExport(evcs.map((evc) => evc.id));
                    } else {
                      setSelectedEvcsForExport([]);
                    }
                  }}
                />
                Seleccionar todas
              </label>
            </div>

            <div className="space-y-2 mb-6">
              {evcs.map((evc) => (
                <label
                  key={evc.id}
                  className="flex items-center p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={selectedEvcsForExport.includes(evc.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEvcsForExport([
                          ...selectedEvcsForExport,
                          evc.id,
                        ]);
                      } else {
                        setSelectedEvcsForExport(
                          selectedEvcsForExport.filter((id) => id !== evc.id),
                        );
                      }
                    }}
                  />
                  <span>{evc.name}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({evc.evc_qs?.length || 0} quarters)
                  </span>
                </label>
              ))}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                onClick={() => setShowExportModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                onClick={exportToExcel}
                disabled={selectedEvcsForExport.length === 0}
              >
                Exportar Seleccionadas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de filtrado */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Filtrar EVCs</h2>

            <div className="mb-4">
              <label className="block font-semibold mb-2">Entorno</label>
              <select
                className="p-2 border rounded w-full"
                value={filters.entorno_id}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    entorno_id: e.target.value,
                  }))
                }
              >
                <option value="">Todos los entornos</option>
                {availableEntornos.map((entorno) => (
                  <option key={entorno.id} value={entorno.id}>
                    {entorno.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                onClick={clearFilters}
              >
                Limpiar filtros
              </button>
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                onClick={applyFilters}
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para gestión de quarters */}
      {showQuartersModal && selectedEvc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Modern light overlay with blur */}
          <div className="fixed inset-0 bg-white/70 backdrop-blur-sm transition-all" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Sticky close button */}
            <button
              className="absolute top-4 right-4 z-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-2 shadow focus:outline-none focus:ring-2 focus:ring-red-400"
              onClick={() => setShowQuartersModal(false)}
              aria-label="Cerrar"
            >
              <FaTimes className="h-5 w-5" />
            </button>
            <div className="mb-6 pr-10">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
                Gestión de Quarters -{" "}
                <span className="font-bold text-blue-700">
                  {selectedEvc.name}
                </span>
              </h2>
            </div>
            {/* Stack all info and quarters vertically */}
            <div className="flex flex-col gap-8">
              {/* EVC Info in boxes */}
              <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
                <div className="rounded-xl bg-gray-50 p-4 shadow-sm flex-1 min-w-[220px]">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Descripción
                  </div>
                  <div className="text-base font-bold text-gray-900">
                    {selectedEvc.description}
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 shadow-sm flex-1 min-w-[220px]">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Entorno
                  </div>
                  <div className="text-base font-bold text-gray-900">
                    {selectedEvc.entorno_id
                      ? entornosData[selectedEvc.entorno_id] || "Cargando..."
                      : "-"}
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 shadow-sm flex-1 min-w-[220px]">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Líder Técnico
                  </div>
                  <div className="text-base font-bold text-gray-900">
                    {selectedEvc.technical_leader_id
                      ? technicalLeadersData[selectedEvc.technical_leader_id] ||
                        "Cargando..."
                      : "-"}
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 shadow-sm flex-1 min-w-[220px]">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Líder Funcional
                  </div>
                  <div className="text-base font-bold text-gray-900">
                    {selectedEvc.functional_leader_id
                      ? functionalLeadersData[
                          selectedEvc.functional_leader_id
                        ] || "Cargando..."
                      : "-"}
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 shadow-sm flex-1 min-w-[220px]">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Estado
                  </div>
                  <div
                    className={`text-base font-bold ${selectedEvc.status ? "text-green-700" : "text-red-700"}`}
                  >
                    {selectedEvc.status ? "Activo" : "Inactivo"}
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 shadow-sm flex-1 min-w-[220px]">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Creado
                  </div>
                  <div className="text-base font-bold text-gray-900">
                    {new Date(selectedEvc.creation_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 shadow-sm flex-1 min-w-[220px]">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Actualizado
                  </div>
                  <div className="text-base font-bold text-gray-900">
                    {new Date(selectedEvc.updated_at).toLocaleDateString()}
                  </div>
                </div>
                {/* Quarters Asignados section moved here */}
                <div className="rounded-xl bg-gray-50 p-4 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Quarters Asignados
                  </div>
                  {selectedEvc.evc_qs && selectedEvc.evc_qs.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedEvc.evc_qs.map((quarter) => (
                        <li
                          key={quarter.id}
                          className="flex items-center gap-2"
                        >
                          <span className="font-semibold">Año:</span>{" "}
                          {quarter.year}{" "}
                          <span className="font-semibold">Q:</span> {quarter.q}
                          <button
                            className="ml-2 p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                            title="Ver gastos asociados"
                            onClick={() => fetchGastosByQuarter(quarter)}
                          >
                            <FaSearch className="text-gray-700 w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-gray-400">
                      No hay quarters asignados.
                    </div>
                  )}
                </div>
              </div>
              {/* Quarters section directly below info boxes */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  Quarters Existentes
                </h3>
                {selectedEvc.evc_qs && selectedEvc.evc_qs.length > 0 ? (
                  <div className="space-y-4">
                    {selectedEvc.evc_qs.map((quarter) => (
                      <div
                        key={quarter.id}
                        className="bg-white border border-gray-200 rounded-xl p-5 shadow flex flex-col"
                      >
                        <div className="flex flex-wrap gap-4 mb-2 items-center">
                          <div className="text-base font-semibold text-gray-700">
                            Año:{" "}
                            <span className="font-bold text-gray-900">
                              {quarter.year}
                            </span>
                          </div>
                          <div className="text-base font-semibold text-gray-700">
                            Quarter:{" "}
                            <span className="font-bold text-gray-900">
                              Q{quarter.q}
                            </span>
                          </div>
                          <button
                            className="ml-2 p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                            title="Ver gastos asociados"
                            onClick={() => fetchGastosByQuarter(quarter)}
                          >
                            <FaSearch className="text-gray-700 w-4 h-4" />
                          </button>
                        </div>
                        {/* Progress Bars for this quarter */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              Asignado
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {quarter.allocated_percentage}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative">
                            <div
                              className="h-2 bg-green-400 rounded-full absolute left-0 transition-all duration-500"
                              style={{
                                width: `${Math.min(quarter.allocated_percentage, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              Gastado
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {quarter.percentage || 0}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative">
                            <div
                              className="h-2 bg-orange-400 rounded-full absolute left-0 transition-all duration-500"
                              style={{
                                width: `${Math.min(quarter.percentage || 0, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="mb-2 text-sm text-gray-700">
                          Presupuesto:{" "}
                          <span className="font-bold text-gray-900">
                            ${quarter.allocated_budget.toLocaleString()}
                          </span>
                        </div>
                        <div className="mb-2 text-sm text-gray-700">
                          Presupuesto gastado:{" "}
                          <span className="font-bold text-gray-900">
                            ${quarter.total_spendings?.toLocaleString() ?? 0}
                          </span>
                        </div>
                        <div className="mb-2 text-sm text-gray-700">
                          Porcentaje gastado:{" "}
                          <span className="font-bold text-gray-900">
                            {quarter.percentage?.toLocaleString() ?? 0}%
                          </span>
                        </div>
                        <div className="mb-2 text-sm text-gray-700">
                          Estado:{" "}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ml-2
                          ${
                            quarter.percentage && quarter.percentage >= 100
                              ? "bg-red-100 text-red-800"
                              : quarter.percentage && quarter.percentage >= 80
                                ? "bg-orange-100 text-orange-800"
                                : quarter.percentage && quarter.percentage >= 50
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                          }
                        `}
                          >
                            {quarter.budget_message}
                          </span>
                        </div>
                        {/* Manual Spending Form */}
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Agregar Gasto Manual
                          </h4>
                          <div className="space-y-2">
                            <input
                              type="number"
                              placeholder="Valor USD"
                              value={
                                manualSpendings[quarter.id]?.value_usd || ""
                              }
                              onChange={(e) =>
                                setManualSpendings((prev) => ({
                                  ...prev,
                                  [quarter.id]: {
                                    ...prev[quarter.id],
                                    value_usd: parseFloat(e.target.value),
                                  },
                                }))
                              }
                              className="w-full px-3 py-2 border rounded text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Concepto"
                              value={manualSpendings[quarter.id]?.concept || ""}
                              onChange={(e) =>
                                setManualSpendings((prev) => ({
                                  ...prev,
                                  [quarter.id]: {
                                    ...prev[quarter.id],
                                    concept: e.target.value,
                                  },
                                }))
                              }
                              className="w-full px-3 py-2 border rounded text-sm"
                            />
                            <button
                              onClick={async () => {
                                const value =
                                  manualSpendings[quarter.id]?.value_usd;
                                const concept =
                                  manualSpendings[quarter.id]?.concept;
                                if (!value || isNaN(value) || value <= 0) {
                                  setManualSpendingStatus(
                                    (
                                      prev: Record<
                                        number,
                                        { error?: string; success?: string }
                                      >,
                                    ) => ({
                                      ...prev,
                                      [quarter.id]: {
                                        error:
                                          "Ingrese un valor válido mayor a 0",
                                      },
                                    }),
                                  );
                                  return;
                                }
                                if (!concept || concept.trim() === "") {
                                  setManualSpendingStatus(
                                    (
                                      prev: Record<
                                        number,
                                        { error?: string; success?: string }
                                      >,
                                    ) => ({
                                      ...prev,
                                      [quarter.id]: {
                                        error: "Ingrese un concepto",
                                      },
                                    }),
                                  );
                                  return;
                                }
                                try {
                                  await axios.post(
                                    `http://127.0.0.1:8000/evc-financials/evc_financials/concept`,
                                    {
                                      evc_q_id: quarter.id,
                                      value_usd: value,
                                      concept,
                                    },
                                  );
                                  setManualSpendings((prev) => ({
                                    ...prev,
                                    [quarter.id]: { value_usd: 0, concept: "" },
                                  }));
                                  setManualSpendingStatus(
                                    (
                                      prev: Record<
                                        number,
                                        { error?: string; success?: string }
                                      >,
                                    ) => ({
                                      ...prev,
                                      [quarter.id]: {
                                        success: "Gasto manual agregado",
                                      },
                                    }),
                                  );
                                  setTimeout(
                                    () =>
                                      setManualSpendingStatus((prev) => ({
                                        ...prev,
                                        [quarter.id]: {},
                                      })),
                                    2000,
                                  );
                                } catch (error) {
                                  setManualSpendingStatus(
                                    (
                                      prev: Record<
                                        number,
                                        { error?: string; success?: string }
                                      >,
                                    ) => ({
                                      ...prev,
                                      [quarter.id]: {
                                        error: "Error al agregar gasto manual",
                                      },
                                    }),
                                  );
                                }
                              }}
                              className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                            >
                              Agregar Gasto
                            </button>
                            {manualSpendingStatus[quarter.id]?.error && (
                              <div className="text-red-500 text-xs mt-1">
                                {manualSpendingStatus[quarter.id].error}
                              </div>
                            )}
                            {manualSpendingStatus[quarter.id]?.success && (
                              <div className="text-green-600 text-xs mt-1">
                                {manualSpendingStatus[quarter.id].success}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* PDF Upload Drag-and-Drop */}
                        <div className="mt-4">
                          <div
                            className={`w-full px-4 py-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${uploadStatus[quarter.id]?.uploading ? "bg-blue-50" : "hover:bg-blue-50"}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={async (e) => {
                              e.preventDefault();
                              const file = e.dataTransfer.files[0];
                              if (!file) return;
                              setUploadStatus((prev) => ({
                                ...prev,
                                [quarter.id]: { uploading: true },
                              }));
                              const formData = new FormData();
                              formData.append("file", file);
                              formData.append(
                                "evc_q_id",
                                quarter.id.toString(),
                              );
                              try {
                                await axios.post(
                                  "http://127.0.0.1:8000/evc-financials/evc_financials/upload",
                                  formData,
                                  {
                                    headers: {
                                      "Content-Type": "multipart/form-data",
                                    },
                                  },
                                );
                                setUploadStatus((prev) => ({
                                  ...prev,
                                  [quarter.id]: {
                                    uploading: false,
                                    success: "Factura PDF subida",
                                  },
                                }));
                                setTimeout(
                                  () =>
                                    setUploadStatus((prev) => ({
                                      ...prev,
                                      [quarter.id]: {},
                                    })),
                                  2000,
                                );
                              } catch (error) {
                                setUploadStatus((prev) => ({
                                  ...prev,
                                  [quarter.id]: {
                                    uploading: false,
                                    error: "Error al subir factura PDF",
                                  },
                                }));
                              }
                            }}
                          >
                            {uploadStatus[quarter.id]?.uploading ? (
                              <>
                                <svg
                                  className="animate-spin h-6 w-6 text-blue-500 mb-2"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                <span className="text-blue-600">
                                  Subiendo...
                                </span>
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-8 h-8 text-blue-500 mb-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                  />
                                </svg>
                                <span className="text-blue-700">
                                  Arrastra y suelta aquí tu factura PDF
                                </span>
                                <input
                                  type="file"
                                  accept=".pdf"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setUploadStatus((prev) => ({
                                      ...prev,
                                      [quarter.id]: { uploading: true },
                                    }));
                                    const formData = new FormData();
                                    formData.append("file", file);
                                    formData.append(
                                      "evc_q_id",
                                      quarter.id.toString(),
                                    );
                                    try {
                                      await axios.post(
                                        "http://127.0.0.1:8000/evc-financials/evc_financials/upload",
                                        formData,
                                        {
                                          headers: {
                                            "Content-Type":
                                              "multipart/form-data",
                                          },
                                        },
                                      );
                                      setUploadStatus((prev) => ({
                                        ...prev,
                                        [quarter.id]: {
                                          uploading: false,
                                          success: "Factura PDF subida",
                                        },
                                      }));
                                      setTimeout(
                                        () =>
                                          setUploadStatus((prev) => ({
                                            ...prev,
                                            [quarter.id]: {},
                                          })),
                                        2000,
                                      );
                                    } catch (error) {
                                      setUploadStatus((prev) => ({
                                        ...prev,
                                        [quarter.id]: {
                                          uploading: false,
                                          error: "Error al subir factura PDF",
                                        },
                                      }));
                                    }
                                  }}
                                />
                              </>
                            )}
                            {uploadStatus[quarter.id]?.error && (
                              <div className="text-red-500 text-xs mt-1">
                                {uploadStatus[quarter.id].error}
                              </div>
                            )}
                            {uploadStatus[quarter.id]?.success && (
                              <div className="text-green-600 text-xs mt-1">
                                {uploadStatus[quarter.id].success}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Add Talento (Provider) */}
                        <div className="mt-4">
                          <div className="flex gap-2 items-center mb-2">
                            <label className="block text-sm font-medium">
                              Agregar Talento
                            </label>
                            <button
                              className="ml-auto px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                              onClick={() =>
                                setProviderFilterModal({
                                  quarterId: quarter.id,
                                  open: true,
                                })
                              }
                              type="button"
                            >
                              Filtrar Talentos
                            </button>
                          </div>
                          <select
                            className="p-2 border rounded w-full"
                            value={providerSelections[quarter.id] || ""}
                            onChange={(e) =>
                              setProviderSelections((prev) => ({
                                ...prev,
                                [quarter.id]: e.target.value,
                              }))
                            }
                          >
                            <option value="">-- Seleccionar Talento --</option>
                            {getFilteredProviders(quarter.id).map(
                              (provider) => (
                                <option key={provider.id} value={provider.id}>
                                  {provider.name}
                                </option>
                              ),
                            )}
                          </select>
                          <button
                            className="mt-3 px-4 py-2 bg-green-200 text-green-800 rounded hover:bg-green-300 text-sm transition-colors duration-150"
                            onClick={async () => {
                              const providerId = providerSelections[quarter.id];
                              if (!providerId) return;
                              try {
                                await axios.post(
                                  "http://127.0.0.1:8000/evc-financials/evc_financials/",
                                  {
                                    evc_q_id: quarter.id,
                                    provider_id: parseInt(providerId, 10),
                                  },
                                );
                                setProviderSelections((prev) => ({
                                  ...prev,
                                  [quarter.id]: "",
                                }));
                                // Optionally refresh data here
                              } catch (error) {
                                alert("Error al agregar talento");
                              }
                            }}
                          >
                            Agregar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center">
                    No hay quarters asignados.
                  </div>
                )}
              </div>
              {/* Formulario para crear quarter (remains at the end) */}
              <div className="mb-6 bg-gray-50 p-4 rounded-xl shadow-inner">
                <h3 className="text-lg font-semibold mb-4">
                  Agregar Nuevo Quarter
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Año
                    </label>
                    <input
                      type="number"
                      name="year"
                      className="p-2 border rounded w-full"
                      value={newQuarter.year}
                      onChange={handleQuarterChange}
                      placeholder="YYYY"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="quarter-select"
                      className="block text-sm font-medium mb-1"
                    >
                      Quarter
                    </label>
                    <select
                      id="quarter-select"
                      name="q"
                      className="p-2 border rounded w-full"
                      value={newQuarter.q}
                      onChange={handleQuarterChange}
                      aria-label="Quarter"
                    >
                      <option value="">Seleccionar Q</option>
                      <option value="1">Q1</option>
                      <option value="2">Q2</option>
                      <option value="3">Q3</option>
                      <option value="4">Q4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Presupuesto Asignado
                    </label>
                    <input
                      type="number"
                      name="allocated_budget"
                      className="p-2 border rounded w-full"
                      value={newQuarter.allocated_budget}
                      onChange={handleQuarterChange}
                      placeholder="$"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Porcentaje
                    </label>
                    <input
                      type="number"
                      name="allocated_percentage"
                      className="p-2 border rounded w-full"
                      value={newQuarter.allocated_percentage}
                      onChange={handleQuarterChange}
                      placeholder="%"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                    onClick={() => createQuarter(selectedEvc.id)}
                  >
                    Agregar Quarter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de eliminación */}
      {showDeleteModal && evcToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
            <p className="mb-4">
              ¿Está seguro que desea eliminar la EVC "{evcToDelete.name}"? Esta
              acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                onClick={() => {
                  setShowDeleteModal(false);
                  setEvcToDelete(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={() => deleteEvc(evcToDelete.id)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para vista detallada */}
      {showDetailModal && selectedEvc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Modern light overlay with blur */}
          <div className="fixed inset-0 bg-white/70 backdrop-blur-sm transition-all" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Sticky close button */}
            <button
              className="absolute top-4 right-4 z-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-2 shadow focus:outline-none focus:ring-2 focus:ring-red-400"
              onClick={() => setShowDetailModal(false)}
              aria-label="Cerrar"
            >
              <FaTimes className="h-5 w-5" />
            </button>
            <div className="mb-6 pr-10">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
                Detalles de la EVC:{" "}
                <span className="font-bold text-blue-700">
                  {selectedEvc.name}
                </span>
              </h2>
            </div>
            {/* Two-column layout */}
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left: EVC Info in boxes */}
              <div className="flex-1 space-y-4">
                <div className="rounded-xl bg-gray-50 p-4 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Descripción
                  </div>
                  <div className="text-base font-bold text-gray-900">
                    {selectedEvc.description}
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Entorno
                  </div>
                  <div className="text-base font-bold text-gray-900">
                    {selectedEvc.entorno_id
                      ? entornosData[selectedEvc.entorno_id] || "Cargando..."
                      : "-"}
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Líder Técnico
                  </div>
                  <div className="text-base font-bold text-gray-900">
                    {selectedEvc.technical_leader_id
                      ? technicalLeadersData[selectedEvc.technical_leader_id] ||
                        "Cargando..."
                      : "-"}
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Líder Funcional
                  </div>
                  <div className="text-base font-bold text-gray-900">
                    {selectedEvc.functional_leader_id
                      ? functionalLeadersData[
                          selectedEvc.functional_leader_id
                        ] || "Cargando..."
                      : "-"}
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Estado
                  </div>
                  <div
                    className={`text-base font-bold ${selectedEvc.status ? "text-green-700" : "text-red-700"}`}
                  >
                    {selectedEvc.status ? "Activo" : "Inactivo"}
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Creado
                  </div>
                  <div className="text-base font-bold text-gray-900">
                    {new Date(selectedEvc.creation_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Actualizado
                  </div>
                  <div className="text-base font-bold text-gray-900">
                    {new Date(selectedEvc.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {/* Right: Quarters (remains as is) */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  Quarters Asignados
                </h3>
                {selectedEvc.evc_qs && selectedEvc.evc_qs.length > 0 ? (
                  <div className="space-y-4">
                    {selectedEvc.evc_qs.map((quarter) => (
                      <div
                        key={quarter.id}
                        className="bg-white border border-gray-200 rounded-xl p-5 shadow flex flex-col"
                      >
                        <div className="flex flex-wrap gap-4 mb-2 items-center">
                          <div className="text-base font-semibold text-gray-700">
                            Año:{" "}
                            <span className="font-bold text-gray-900">
                              {quarter.year}
                            </span>
                          </div>
                          <div className="text-base font-semibold text-gray-700">
                            Quarter:{" "}
                            <span className="font-bold text-gray-900">
                              Q{quarter.q}
                            </span>
                          </div>
                          <button
                            className="ml-2 p-1 bg-gray-200 rounded-full hover:bg-gray-300"
                            title="Ver gastos asociados"
                            onClick={() => fetchGastosByQuarter(quarter)}
                          >
                            <FaSearch className="text-gray-700 w-4 h-4" />
                          </button>
                        </div>
                        {/* Progress Bars for this quarter */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              Asignado
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {quarter.allocated_percentage}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative">
                            <div
                              className="h-2 bg-green-400 rounded-full absolute left-0 transition-all duration-500"
                              style={{
                                width: `${Math.min(quarter.allocated_percentage, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              Gastado
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {quarter.percentage || 0}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative">
                            <div
                              className="h-2 bg-orange-400 rounded-full absolute left-0 transition-all duration-500"
                              style={{
                                width: `${Math.min(quarter.percentage || 0, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="mb-2 text-sm text-gray-700">
                          Presupuesto:{" "}
                          <span className="font-bold text-gray-900">
                            ${quarter.allocated_budget.toLocaleString()}
                          </span>
                        </div>
                        <div className="mb-2 text-sm text-gray-700">
                          Presupuesto gastado:{" "}
                          <span className="font-bold text-gray-900">
                            ${quarter.total_spendings?.toLocaleString() ?? 0}
                          </span>
                        </div>
                        <div className="mb-2 text-sm text-gray-700">
                          Porcentaje gastado:{" "}
                          <span className="font-bold text-gray-900">
                            {quarter.percentage?.toLocaleString() ?? 0}%
                          </span>
                        </div>
                        <div className="mb-2 text-sm text-gray-700">
                          Estado:{" "}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ml-2
                          ${
                            quarter.percentage && quarter.percentage >= 100
                              ? "bg-red-100 text-red-800"
                              : quarter.percentage && quarter.percentage >= 80
                                ? "bg-orange-100 text-orange-800"
                                : quarter.percentage && quarter.percentage >= 50
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                          }
                        `}
                          >
                            {quarter.budget_message}
                          </span>
                        </div>
                        {quarter.evc_financials &&
                        quarter.evc_financials.length > 0 ? (
                          <div className="mt-2">
                            <div className="text-sm font-medium text-gray-700 mb-1">
                              Talentos asignados:
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {quarter.evc_financials.map((financial) => (
                                <span
                                  key={financial.id}
                                  className="px-2 py-1 bg-blue-50 text-blue-800 rounded text-xs font-semibold"
                                >
                                  {financial.provider.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 mt-2">
                            No hay talentos asignados.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center">
                    No hay quarters asignados.
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Gastos Modal */}
          {gastosModal.open && gastosModal.quarter && (
            <div className="fixed inset-0 z-60 flex items-center justify-center">
              <div
                className="fixed inset-0 bg-black bg-opacity-40"
                onClick={() =>
                  setGastosModal({ open: false, quarter: null, gastos: [] })
                }
              />
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[80vh] overflow-y-auto flex flex-col">
                <button
                  className="absolute top-4 right-4 z-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-2 shadow"
                  onClick={() =>
                    setGastosModal({ open: false, quarter: null, gastos: [] })
                  }
                  aria-label="Cerrar"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-bold mb-4">
                  Gastos asociados a Q{gastosModal.quarter.q} -{" "}
                  {gastosModal.quarter.year}
                </h2>
                {gastosModal.gastos.length === 0 ? (
                  <div className="text-gray-500 text-center">
                    No hay gastos asociados.
                  </div>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left">Fecha</th>
                        <th className="px-4 py-2 text-left">Concepto</th>
                        <th className="px-4 py-2 text-left">Valor (USD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gastosModal.gastos.map((gasto) => (
                        <tr key={gasto.id} className="border-b">
                          <td className="px-4 py-2">
                            {gasto.created_at
                              ? new Date(gasto.created_at).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-4 py-2">{gasto.concept}</td>
                          <td className="px-4 py-2">
                            ${gasto.value_usd?.toLocaleString() ?? "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal para eliminar EVCs seleccionados */}
      {showDeleteSelectedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-30" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-center">
              ¿Estás seguro de que deseas eliminar los EVCs seleccionados?
            </h2>
            <div className="flex justify-end space-x-4 mt-6 w-full">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                onClick={() => setShowDeleteSelectedModal(false)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={async () => {
                  setDeleting(true);
                  try {
                    for (const id of selectedEvcsForDelete) {
                      await deleteEvc(id);
                    }
                    setSelectedEvcsForDelete([]);
                    setShowDeleteSelectedModal(false);
                  } catch (err) {
                    alert("Error al eliminar los EVCs seleccionados");
                  } finally {
                    setDeleting(false);
                  }
                }}
                disabled={deleting}
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Listado de EVCs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(filteredEvcs.length > 0 ? filteredEvcs : evcs).map(
          (evc: EVC, idx: number) => (
            <EvcCard
              key={evc.id}
              evc={evc}
              entornosData={entornosData}
              onShowDetails={showEvcDetails}
              onManageQuarters={() => {
                setSelectedEvc(evc);
                setShowQuartersModal(true);
              }}
              index={idx}
              selected={selectedEvcsForDelete.includes(evc.id)}
              onSelect={(checked) => {
                setSelectedEvcsForDelete((prev) =>
                  checked
                    ? [...prev, evc.id]
                    : prev.filter((id) => id !== evc.id),
                );
              }}
              onStatusChange={handleStatusChange}
            />
          ),
        )}

        {filteredEvcs.length === 0 && filters.entorno_id && (
          <div className="col-span-3 text-center py-8 text-gray-500">
            No hay EVCs en el entorno seleccionado.
          </div>
        )}
      </div>

      {providerFilterModal.open && (
        <div className="fixed inset-0 z-50 flex items-start justify-start">
          {/* White, semi-transparent overlay */}
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm transition-all" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl p-10 w-full max-w-2xl flex flex-col items-start mt-32 ml-32"
            style={{ minHeight: "520px", minWidth: "520px" }}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 z-10 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-2 shadow focus:outline-none focus:ring-2 focus:ring-gray-400"
              onClick={() =>
                setProviderFilterModal({ quarterId: null, open: false })
              }
              aria-label="Cerrar"
            >
              <FaTimes className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-left w-full">
              Filtrar Talentos
            </h2>
            {/* Price Filter */}
            <div className="w-full mb-6">
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={activeProviderFilters.price}
                  onChange={(e) =>
                    setActiveProviderFilters((f) => ({
                      ...f,
                      price: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                Filtrar por precio
              </label>
              {activeProviderFilters.price && (
                <div className="flex flex-col items-start">
                  <span className="text-sm mb-2">
                    Rango: ${providerPriceRange[0]} - ${providerPriceRange[1]}
                  </span>
                  <Slider
                    range
                    min={0}
                    max={15000}
                    value={providerPriceRange}
                    onChange={(val) =>
                      setProviderPriceRange(val as [number, number])
                    }
                    className="w-full"
                  />
                </div>
              )}
            </div>
            {/* Country Filter */}
            <div className="w-full mb-6">
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={activeProviderFilters.country}
                  onChange={(e) =>
                    setActiveProviderFilters((f) => ({
                      ...f,
                      country: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                Filtrar por país
              </label>
              {activeProviderFilters.country && (
                <select
                  multiple
                  className="w-full border rounded p-2"
                  value={providerSelectedCountries}
                  onChange={(e) => {
                    const options = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value,
                    );
                    setProviderSelectedCountries(options);
                  }}
                >
                  {providerCountryOptions.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {/* Filtered Providers List */}
            <div
              className="w-full overflow-y-auto"
              style={{ maxHeight: "260px" }}
            >
              {getFilteredProviders(providerFilterModal.quarterId ?? 0)
                .length === 0 ? (
                <div className="text-center text-gray-400 py-4">
                  No hay talentos que coincidan con los filtros.
                </div>
              ) : (
                <ul>
                  {getFilteredProviders(providerFilterModal.quarterId ?? 0).map(
                    (provider) => (
                      <li
                        key={provider.id}
                        className="flex items-center justify-between px-4 py-2 border-b last:border-b-0"
                      >
                        <div>
                          <div className="font-semibold text-gray-900">
                            {provider.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {provider.company} | {provider.country} | $
                            {provider.cost_usd ?? "-"}
                          </div>
                        </div>
                        <button
                          className="ml-6 px-3 py-1 bg-green-200 text-green-800 rounded hover:bg-green-300 text-xs transition-colors duration-150"
                          style={{ marginLeft: "1.5rem" }}
                          onClick={() => {
                            if (providerFilterModal.quarterId != null) {
                              setProviderSelections((prev) => ({
                                ...prev,
                                [providerFilterModal.quarterId!]:
                                  provider.id.toString(),
                              }));
                            }
                            setProviderFilterModal({
                              quarterId: null,
                              open: false,
                            });
                          }}
                        >
                          Asignar
                        </button>
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
            {/* Modal Actions */}
            <div className="w-full flex justify-end gap-4 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={() => {
                  setActiveProviderFilters({ price: false, country: false });
                  setProviderPriceRange([0, 15000]);
                  setProviderSelectedCountries([]);
                }}
              >
                Limpiar filtros
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() =>
                  setProviderFilterModal({ quarterId: null, open: false })
                }
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
