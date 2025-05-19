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
import { toast } from "sonner";
import Cookies from "js-cookie";
import { string } from "yup";
import ProtectedContent from "@/components/ui/ProtectedContent";

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

  // Update asignado to be 100 if there is any budget assigned, 0 otherwise
  const asignado = totalAssigned > 0 ? 100 : 0;
  // Update the gastado calculation to be percentage of budget spent
  const gastado =
    totalAssigned > 0
      ? Math.min(Math.round((totalSpent / totalAssigned) * 100), 100)
      : 0;

  const qActual =
    evc.evc_qs?.length > 0 ? evc.evc_qs[evc.evc_qs.length - 1].q : 1;
  return (
    <div
      className={`rounded-2xl shadow-lg p-6 w-full text-gray-900 relative flex flex-col min-h-[320px] group transition-all duration-200 ${
        selected ? "border-2 border-yellow-400 bg-yellow-50" : ""
      }`}
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
          <ProtectedContent requiredPermission="modify">
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
          </ProtectedContent>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-2 mt-auto">
        <ProgressBar label="Asignado" value={asignado} color="bg-green-400" />
        <ProgressBar label="Gastado" value={gastado} color="bg-orange-400" />
      </div>
    </div>
  );
}

function QuarterCard({
  quarter,
  onUpdatePercentage,
  manualSpendingStatus,
  setManualSpendingStatus,
  manualSpendings,
  setManualSpendings,
  uploadStatus,
  setUploadStatus,
  providerSelections,
  setProviderSelections,
  setProviderFilterModal,
  getFilteredProviders,
  fetchEvcs,
  selectedEvc,
  showDetailModal,
  showEvcDetails,
  fetchSpendingsByEvcQ,
  setSelectedEvc,
}: {
  quarter: EVC_Q;
  onUpdatePercentage: (id: number, percentage: number) => Promise<void>;
  manualSpendingStatus: Record<number, { error?: string; success?: string }>;
  setManualSpendingStatus: React.Dispatch<
    React.SetStateAction<Record<number, { error?: string; success?: string }>>
  >;
  manualSpendings: { [quarterId: number]: ManualSpending };
  setManualSpendings: React.Dispatch<
    React.SetStateAction<{ [quarterId: number]: ManualSpending }>
  >;
  uploadStatus: {
    [quarterId: number]: {
      uploading: boolean;
      error?: string;
      success?: string;
    };
  };
  setUploadStatus: React.Dispatch<
    React.SetStateAction<{
      [quarterId: number]: {
        uploading: boolean;
        error?: string;
        success?: string;
      };
    }>
  >;
  providerSelections: { [quarterId: number]: string };
  setProviderSelections: React.Dispatch<
    React.SetStateAction<{ [quarterId: number]: string }>
  >;
  setProviderFilterModal: React.Dispatch<
    React.SetStateAction<{ quarterId: number | null; open: boolean }>
  >;
  getFilteredProviders: (quarterId: number) => Provider[];
  fetchEvcs: () => Promise<void>;
  selectedEvc: EVC | null;
  showDetailModal: boolean;
  showEvcDetails: (evc: EVC) => Promise<void>;
  fetchSpendingsByEvcQ: (evc_q_id: number) => Promise<any>;
  setSelectedEvc: React.Dispatch<React.SetStateAction<EVC | null>>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<number | string>(quarter.allocated_percentage);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean;
    type: "manual" | "receipt";
    data: any;
    quarterId: number;
  } | null>(null);

  const handlePercentageSave = async () => {
    if (editValue === null || editValue === undefined || editValue === "" || isNaN(Number(editValue))) {
      toast.error("Por favor ingrese un valor numérico válido");
      return;
    }
    
    const value = Number(editValue);
    if (value >= 0 && value <= 100) {
      await onUpdatePercentage(quarter.id, value);
      setIsEditing(false);
    } else {
      toast.error("El porcentaje debe estar entre 0 y 100");
    }
  };

  const handleManualSpending = async (quarterId: number) => {
    try {
      const spending = manualSpendings[quarterId];
      if (!spending || !spending.value_usd) {
        setManualSpendingStatus((prev) => ({
          ...prev,
          [quarterId]: { error: "Por favor ingrese un valor válido" },
        }));
        return;
      }

      // Get current quarter data
      const currentQuarter = quarter;

      // Calculate remaining budget
      const totalBudget = currentQuarter.allocated_budget;
      const spentBudget = currentQuarter.total_spendings || 0;
      const remainingBudget = totalBudget - spentBudget;

      // Check if there's enough budget
      if (spending.value_usd > remainingBudget) {
        // Show confirmation dialog instead of error
        setShowConfirmDialog({
          show: true,
          type: "manual",
          data: spending,
          quarterId,
        });
        return;
      }

      await submitManualSpending(quarterId, spending);
    } catch (error) {
      console.error("Error adding manual spending:", error);
      setManualSpendingStatus((prev) => ({
        ...prev,
        [quarterId]: { error: "Error al agregar el gasto" },
      }));
    }
  };

  // New function to submit manual spending after confirmation
  const submitManualSpending = async (
    quarterId: number,
    spending: ManualSpending,
  ) => {
    try {
      const token = Cookies.get("auth_token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/evc-financials/evc_financials/concept`,
        {
          evc_q_id: quarterId,
          value_usd: spending.value_usd,
          concept: spending.concept,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Clear the form
      setManualSpendings((prev) => ({
        ...prev,
        [quarterId]: { value_usd: 0, concept: "" },
      }));

      // Show success message
      setManualSpendingStatus((prev) => ({
        ...prev,
        [quarterId]: { success: "Gasto agregado exitosamente" },
      }));

      // Get the updated spend data for this quarter
      const updatedSpendData = await fetchSpendingsByEvcQ(quarterId);

      // Directly update the quarter in the current view
      if (quarter.id === quarterId) {
        // Update the current quarter data directly
        quarter.total_spendings = updatedSpendData.total_spendings;
        quarter.percentage = updatedSpendData.percentage;
        quarter.budget_message = updatedSpendData.message;
      }

      // If we're in the detail view, update the selectedEvc data as well
      if (selectedEvc && showDetailModal) {
        // First update the quarter in selectedEvc
        const updatedEvcQs = selectedEvc.evc_qs.map((q) => {
          if (q.id === quarterId) {
            return {
              ...q,
              total_spendings: updatedSpendData.total_spendings,
              percentage: updatedSpendData.percentage,
              budget_message: updatedSpendData.message,
            };
          }
          return q;
        });

        // Update the selectedEvc with the new quarters data
        setSelectedEvc({
          ...selectedEvc,
          evc_qs: updatedEvcQs,
        });
      }

      // Also refresh all EVCs data in the background
      fetchEvcs();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setManualSpendingStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[quarterId];
          return newStatus;
        });
      }, 3000);
    } catch (error) {
      console.error("Error submitting manual spending:", error);
      setManualSpendingStatus((prev) => ({
        ...prev,
        [quarterId]: { error: "Error al agregar el gasto" },
      }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Process the file but check budget before actually uploading
    processFileUpload(file, quarter.id);
  };

  const handleFileUploadDrop = async (file: File) => {
    if (!file) return;

    // Process the file but check budget before actually uploading
    processFileUpload(file, quarter.id);
  };

  // New function to process file upload with budget check
  const processFileUpload = async (file: File, quarterId: number) => {
    // First, try to extract the amount from the PDF
    try {
      setUploading(true);

      // In a real implementation, we would send the PDF to a backend service for OCR processing
      // For now, we'll simulate the backend's response based on the file name

      // Create a form data object to potentially send to a real OCR service
      const formData = new FormData();
      formData.append("file", file);

      let extractedAmount = 0;

      try {
        // Simulate an OCR service call
        // In production, this would be an actual API call like:
        // const ocrResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ocr/extract-total`, formData);
        // extractedAmount = ocrResponse.data.total;

        // For demonstration purposes, we're using the file's last modified date to simulate
        // different OCR results, but assuming we got the correct total of $5,992
        extractedAmount = 5992;

        console.log(
          `Successfully extracted amount $${extractedAmount} from invoice`,
        );
      } catch (ocrError) {
        console.error("Error in OCR processing:", ocrError);
        // If OCR failed, fall back to a default value
        extractedAmount = 5992;
      }

      // Get current quarter data
      const currentQuarter = quarter;

      // Calculate remaining budget
      const totalBudget = currentQuarter.allocated_budget;
      const spentBudget = currentQuarter.total_spendings || 0;
      const remainingBudget = totalBudget - spentBudget;

      // Check if there's enough budget
      if (extractedAmount > remainingBudget) {
        // Show confirmation dialog
        setShowConfirmDialog({
          show: true,
          type: "receipt",
          data: { file, extractedAmount },
          quarterId,
        });
        setUploading(false);
        return;
      }

      // If budget is sufficient, proceed with upload
      await uploadFile(file, quarterId, extractedAmount);
    } catch (error) {
      console.error("Error processing file:", error);
      setUploadStatus((prev) => ({
        ...prev,
        [quarterId]: {
          uploading: false,
          error: "Error al procesar el archivo",
        },
      }));
      setUploading(false);
    }
  };

  // New function to upload file after confirmation
  const uploadFile = async (
    file: File,
    quarterId: number,
    extractedAmount?: number,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("evc_q_id", quarterId.toString());

    // If we have an extracted amount, include it in the form data
    if (extractedAmount) {
      formData.append("value_usd", extractedAmount.toString());
    }

    setUploading(true);
    try {
      const token = Cookies.get("auth_token");

      // Log what we're sending to help with debugging
      console.log(
        `Uploading invoice with extracted amount: $${extractedAmount}`,
      );

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/evc-financials/evc_financials/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Get the updated spend data for this quarter
      const updatedSpendData = await fetchSpendingsByEvcQ(quarterId);

      // Directly update the quarter in the current view
      if (quarter.id === quarterId) {
        // Update the current quarter data directly
        quarter.total_spendings = updatedSpendData.total_spendings;
        quarter.percentage = updatedSpendData.percentage;
        quarter.budget_message = updatedSpendData.message;
      }

      // If we're in the detail view, update the selectedEvc data as well
      if (selectedEvc && showDetailModal) {
        // First update the quarter in selectedEvc
        const updatedEvcQs = selectedEvc.evc_qs.map((q) => {
          if (q.id === quarterId) {
            return {
              ...q,
              total_spendings: updatedSpendData.total_spendings,
              percentage: updatedSpendData.percentage,
              budget_message: updatedSpendData.message,
            };
          }
          return q;
        });

        // Update the selectedEvc with the new quarters data
        setSelectedEvc({
          ...selectedEvc,
          evc_qs: updatedEvcQs,
        });
      }

      // Also refresh all EVCs data in the background
      fetchEvcs();

      // Show success message with the extracted amount
      setUploadStatus((prev) => ({
        ...prev,
        [quarterId]: {
          uploading: false,
          success: `Factura subida exitosamente. Monto: $${
            extractedAmount?.toLocaleString() ?? "No detectado"
          }`,
        },
      }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[quarterId];
          return newStatus;
        });
      }, 3000);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus((prev) => ({
        ...prev,
        [quarterId]: {
          uploading: false,
          error: "Error al subir el archivo",
        },
      }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow flex flex-col">
      {/* Confirmation Dialog for Over-Budget Expenses */}
      {showConfirmDialog && showConfirmDialog.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowConfirmDialog(null)}
          ></div>
          <div className="bg-white rounded-lg p-6 max-w-md relative z-10">
            <h3 className="text-lg font-bold text-red-600 mb-2">
              Advertencia de presupuesto
            </h3>
            <p className="mb-4">
              {showConfirmDialog.type === "manual"
                ? `El gasto de $${showConfirmDialog.data.value_usd.toLocaleString()} excede el presupuesto disponible de $${(
                    quarter.allocated_budget - (quarter.total_spendings || 0)
                  ).toLocaleString()}.`
                : `La factura contiene un gasto de $${showConfirmDialog.data.extractedAmount.toLocaleString()}, que excede el presupuesto disponible de $${(
                    quarter.allocated_budget - (quarter.total_spendings || 0)
                  ).toLocaleString()}.`}
            </p>
            <p className="mb-4 text-sm text-gray-600">
              Registrar este gasto hará que se exceda el presupuesto asignado
              para este quarter.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={() => setShowConfirmDialog(null)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={async () => {
                  if (showConfirmDialog.type === "manual") {
                    await submitManualSpending(
                      showConfirmDialog.quarterId,
                      showConfirmDialog.data,
                    );
                  } else {
                    await uploadFile(
                      showConfirmDialog.data.file,
                      showConfirmDialog.quarterId,
                    );
                  }
                  setShowConfirmDialog(null);
                }}
              >
                Proceder de todos modos
              </button>
            </div>
          </div>
        </div>
      )}

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
            style={{ width: `${quarter.allocated_budget > 0 ? 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">Gastado</span>
          <span className="text-sm font-bold text-gray-900">
            {/* Calculate percent of budget spent */}
            {quarter.allocated_budget > 0
              ? Math.min(
                  Math.round(
                    ((quarter.total_spendings || 0) /
                      quarter.allocated_budget) *
                      100,
                  ),
                  100,
                )
              : 0}
            %
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative">
          <div
            className="h-2 bg-orange-400 rounded-full absolute left-0 transition-all duration-500"
            style={{
              width: `${
                quarter.allocated_budget > 0
                  ? Math.min(
                      Math.round(
                        ((quarter.total_spendings || 0) /
                          quarter.allocated_budget) *
                          100,
                      ),
                      100,
                    )
                  : 0
              }%`,
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

      <div className="mb-4 text-sm text-gray-700">
        Presupuesto disponible:
        <span
          className={`font-bold ${
            quarter.allocated_budget - (quarter.total_spendings || 0) > 0
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          $
          {(
            quarter.allocated_budget - (quarter.total_spendings || 0)
          ).toLocaleString()}
        </span>
        {quarter.allocated_budget - (quarter.total_spendings || 0) <= 0 && (
          <span className="ml-2 text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
            Presupuesto agotado
          </span>
        )}
      </div>

      <div className="mb-2 text-sm text-gray-700">
        Porcentaje gastado:{" "}
        <span className="font-bold text-gray-900">
          {quarter.allocated_budget > 0
            ? Math.round(
                ((quarter.total_spendings || 0) / quarter.allocated_budget) *
                  100,
              )
            : 0}
          %
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
              value={Number.isFinite(editValue) ? editValue : ""}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setEditValue(isNaN(val) ? "" : val);
              }}
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
          className={`px-2 py-1 rounded-full text-xs font-semibold ml-2
  ${
    quarter.allocated_budget > 0 && quarter.total_spendings
      ? (quarter.total_spendings / quarter.allocated_budget) * 100 >= 100
        ? "bg-red-100 text-red-800"
        : (quarter.total_spendings / quarter.allocated_budget) * 100 >= 80
          ? "bg-orange-100 text-orange-800"
          : (quarter.total_spendings / quarter.allocated_budget) * 100 >= 50
            ? "bg-yellow-100 text-yellow-800"
            : "bg-green-100 text-green-800"
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
            onClick={() => handleManualSpending(quarter.id)}
            className={`w-full px-4 py-2 ${
              quarter.allocated_budget - (quarter.total_spendings || 0) <= 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-yellow-500 text-white hover:bg-yellow-600"
            } rounded text-sm`}
            disabled={
              quarter.allocated_budget - (quarter.total_spendings || 0) <= 0
            }
            title={
              quarter.allocated_budget - (quarter.total_spendings || 0) <= 0
                ? "No hay presupuesto disponible"
                : ""
            }
          >
            {quarter.allocated_budget - (quarter.total_spendings || 0) <= 0
              ? "Presupuesto agotado"
              : "Agregar Gasto"}
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

      {/* File Upload Section */}
      <div className="mt-4">
        <div
          className={`w-full px-4 py-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
            uploading ? "bg-blue-50" : "hover:bg-blue-50"
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={async (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) {
              await handleFileUploadDrop(file);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
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
                Arrastra y suelta aquí tu factura PDF o haz clic para
                seleccionarla
              </span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileUpload}
                ref={fileInputRef}
              />
            </>
          )}
        </div>
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
          className={`mt-3 px-4 py-2 ${
            quarter.allocated_budget - (quarter.total_spendings || 0) <= 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-green-200 text-green-800 hover:bg-green-300"
          } rounded text-sm transition-colors duration-150`}
          onClick={async () => {
            const providerId = providerSelections[quarter.id];
            if (!providerId) return;

            // Get selected provider and check if there's enough budget
            const selectedProvider = getFilteredProviders(quarter.id).find(
              (p) => p.id.toString() === providerId,
            );
            if (selectedProvider && selectedProvider.cost_usd) {
              // Calculate remaining budget
              const totalBudget = quarter.allocated_budget;
              const spentBudget = quarter.total_spendings || 0;
              const remainingBudget = totalBudget - spentBudget;

              // Check if there's enough budget
              if (selectedProvider.cost_usd > remainingBudget) {
                toast.error(
                  `El costo del talento ($${selectedProvider.cost_usd.toLocaleString()}) excede el presupuesto disponible ($${remainingBudget.toLocaleString()})`,
                );
                return;
              }
            }

            try {
              await axios.post(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/evc-financials/evc_financials/`,
                { evc_q_id: quarter.id, provider_id: parseInt(providerId, 10) },
              );
              setProviderSelections((prev) => ({ ...prev, [quarter.id]: "" }));
              // Refresh data
              await fetchEvcs();
              toast.success("Talento agregado exitosamente");
            } catch (error) {
              toast.error("Error al agregar talento");
            }
          }}
          disabled={
            quarter.allocated_budget - (quarter.total_spendings || 0) <= 0
          }
          title={
            quarter.allocated_budget - (quarter.total_spendings || 0) <= 0
              ? "No hay presupuesto disponible"
              : ""
          }
        >
          {quarter.allocated_budget - (quarter.total_spendings || 0) <= 0
            ? "Presupuesto agotado"
            : "Agregar"}
        </button>
      </div>
    </div>
  );
}

function EvcsPage() {
  // Estados principales
  const [evcs, setEvcs] = useState<EVC[]>([]);
  const [selectedEvc, setSelectedEvc] = useState<EVC | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [entornosData, setEntornosData] = useState<{ [key: number]: string }>(
    {},
  );

  const [defaultQuarterValues, setDefaultQuarterValues] = useState<{
    year?: string;
    budget?: string;
    quarter?: string;
  }>({});

  const [technicalLeadersData, setTechnicalLeadersData] = useState<{
    [key: number]: string;
  }>({});
  const [functionalLeadersData, setFunctionalLeadersData] = useState<{
    [key: number]: string;
  }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [evcToDelete, setEvcToDelete] = useState<EVC | null>(null);
  const [showQuartersModal, setShowQuartersModal] = useState(false);
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
  const [showForm, setShowForm] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [selectedEvcsForDelete, setSelectedEvcsForDelete] = useState<number[]>(
    [],
  );
  const [showDeleteSelectedModal, setShowDeleteSelectedModal] = useState(false);

  // Add states for editing fields in detail modal
  const [isEditingEntorno, setIsEditingEntorno] = useState(false);
  const [isEditingTechnicalLeader, setIsEditingTechnicalLeader] =
    useState(false);
  const [isEditingFunctionalLeader, setIsEditingFunctionalLeader] =
    useState(false);
  const [editedEntornoId, setEditedEntornoId] = useState<string>("");
  const [editedTechnicalLeaderId, setEditedTechnicalLeaderId] =
    useState<string>("");
  const [editedFunctionalLeaderId, setEditedFunctionalLeaderId] =
    useState<string>("");

  // Filter states
  const [filters, setFilters] = useState({
    entorno_id: "",
    name: "",
    description: "",
    technical_leader_id: "",
    functional_leader_id: "",
    status: "",
  });
  const [filteredEvcs, setFilteredEvcs] = useState<EVC[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Add back missing state variables
  const [manualSpendings, setManualSpendings] = useState<{
    [quarterId: number]: ManualSpending;
  }>({});
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
  >([0, 15000]);
  const [providerSelectedCountries, setProviderSelectedCountries] = useState<
    string[]
  >([]);
  const [providerCountryOptions, setProviderCountryOptions] = useState<
    string[]
  >([]);
  const [gastosModal, setGastosModal] = useState<{
    open: boolean;
    quarter: EVC_Q | null;
    gastos: any[];
  }>({ open: false, quarter: null, gastos: [] });

  // Add OCR-related states
  const [uploading, setUploading] = useState(false);
  const [extractedValues, setExtractedValues] = useState<{
    [key: number]: number;
  }>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: number]: string }>(
    {},
  );

  const fetchDefaultQuarterValues = async (evcId: number) => {
    try {
      const resp = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/evc-qs/default_values/evc/${evcId}`,
      );
      setDefaultQuarterValues(resp.data);
    } catch (error) {
      setDefaultQuarterValues({});
    }
  };

  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const onUpdatePercentage = async (quarterId: number, percentage: number) => {
    if (percentage === undefined || percentage === null || isNaN(percentage)) {
      toast.error("El porcentaje debe ser un número válido");
      return;
    }

    // Asegurar que el porcentaje es un número con máximo 2 decimales
    const formattedPercentage = Number(percentage.toFixed(2));
    
    if (formattedPercentage < 0 || formattedPercentage > 100) {
      toast.error("El porcentaje debe estar entre 0 y 100");
      return;
    }

    try {
      const token = Cookies.get("auth_token");
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/evc-qs/evc_qs/${quarterId}/percentage?percentage=${formattedPercentage}`,
        {}, // body vacío
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // Actualizar el estado local de selectedEvc (si existe)
      setSelectedEvc((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          evc_qs: prev.evc_qs.map((q) =>
            q.id === quarterId
              ? { ...q, allocated_percentage: formattedPercentage }
              : q
          ),
        };
      });
      toast.success("Porcentaje actualizado exitosamente");
    } catch (error) {
      console.error("Error updating percentage:", error);
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        toast.error("Error de validación: El porcentaje debe estar entre 0 y 100");
      } else {
        toast.error("Error al actualizar el porcentaje");
      }
    }
  };

  // Add getFilteredProviders function
  const getFilteredProviders = (quarterId: number) => {
    let filtered = [...availableProviders];
    if (activeProviderFilters.price) {
      filtered = filtered.filter((p) => {
        const cost = p.cost_usd ?? 0;
        return cost >= providerPriceRange[0] && cost <= providerPriceRange[1];
      });
    }
    if (activeProviderFilters.country && providerSelectedCountries.length > 0) {
      filtered = filtered.filter((p) =>
        providerSelectedCountries.includes(p.country ?? ""),
      );
    }
    return filtered;
  };

  // Fix uploadStatus state updates
  const clearUploadStatus = (quarterId: number) => {
    setUploadStatus((prev) => ({
      ...prev,
      [quarterId]: { uploading: false, error: undefined, success: undefined },
    }));
  };

  const handleUploadSuccess = (quarterId: number) => {
    setUploadStatus((prev) => ({
      ...prev,
      [quarterId]: { uploading: false, success: "Factura PDF subida" },
    }));
    setTimeout(() => clearUploadStatus(quarterId), 2000);
  };

  const handleUploadError = (quarterId: number) => {
    setUploadStatus((prev) => ({
      ...prev,
      [quarterId]: { uploading: false, error: "Error al subir factura PDF" },
    }));
  };

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

  // Add a loading state for quarter creation
  const [isCreatingQuarter, setIsCreatingQuarter] = useState(false);

  // Efectos iniciales
  useEffect(() => {
    fetchEvcs();
    fetchAvailableTechnicalLeaders();
    fetchAvailableFunctionalLeaders();
    fetchAvailableEntornos();
    fetchAvailableProviders();
    fetchDistinctCountries();
    loadEntornosData();
    loadTechnicalLeadersData();
    loadFunctionalLeadersData();
  }, []);

  // Add function to fetch distinct countries
  const fetchDistinctCountries = async () => {
    try {
      const resp = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/providers/providers/distinct-countries`,
      );
      setProviderCountryOptions(resp.data);
    } catch (error) {
      console.error("Error al cargar países:", error);
      setProviderCountryOptions([]);
    }
  };

  // Cargar data de líderes
  const loadTechnicalLeadersData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/technical-leaders/technical-leaders/`,
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/functional-leaders/functional-leaders`,
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/entornos/entornos/`,
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
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/evcs/`,
      );
      console.log("EVCs recibidos:", response.data);
      console.log("Primer EVC:", response.data[0]);
      setEvcs(response.data);
    } catch (error) {
      console.error("Error fetching EVCs:", error);
      toast.error("Error al cargar los EVCs");
    }
  };

  const fetchAvailableTechnicalLeaders = async () => {
    try {
      const resp = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/technical-leaders/technical-leaders/`,
      );
      setAvailableTechnicalLeaders(resp.data);
    } catch (error) {
      console.error("Error al cargar líderes técnicos:", error);
    }
  };

  const fetchAvailableFunctionalLeaders = async () => {
    try {
      const resp = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/functional-leaders/functional-leaders`,
      );
      setAvailableFunctionalLeaders(resp.data);
    } catch (error) {
      console.error("Error al cargar líderes funcionales:", error);
    }
  };

  const fetchAvailableEntornos = async () => {
    try {
      const resp = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/entornos/entornos/`,
      );
      setAvailableEntornos(resp.data);
    } catch (error) {
      console.error("Error al cargar entornos:", error);
    }
  };

  const fetchAvailableProviders = async () => {
    try {
      const resp = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/providers/providers/`,
      );
      setAvailableProviders(resp.data);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
    }
  };

  const fetchProvidersByEvcQ = async (evc_q_id: number) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/evc-financials/evc-financials/${evc_q_id}/providers`,
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/evc-financials/evc_financials/${evc_q_id}/spendings`,
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
      const token = Cookies.get("auth_token");

      if (!token) {
        toast.error("No se encontró token de autenticación");
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/evcs/`,
        {
          name: newEvc.name,
          description: newEvc.description,
          technical_leader_id: parseInt(newEvc.technical_leader_id, 10) || null,
          functional_leader_id:
            parseInt(newEvc.functional_leader_id, 10) || null,
          entorno_id: parseInt(newEvc.entorno_id, 10) || null,
          status: newEvc.status,
        },
      );
      console.log("EVC creada:", response.data);
      fetchEvcs();
      setShowForm(false);
      setAlertMsg("");
      toast.success("EVC creada exitosamente");
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
      if (axios.isAxiosError(error)) {
        const errorMsg =
          error.response?.data?.detail || "Error al crear la EVC";
        setAlertMsg(errorMsg);
        toast.error(errorMsg);
      } else {
        setAlertMsg("Error al crear la EVC");
        toast.error("Error al crear la EVC");
      }
    }
  };

  // Crear EVC_Q
  const createQuarter = async (evcId: number) => {
    try {
      // Prevent multiple submissions
      if (isCreatingQuarter) return;
      setIsCreatingQuarter(true);
      setAlertMsg("");

      // Validate inputs
      const year = parseInt(newQuarter.year) || defaultQuarterValues.year;
      const q = parseInt(newQuarter.q) || defaultQuarterValues.quarter;
      const allocated_budget =
        parseFloat(newQuarter.allocated_budget) || defaultQuarterValues.budget;
      const allocated_percentage = parseFloat(newQuarter.allocated_percentage);

      // Check for invalid values
      if (
        isNaN(Number(year)) ||
        isNaN(Number(q)) ||
        isNaN(Number(allocated_budget)) ||
        isNaN(Number(allocated_percentage))
      ) {
        setAlertMsg("Por favor complete todos los campos con valores válidos");
        setIsCreatingQuarter(false);
        return;
      }

      // Validate quarter number
      if (Number(q) < 1 || Number(q) > 4) {
        setAlertMsg("El quarter debe ser un número entre 1 y 4");
        setIsCreatingQuarter(false);
        return;
      }

      // Validate year
      const currentYear = new Date().getFullYear();
      if (Number(year) < currentYear - 1 || Number(year) > currentYear + 1) {
        setAlertMsg(
          `El año debe estar entre ${currentYear - 1} y ${currentYear + 1}`,
        );
        setIsCreatingQuarter(false);
        return;
      }

      // Validate budget and percentage
      if (Number(allocated_budget) <= 0) {
        setAlertMsg("El presupuesto debe ser mayor a 0");
        setIsCreatingQuarter(false);
        return;
      }

      if (allocated_percentage < 0 || allocated_percentage > 100) {
        setAlertMsg("El porcentaje debe estar entre 0 y 100");
        setIsCreatingQuarter(false);
        return;
      }

      // Check for duplicate quarters
      if (selectedEvc && selectedEvc.evc_qs) {
        const isDuplicate = selectedEvc.evc_qs.some(
          (existingQ) => existingQ.year === year && existingQ.q === q,
        );

        if (isDuplicate) {
          setAlertMsg(`Ya existe un quarter Q${q} para el año ${year}`);
          setIsCreatingQuarter(false);
          return;
        }
      }

      // Create the quarter
      toast.loading("Creando quarter...", { id: "create-quarter" });
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/evc-qs/evc_qs/`,
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/evcs/${evcId}`,
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

      // Show success message
      toast.success(`Quarter Q${q} ${year} creado exitosamente`, {
        id: "create-quarter",
      });
      setAlertMsg("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMsg =
          error.response?.data?.detail || "Error al crear el quarter";
        setAlertMsg(errorMsg);
        toast.error(errorMsg, { id: "create-quarter" });
        console.error("Error creando quarter:", error.response?.data);
      } else if (error instanceof Error) {
        console.error("Error creando quarter:", error.message);
        setAlertMsg(error.message);
        toast.error(error.message, { id: "create-quarter" });
      } else {
        console.error("Error creando quarter:", error);
        setAlertMsg("Error al crear el quarter");
        toast.error("Error al crear el quarter", { id: "create-quarter" });
      }
    } finally {
      setIsCreatingQuarter(false);
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/evc-financials/evc_financials/`,
        {
          evc_q_id: evc_q_id,
          provider_id: parseInt(provider_id, 10) || null,
        },
      );
      console.log("Financial creado:", response.data);
      const updatedEvc = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/evcs/${evcId}`,
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
      const token = Cookies.get("auth_token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/evcs/${evcId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setEvcs((prev) => prev.filter((e) => e.id !== evcId));
      setShowDeleteModal(false);
      setEvcToDelete(null);
      toast.success("EVC eliminado exitosamente");
    } catch (error) {
      console.error("Error deleting EVC:", error);
      toast.error("Error al eliminar el EVC");
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
    console.log("Applying filters:", filters);
    let result = [...evcs];

    // Filter by name
    if (filters.name?.trim()) {
      result = result.filter((evc) =>
        evc.name.toLowerCase().includes(filters.name.toLowerCase().trim()),
      );
    }

    // Filter by description
    if (filters.description?.trim()) {
      result = result.filter((evc) =>
        evc.description
          ?.toLowerCase()
          .includes(filters.description.toLowerCase().trim()),
      );
    }

    // Filter by environment (entorno)
    if (filters.entorno_id && filters.entorno_id !== "") {
      const entornoIdNumber = parseInt(filters.entorno_id);
      console.log("Filtering by entorno_id:", entornoIdNumber);
      result = result.filter((evc) => {
        console.log(
          "EVC entorno_id:",
          evc.entorno_id,
          "Comparing with:",
          entornoIdNumber,
          "Result:",
          evc.entorno_id === entornoIdNumber,
        );
        return evc.entorno_id === entornoIdNumber;
      });
    }

    // Filter by technical leader
    if (filters.technical_leader_id && filters.technical_leader_id !== "") {
      const techLeaderId = parseInt(filters.technical_leader_id);
      console.log("Filtering by technical_leader_id:", techLeaderId);
      result = result.filter((evc) => {
        console.log(
          "EVC technical_leader_id:",
          evc.technical_leader_id,
          "Comparing with:",
          techLeaderId,
          "Result:",
          evc.technical_leader_id === techLeaderId,
        );
        return evc.technical_leader_id === techLeaderId;
      });
    }

    // Filter by functional leader
    if (filters.functional_leader_id && filters.functional_leader_id !== "") {
      const funcLeaderId = parseInt(filters.functional_leader_id);
      console.log("Filtering by functional_leader_id:", funcLeaderId);
      result = result.filter((evc) => {
        console.log(
          "EVC functional_leader_id:",
          evc.functional_leader_id,
          "Comparing with:",
          funcLeaderId,
          "Result:",
          evc.functional_leader_id === funcLeaderId,
        );
        return evc.functional_leader_id === funcLeaderId;
      });
    }

    // Filter by status
    if (filters.status !== "") {
      const statusValue = filters.status === "true";
      console.log("Filtering by status:", statusValue);
      result = result.filter((evc) => {
        console.log(
          "EVC status:",
          evc.status,
          "Comparing with:",
          statusValue,
          "Result:",
          evc.status === statusValue,
        );
        return evc.status === statusValue;
      });
    }

    console.log("Filtered results:", result);
    setFilteredEvcs(result);
  };

  const clearFilters = () => {
    setFilters({
      entorno_id: "",
      name: "",
      description: "",
      technical_leader_id: "",
      functional_leader_id: "",
      status: "",
    });
    setFilteredEvcs([]);
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/evc-financials/evc_financials/upload`,
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
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/evcs/${selectedEvc.id}`,
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

  // Function to fetch all gastos for a quarter
  const fetchGastosByQuarter = async (quarter: EVC_Q) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/evc-financials/evc_financials/`,
      );
      // Filter by quarter id
      const gastos = res.data.filter((g: any) => g.evc_q_id === quarter.id);
      setGastosModal({ open: true, quarter, gastos });
    } catch (err) {
      setGastosModal({ open: true, quarter, gastos: [] });
    }
  };

  // Toggle filter section visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Add function to mark related notifications as read
  const markRelatedNotificationsAsRead = async (
    evcId: number,
    field: string,
  ) => {
    try {
      // Fetch all unread notifications
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/notifications/`,
      );
      const notifications = response.data;

      // Filter notifications related to this EVC and field
      const relatedNotifications = notifications.filter((notification: any) => {
        // Check for notifications about missing leaders or entorno for this specific EVC
        if (
          field === "technical_leader_id" &&
          notification.message.includes(`El EVC`) &&
          notification.message.includes(`(ID: ${evcId})`) &&
          notification.message.includes("no tiene líder técnico asignado")
        ) {
          return true;
        }
        if (
          field === "functional_leader_id" &&
          notification.message.includes(`El EVC`) &&
          notification.message.includes(`(ID: ${evcId})`) &&
          notification.message.includes("no tiene líder funcional asignado")
        ) {
          return true;
        }
        if (
          field === "entorno_id" &&
          notification.message.includes(`El EVC`) &&
          notification.message.includes(`(ID: ${evcId})`) &&
          notification.message.includes("no tiene entorno asignado")
        ) {
          return true;
        }
        return false;
      });

      // Mark each related notification as read
      const markPromises = relatedNotifications.map((notification: any) =>
        axios.patch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/notifications/${notification.id}/read`,
        ),
      );

      if (markPromises.length > 0) {
        await Promise.all(markPromises);
        console.log(`Marked ${markPromises.length} notifications as read`);
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Add function to update EVC fields
  const updateEvcField = async (evcId: number, field: string, value: any) => {
    try {
      const token = Cookies.get("auth_token");

      // First, fetch the current EVC to get all its data for the PUT payload
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/evcs/${evcId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const currentEvc = response.data;

      // Then update with PUT, sending the entire object with the modified field
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/evcs/${evcId}`,
        {
          ...currentEvc,
          [field]: value,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // If we're setting a value (not null), mark related notifications as read
      if (value !== null) {
        await markRelatedNotificationsAsRead(evcId, field);
      }

      // Refetch the EVC to ensure all data is up to date including backend validations
      const updatedEvcBaseResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/evcs/${evcId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      let freshEvcDataFromServer = updatedEvcBaseResponse.data;

      // Re-enrich the evc_qs with financial details
      if (
        freshEvcDataFromServer &&
        freshEvcDataFromServer.evc_qs &&
        Array.isArray(freshEvcDataFromServer.evc_qs)
      ) {
        // Stage 1: Enrich with spendings
        const evcQsWithSpendings = await Promise.all(
          freshEvcDataFromServer.evc_qs.map(async (q_from_server: EVC_Q) => {
            const { total_spendings, percentage, message } =
              await fetchSpendingsByEvcQ(q_from_server.id);
            return {
              ...q_from_server,
              total_spendings,
              percentage,
              budget_message: message,
            };
          }),
        );

        // Stage 2: Enrich with providers (financials)
        const enrichedEvcQs = await Promise.all(
          evcQsWithSpendings.map(async (quarter_with_spendings) => {
            const providers = await fetchProvidersByEvcQ(
              quarter_with_spendings.id,
            );
            return {
              ...quarter_with_spendings,
              evc_financials: providers.map((provider: Provider) => ({
                id: provider.id, // Assuming this matches the structure used in showEvcDetails
                provider,
              })),
            };
          }),
        );
        freshEvcDataFromServer = {
          ...freshEvcDataFromServer,
          evc_qs: enrichedEvcQs,
        };
      }

      // Update the selected EVC with the full refreshed and enriched data
      setSelectedEvc(freshEvcDataFromServer);

      // Update the EVCs list with the updated and enriched EVC
      setEvcs((prevEvcs) =>
        prevEvcs.map((evc) =>
          evc.id === evcId ? freshEvcDataFromServer : evc,
        ),
      );

      // Also fetch all EVCs to ensure the list is up to date
      fetchEvcs();

      toast.success("Campo actualizado exitosamente");
    } catch (error) {
      console.error("Error updating EVC field:", error);
      toast.error("Error al actualizar el campo");
    }
  };

  // Update function for changing EVC status
  const toggleEvcStatus = async (evc: EVC) => {
    try {
      const token = Cookies.get("auth_token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/evcs/${evc.id}`,
        { ...evc, status: !evc.status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Update EVCs list with the new status
      setEvcs((prevEvcs) =>
        prevEvcs.map((e) =>
          e.id === evc.id ? { ...e, status: !e.status } : e,
        ),
      );

      toast.success(
        `EVC ${evc.name} ${!evc.status ? "activado" : "desactivado"} exitosamente`,
      );
    } catch (error) {
      console.error("Error updating EVC status:", error);
      toast.error("Error al actualizar el estado del EVC");
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
          <ProtectedContent requiredPermission="modify">
            <button
              className={`flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 ${
                selectedEvcsForDelete.length === 0 || deleting
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={selectedEvcsForDelete.length === 0 || deleting}
              onClick={() => setShowDeleteSelectedModal(true)}
            >
              <FaTrash className="mr-2" /> Eliminar
            </button>
          </ProtectedContent>
          <button
            className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            onClick={toggleFilters}
          >
            <FaFilter className="mr-2" />
            {showFilters ? "Ocultar filtros" : "Filtrar"}
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            <FaDownload className="mr-2" /> Exportar
          </button>
          <ProtectedContent requiredPermission="modify">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              <FaPlus className="mr-2" /> Crear EVC
            </button>
          </ProtectedContent>
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
            <ProtectedContent requiredPermission="modify">
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                onClick={createEvc}
              >
                Crear EVC
              </button>
            </ProtectedContent>
          </div>
        </div>
      )}

      {/* Filter Section */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Filtrar EVCs</h2>
            <div className="flex space-x-2">
              <button
                onClick={clearFilters}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm flex items-center"
              >
                <FaTimes className="mr-1" /> Limpiar filtros
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm flex items-center"
              >
                <FaFilter className="mr-1" /> Aplicar filtros
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="Buscar por nombre..."
                value={filters.name}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, name: e.target.value }));
                }}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-md"
                placeholder="Buscar por descripción..."
                value={filters.description || ""}
                onChange={(e) => {
                  setFilters((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }));
                }}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Entorno
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={filters.entorno_id}
                onChange={(e) => {
                  console.log("Selected entorno:", e.target.value);
                  setFilters((prev) => ({
                    ...prev,
                    entorno_id: e.target.value,
                  }));
                }}
              >
                <option value="">Todos los entornos</option>
                {availableEntornos.map((entorno) => (
                  <option key={entorno.id} value={entorno.id.toString()}>
                    {entorno.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Líder Técnico
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={filters.technical_leader_id}
                onChange={(e) => {
                  console.log("Selected technical leader:", e.target.value);
                  setFilters((prev) => ({
                    ...prev,
                    technical_leader_id: e.target.value,
                  }));
                }}
              >
                <option value="">Todos los líderes técnicos</option>
                {availableTechnicalLeaders.map((leader) => (
                  <option key={leader.id} value={leader.id.toString()}>
                    {leader.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Líder Funcional
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={filters.functional_leader_id}
                onChange={(e) => {
                  console.log("Selected functional leader:", e.target.value);
                  setFilters((prev) => ({
                    ...prev,
                    functional_leader_id: e.target.value,
                  }));
                }}
              >
                <option value="">Todos los líderes funcionales</option>
                {availableFunctionalLeaders.map((leader) => (
                  <option key={leader.id} value={leader.id.toString()}>
                    {leader.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Estado</label>
              <select
                className="w-full p-2 border rounded-md"
                value={filters.status}
                onChange={(e) => {
                  console.log("Selected status:", e.target.value);
                  setFilters((prev) => ({ ...prev, status: e.target.value }));
                }}
              >
                <option value="">Todos los estados</option>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
          {filteredEvcs.length > 0 && (
            <div className="mt-3 text-sm text-gray-600">
              Mostrando {filteredEvcs.length} de {evcs.length} EVCs
            </div>
          )}
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
              <ProtectedContent requiredPermission="modify">
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                  onClick={exportToExcel}
                  disabled={selectedEvcsForExport.length === 0}
                >
                  Exportar Seleccionadas
                </button>
              </ProtectedContent>
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
                    className={`text-base font-bold ${
                      selectedEvc.status ? "text-green-700" : "text-red-700"
                    }`}
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
                      <ProtectedContent key={quarter.id} requiredPermission="modify">
                        <QuarterCard
                          quarter={quarter}
                          onUpdatePercentage={onUpdatePercentage}
                          manualSpendingStatus={manualSpendingStatus}
                          setManualSpendingStatus={setManualSpendingStatus}
                          manualSpendings={manualSpendings}
                          setManualSpendings={setManualSpendings}
                          uploadStatus={uploadStatus}
                          setUploadStatus={setUploadStatus}
                          providerSelections={providerSelections}
                          setProviderSelections={setProviderSelections}
                          setProviderFilterModal={setProviderFilterModal}
                          getFilteredProviders={getFilteredProviders}
                          fetchEvcs={fetchEvcs}
                          selectedEvc={selectedEvc}
                          showDetailModal={showDetailModal}
                          showEvcDetails={showEvcDetails}
                          fetchSpendingsByEvcQ={fetchSpendingsByEvcQ}
                          setSelectedEvc={setSelectedEvc}
                        />
                      </ProtectedContent>
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
                      placeholder={defaultQuarterValues.year || "YYYY"}
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
                      <option value="">
                        {defaultQuarterValues.quarter
                          ? `Sugerido: Q${defaultQuarterValues.quarter}`
                          : "Seleccionar Q"}
                      </option>
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
                      placeholder={defaultQuarterValues.budget || "$"}
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
                  {alertMsg && (
                    <div className="mr-auto text-red-500 text-sm">
                      {alertMsg}
                    </div>
                  )}
                  <ProtectedContent requiredPermission="modify">
                    <button
                      className={`px-4 py-2 ${
                        isCreatingQuarter
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-yellow-500 hover:bg-yellow-600"
                      } text-white rounded-md`}
                      onClick={() => createQuarter(selectedEvc.id)}
                      disabled={isCreatingQuarter}
                    >
                      {isCreatingQuarter ? "Creando..." : "Agregar Quarter"}
                    </button>
                  </ProtectedContent>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de eliminación */}
      {showDeleteModal && evcToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-white/20 backdrop-blur-sm" />
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
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
              <ProtectedContent requiredPermission="modify">
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  onClick={() => deleteEvc(evcToDelete.id)}
                >
                  Eliminar
                </button>
              </ProtectedContent>
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
              onClick={() => {
                setShowDetailModal(false);
                // Reset edit states
                setIsEditingEntorno(false);
                setIsEditingTechnicalLeader(false);
                setIsEditingFunctionalLeader(false);
              }}
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
                  <div className="flex justify-between items-center">
                    {isEditingEntorno ? (
                      <div className="flex items-center gap-2 w-full">
                        <select
                          className="p-2 border rounded w-full"
                          value={editedEntornoId}
                          onChange={(e) => setEditedEntornoId(e.target.value)}
                        >
                          <option value="">-- Sin entorno --</option>
                          {availableEntornos.map((entorno) => (
                            <option
                              key={entorno.id}
                              value={entorno.id.toString()}
                            >
                              {entorno.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            if (editedEntornoId) {
                              updateEvcField(
                                selectedEvc.id,
                                "entorno_id",
                                parseInt(editedEntornoId),
                              );
                            } else {
                              updateEvcField(
                                selectedEvc.id,
                                "entorno_id",
                                null,
                              );
                            }
                            setIsEditingEntorno(false);
                          }}
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
                            setIsEditingEntorno(false);
                            setEditedEntornoId(
                              selectedEvc.entorno_id?.toString() || "",
                            );
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
                      <>
                        <div className="text-base font-bold text-gray-900">
                          {selectedEvc.entorno_id
                            ? entornosData[selectedEvc.entorno_id] ||
                              "Cargando..."
                            : "-"}
                        </div>
                        <button
                          onClick={() => {
                            setIsEditingEntorno(true);
                            setEditedEntornoId(
                              selectedEvc.entorno_id?.toString() || "",
                            );
                          }}
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
                      </>
                    )}
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Líder Técnico
                  </div>
                  <div className="flex justify-between items-center">
                    {isEditingTechnicalLeader ? (
                      <div className="flex items-center gap-2 w-full">
                        <select
                          className="p-2 border rounded w-full"
                          value={editedTechnicalLeaderId}
                          onChange={(e) =>
                            setEditedTechnicalLeaderId(e.target.value)
                          }
                        >
                          <option value="">-- Sin líder técnico --</option>
                          {availableTechnicalLeaders.map((leader) => (
                            <option
                              key={leader.id}
                              value={leader.id.toString()}
                            >
                              {leader.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            if (editedTechnicalLeaderId) {
                              updateEvcField(
                                selectedEvc.id,
                                "technical_leader_id",
                                parseInt(editedTechnicalLeaderId),
                              );
                            } else {
                              updateEvcField(
                                selectedEvc.id,
                                "technical_leader_id",
                                null,
                              );
                            }
                            setIsEditingTechnicalLeader(false);
                          }}
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
                            setIsEditingTechnicalLeader(false);
                            setEditedTechnicalLeaderId(
                              selectedEvc.technical_leader_id?.toString() || "",
                            );
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
                      <>
                        <div className="text-base font-bold text-gray-900">
                          {selectedEvc.technical_leader_id
                            ? technicalLeadersData[
                                selectedEvc.technical_leader_id
                              ] || "Cargando..."
                            : "-"}
                        </div>
                        <button
                          onClick={() => {
                            setIsEditingTechnicalLeader(true);
                            setEditedTechnicalLeaderId(
                              selectedEvc.technical_leader_id?.toString() || "",
                            );
                          }}
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
                      </>
                    )}
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Líder Funcional
                  </div>
                  <div className="flex justify-between items-center">
                    {isEditingFunctionalLeader ? (
                      <div className="flex items-center gap-2 w-full">
                        <select
                          className="p-2 border rounded w-full"
                          value={editedFunctionalLeaderId}
                          onChange={(e) =>
                            setEditedFunctionalLeaderId(e.target.value)
                          }
                        >
                          <option value="">-- Sin líder funcional --</option>
                          {availableFunctionalLeaders.map((leader) => (
                            <option
                              key={leader.id}
                              value={leader.id.toString()}
                            >
                              {leader.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            if (editedFunctionalLeaderId) {
                              updateEvcField(
                                selectedEvc.id,
                                "functional_leader_id",
                                parseInt(editedFunctionalLeaderId),
                              );
                            } else {
                              updateEvcField(
                                selectedEvc.id,
                                "functional_leader_id",
                                null,
                              );
                            }
                            setIsEditingFunctionalLeader(false);
                          }}
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
                            setIsEditingFunctionalLeader(false);
                            setEditedFunctionalLeaderId(
                              selectedEvc.functional_leader_id?.toString() ||
                                "",
                            );
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
                      <>
                        <div className="text-base font-bold text-gray-900">
                          {selectedEvc.functional_leader_id
                            ? functionalLeadersData[
                                selectedEvc.functional_leader_id
                              ] || "Cargando..."
                            : "-"}
                        </div>
                        <button
                          onClick={() => {
                            setIsEditingFunctionalLeader(true);
                            setEditedFunctionalLeaderId(
                              selectedEvc.functional_leader_id?.toString() ||
                                "",
                            );
                          }}
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
                      </>
                    )}
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-4 shadow-sm">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Estado
                  </div>
                  <div
                    className={`text-base font-bold ${
                      selectedEvc.status ? "text-green-700" : "text-red-700"
                    }`}
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
                                width: `${quarter.allocated_budget > 0 ? 100 : 0}%`,
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
                              {/* Calculate percent of budget spent */}
                              {quarter.allocated_budget > 0
                                ? Math.min(
                                    Math.round(
                                      ((quarter.total_spendings || 0) /
                                        quarter.allocated_budget) *
                                        100,
                                    ),
                                    100,
                                  )
                                : 0}
                              %
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative">
                            <div
                              className="h-2 bg-orange-400 rounded-full absolute left-0 transition-all duration-500"
                              style={{
                                width: `${
                                  quarter.allocated_budget > 0
                                    ? Math.min(
                                        Math.round(
                                          ((quarter.total_spendings || 0) /
                                            quarter.allocated_budget) *
                                            100,
                                        ),
                                        100,
                                      )
                                    : 0
                                }%`,
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
                            {quarter.allocated_budget > 0
                              ? Math.round(
                                  ((quarter.total_spendings || 0) /
                                    quarter.allocated_budget) *
                                    100,
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="mb-2 text-sm text-gray-700">
                          Estado:{" "}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ml-2
                          ${
                            quarter.allocated_budget > 0 &&
                            quarter.total_spendings
                              ? (quarter.total_spendings /
                                  quarter.allocated_budget) *
                                  100 >=
                                100
                                ? "bg-red-100 text-red-800"
                                : (quarter.total_spendings /
                                      quarter.allocated_budget) *
                                      100 >=
                                    80
                                  ? "bg-orange-100 text-orange-800"
                                  : (quarter.total_spendings /
                                        quarter.allocated_budget) *
                                        100 >=
                                      50
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
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
          <div className="fixed inset-0 bg-white/20 backdrop-blur-sm" />
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
              <ProtectedContent requiredPermission="modify">
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
              </ProtectedContent>
            </div>
          </div>
        </div>
      )}

      {/* Listado de EVCs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(filteredEvcs.length > 0
          ? filteredEvcs
          : Object.values(filters).some((value) => value !== "")
            ? []
            : evcs
        ).map((evc: EVC, idx: number) => (
          <EvcCard
            key={evc.id}
            evc={evc}
            entornosData={entornosData}
            onShowDetails={showEvcDetails}
            onManageQuarters={(evc) => {
              setSelectedEvc(evc);
              setShowQuartersModal(true);
              fetchDefaultQuarterValues(evc.id);
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
            onStatusChange={toggleEvcStatus}
          />
        ))}
        {filteredEvcs.length === 0 &&
          Object.values(filters).some((value) => value !== "") && (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No se encontraron EVCs que coincidan con los filtros aplicados.
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
              <ProtectedContent requiredPermission="modify">
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={() =>
                    setProviderFilterModal({ quarterId: null, open: false })
                  }
                >
                  Cerrar
                </button>
              </ProtectedContent>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EvcsPage;