"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/Checkbox";
import axios from 'axios';
import Cookies from 'js-cookie';

interface BudgetPocket {
  id: number;
  year: number;
  entorno_id: number;
  agreed_value: number;
  status: boolean;
  is_available: boolean;
  total_allocated: number;
  entorno: {
    name: string;
  };
}

interface BudgetAllocation {
  id: number;
  budget_pocket_id: number;
  evc_id: number;
  allocation_date: string;
  allocated_value: number;
  comments: string | null;
  created_at: string;
  updated_at: string;
  evc: {
    name: string;
  };
}

interface Entorno {
  id: number;
  name: string;
}

export default function BudgetPocketPage() {
  const router = useRouter();
  const [budgetPockets, setBudgetPockets] = useState<BudgetPocket[]>([]);
  const [allocations, setAllocations] = useState<Record<number, BudgetAllocation[]>>({});
  const [entornos, setEntornos] = useState<Entorno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPockets, setSelectedPockets] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    entorno_id: "",
    agreed_value: "",
    status: true,
  });

  useEffect(() => {
    fetchBudgetPockets();
    fetchEntornos();
  }, []);

  const fetchBudgetPockets = async () => {
    try {
      const token = Cookies.get('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      console.log('API URL:', apiUrl);
      console.log('Token:', token);
      
      if (!apiUrl) {
        throw new Error('API URL is not configured');
      }
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${apiUrl}/budget-pockets`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Response:', response.data);
      setBudgetPockets(response.data);
      
      // Fetch allocations for each budget pocket
      const allocationsData: Record<number, BudgetAllocation[]> = {};
      for (const pocket of response.data) {
        try {
          const allocResponse = await axios.get(
            `${apiUrl}/budget-allocations/pocket/${pocket.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          allocationsData[pocket.id] = allocResponse.data;
        } catch (error) {
          console.error(`Error fetching allocations for pocket ${pocket.id}:`, error);
        }
      }
      setAllocations(allocationsData);
    } catch (error: any) {
      console.error("Error fetching budget pockets:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        toast.error(`Error al cargar las bolsas presupuestales: ${error.response.data.detail || error.response.status}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Request error:', error.request);
        toast.error('No se pudo conectar con el servidor. Por favor, verifique su conexión.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEntornos = async () => {
    try {
      const token = Cookies.get('auth_token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/entornos/entornos/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEntornos(response.data);
    } catch (error) {
      console.error("Error fetching entornos:", error);
      toast.error("Error al cargar los entornos");
    }
  };

  const calculateTotalAllocated = (pocketId: number) => {
    const pocketAllocations = allocations[pocketId] || [];
    return pocketAllocations.reduce((sum, allocation) => sum + allocation.allocated_value, 0);
  };

  const handleCreatePocket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = Cookies.get('auth_token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/budget-pockets/`,
        {
          ...formData,
          entorno_id: parseInt(formData.entorno_id),
          agreed_value: parseFloat(formData.agreed_value),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast.success("Bolsa presupuestal creada exitosamente");
      setIsDialogOpen(false);
      setFormData({
        year: new Date().getFullYear(),
        entorno_id: "",
        agreed_value: "",
        status: true,
      });
      fetchBudgetPockets();
    } catch (error) {
      console.error("Error creating budget pocket:", error);
      toast.error("Error al crear la bolsa presupuestal");
    }
  };

  const handleDeletePockets = async () => {
    if (!selectedPockets.length) {
      toast.error("Seleccione al menos una bolsa para eliminar");
      return;
    }

    if (!confirm(`¿Está seguro de eliminar ${selectedPockets.length} bolsa(s) presupuestal(es)?`)) {
      return;
    }

    try {
      const token = Cookies.get('auth_token');
      for (const pocketId of selectedPockets) {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/budget-pockets/${pocketId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }
      
      toast.success("Bolsas presupuestales eliminadas exitosamente");
      setSelectedPockets([]);
      fetchBudgetPockets();
    } catch (error) {
      console.error("Error deleting budget pockets:", error);
      toast.error("Error al eliminar las bolsas presupuestales");
    }
  };

  const togglePocketSelection = (pocketId: number) => {
    setSelectedPockets(prev => 
      prev.includes(pocketId) 
        ? prev.filter(id => id !== pocketId)
        : [...prev, pocketId]
    );
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-12 mt-8">
        <h1 className="text-3xl font-bold">Bolsas Presupuestales</h1>
        <div className="flex gap-4">
          {selectedPockets.length > 0 && (
            <button
              onClick={handleDeletePockets}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
            >
              Eliminar Seleccionados
            </button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-400 text-white hover:bg-blue-500 h-10 px-4 py-2">
                Nueva Bolsa Presupuestal
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Bolsa Presupuestal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePocket} className="space-y-4">
                <div>
                  <Label htmlFor="year">Año</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="entorno">Entorno</Label>
                  <Select
                    value={formData.entorno_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, entorno_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un entorno" />
                    </SelectTrigger>
                    <SelectContent className="absolute z-[1000] bg-white border rounded-md shadow-lg">
                      {entornos.map((entorno) => (
                        <SelectItem key={entorno.id} value={entorno.id.toString()}>
                          {entorno.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="agreed_value">Valor Acordado</Label>
                  <Input
                    id="agreed_value"
                    type="number"
                    value={formData.agreed_value}
                    onChange={(e) =>
                      setFormData({ ...formData, agreed_value: e.target.value })
                    }
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-400 text-white py-2 px-4 rounded-md hover:bg-blue-500 transition-colors"
                >
                  Crear Bolsa Presupuestal
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedPockets.length === budgetPockets.length}
                  onChange={() => {
                    if (selectedPockets.length === budgetPockets.length) {
                      setSelectedPockets([]);
                    } else {
                      setSelectedPockets(budgetPockets.map(p => p.id));
                    }
                  }}
                />
              </TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Entorno</TableHead>
              <TableHead>Valor Acordado</TableHead>
              <TableHead>Total Asignado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgetPockets.map((pocket) => (
              <TableRow key={pocket.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedPockets.includes(pocket.id)}
                    onChange={() => togglePocketSelection(pocket.id)}
                  />
                </TableCell>
                <TableCell>{pocket.year}</TableCell>
                <TableCell>{pocket.entorno.name}</TableCell>
                <TableCell>${pocket.agreed_value.toLocaleString()}</TableCell>
                <TableCell>${calculateTotalAllocated(pocket.id).toLocaleString()}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      pocket.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {pocket.status ? "Activo" : "Inactivo"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/asignacion-presupuestal/${pocket.id}`)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Ver Detalles
                    </button>
                    {pocket.is_available && (
                      <button
                        onClick={() => router.push(`/asignacion-presupuestal/${pocket.id}?allocate=true`)}
                        className="text-green-500 hover:text-green-700"
                      >
                        Asignar
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
