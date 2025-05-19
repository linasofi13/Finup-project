"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { ArrowLeft } from "lucide-react";

interface BudgetPocket {
  id: number;
  year: number;
  agreed_value: number;
  total_allocated: number;
  is_available: boolean;
  entorno: {
    name: string;
  };
}

interface EVC {
  id: number;
  name: string;
}

interface BudgetAllocation {
  id: number;
  allocated_value: number;
  is_total_allocation: boolean;
  evc: EVC;
  evc_id: number;
  created_at: string;
  comments?: string;
  quarter?: number;
  year?: number;
}

export default function BudgetAllocationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const router = useRouter();
  const [budgetPocket, setBudgetPocket] = useState<BudgetPocket | null>(null);
  const [evcs, setEvcs] = useState<EVC[]>([]);
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(
    searchParams.get("allocate") === "true",
  );
  const [formData, setFormData] = useState({
    evc_id: "",
    allocated_value: "",
    comments: "",
  });
  const [selectedEvc, setSelectedEvc] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [isTotalAllocation, setIsTotalAllocation] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );

  useEffect(() => {
    if (id) {
      fetchBudgetPocket();
      fetchEvcs();
      fetchAllocations();
    }
  }, [id]);

  const fetchBudgetPocket = async () => {
    try {
      const token = Cookies.get("auth_token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/budget-pockets/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setBudgetPocket(response.data);
    } catch (error) {
      console.error("Error fetching budget pocket:", error);
      toast.error("Error al cargar la bolsa presupuestal");
    }
  };

  const fetchAllocations = async () => {
    try {
      const token = Cookies.get("auth_token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/budget-allocations/pocket/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setAllocations(response.data);
    } catch (error: any) {
      console.error("Error fetching allocations:", error);
      if (error.response?.status === 404) {
        // If no allocations exist yet, set empty array
        setAllocations([]);
      } else {
        toast.error("Error al cargar las asignaciones");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEvcs = async () => {
    try {
      const token = Cookies.get("auth_token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/evcs/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setEvcs(response.data);
    } catch (error) {
      console.error("Error fetching EVCs:", error);
      toast.error("Error al cargar los EVCs");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedEvc ||
      (!amount && !isTotalAllocation) ||
      !budgetPocket ||
      !selectedQuarter
    ) {
      toast.error("Por favor complete todos los campos");
      return;
    }

    try {
      const token = Cookies.get("auth_token");
      const allocationDataForPocket = {
        budget_pocket_id: parseInt(id),
        evc_id: selectedEvc,
        allocated_value: isTotalAllocation
          ? budgetPocket.agreed_value - totalAllocated
          : parseFloat(amount),
        is_total_allocation: isTotalAllocation,
        comments: formData.comments,
      };

      const allocationDataForEvcQs = {
        evc_id: selectedEvc,
        year: selectedYear,
        q: selectedQuarter,
        allocated_budget: isTotalAllocation
          ? budgetPocket.agreed_value - totalAllocated
          : parseFloat(amount),
        allocated_percentage: 0, // This can be updated later if needed
      };

      // First create the budget allocation
      const allocationResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/budget-pockets/${id}/allocate`,
        allocationDataForPocket,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Then create/update the EVC_Q with the allocated budget
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/evc-qs/evc_qs/`,
        allocationDataForEvcQs,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Asignación creada exitosamente");
      setIsDialogOpen(false);
      setSelectedEvc(null);
      setAmount("");
      setIsTotalAllocation(false);
      setSelectedQuarter(0);
      setFormData({
        evc_id: "",
        allocated_value: "",
        comments: "",
      });
      fetchBudgetPocket();
      fetchAllocations();
    } catch (error: any) {
      console.error("Error creating allocation:", error);
      toast.error(
        error.response?.data?.detail || "Error al crear la asignación",
      );
    }
  };

  const toggleAvailability = async () => {
    if (!budgetPocket) return;

    try {
      const token = Cookies.get("auth_token");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/budget-pockets/${id}`,
        {
          is_available: !budgetPocket.is_available,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success("Disponibilidad actualizada exitosamente");
      fetchBudgetPocket();
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Error al actualizar la disponibilidad");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Cargando...
      </div>
    );
  }

  if (!budgetPocket) {
    return (
      <div className="text-center text-red-500">
        Bolsillo presupuestal no encontrado
      </div>
    );
  }

  const totalAllocated = allocations.reduce(
    (sum, allocation) => sum + allocation.allocated_value,
    0,
  );
  const remainingBudget = budgetPocket.agreed_value - totalAllocated;

  // Group allocations by EVC and calculate totals
  const evcAllocations = allocations.reduce(
    (acc, allocation) => {
      const evcId = allocation.evc_id;
      if (!acc[evcId]) {
        acc[evcId] = {
          name: allocation.evc.name,
          total: 0,
          allocations: [],
        };
      }
      acc[evcId].total += allocation.allocated_value;
      acc[evcId].allocations.push(allocation);
      return acc;
    },
    {} as Record<
      number,
      { name: string; total: number; allocations: BudgetAllocation[] }
    >,
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8"></div>
      <div className="flex items-center mb-12">
        <button
          onClick={() => router.push("/asignacion-presupuestal")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-300 text-white rounded-lg hover:bg-blue-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver a la lista</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Bolsillo Presupuestal {budgetPocket.year} -{" "}
            {budgetPocket.entorno.name}
          </h1>
          <button
            onClick={toggleAvailability}
            className={`px-4 py-2 rounded-md ${
              budgetPocket.is_available
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-500 hover:bg-red-600"
            } text-white transition-colors`}
          >
            {budgetPocket.is_available ? "Disponible" : "No Disponible"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Presupuesto Total
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              ${budgetPocket.agreed_value.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Total Asignado
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              ${totalAllocated.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Presupuesto Restante
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              ${remainingBudget.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Asignaciones Actuales
            </h2>
            {budgetPocket.is_available && (
              <button
                onClick={() => setIsDialogOpen(true)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Nueva Asignación
              </button>
            )}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva Asignación de Presupuesto</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="evc">EVC</Label>
                  <Select
                    value={selectedEvc?.toString() || ""}
                    onValueChange={(value) => setSelectedEvc(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un EVC" />
                    </SelectTrigger>
                    <SelectContent className="absolute z-[1000] bg-white border rounded-md shadow-lg">
                      {evcs.map((evc) => (
                        <SelectItem key={evc.id} value={evc.id.toString()}>
                          {evc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="year">Año</Label>
                  <Input
                    id="year"
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="quarter">Quarter</Label>
                  <Select
                    value={selectedQuarter.toString()}
                    onValueChange={(value) =>
                      setSelectedQuarter(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un Quarter" />
                    </SelectTrigger>
                    <SelectContent className="absolute z-[1000] bg-white border rounded-md shadow-lg">
                      <SelectItem value="1">Q1</SelectItem>
                      <SelectItem value="2">Q2</SelectItem>
                      <SelectItem value="3">Q3</SelectItem>
                      <SelectItem value="4">Q4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Monto a Asignar</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setAmount(e.target.value)
                      }
                      disabled={isTotalAllocation}
                      placeholder="Ingrese el monto"
                      required={!isTotalAllocation}
                    />
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="total_allocation"
                        checked={isTotalAllocation}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setIsTotalAllocation(e.target.checked);
                          if (e.target.checked) setAmount("");
                        }}
                      />
                      <Label htmlFor="total_allocation">
                        Asignar todo el disponible
                      </Label>
                    </div>
                  </div>
                  {isTotalAllocation && (
                    <p className="text-sm text-gray-500 mt-1">
                      Monto disponible: $
                      {(
                        budgetPocket!.agreed_value -
                        totalAllocated
                      ).toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="comments">Comentarios</Label>
                  <Textarea
                    id="comments"
                    value={formData.comments}
                    onChange={(e) =>
                      setFormData({ ...formData, comments: e.target.value })
                    }
                    placeholder="Ingrese comentarios sobre la asignación"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Crear Asignación
                </button>
              </form>
            </DialogContent>
          </Dialog>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EVC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Asignado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allocations.map((allocation) => (
                  <tr key={allocation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {allocation.evc.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${allocation.allocated_value.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {allocation.is_total_allocation ? "Total" : "Parcial"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(allocation.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
