"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Wrench,
  Package,
  Shield,
  FileText,
  Plus,
  Minus,
  Save,
  Loader2,
  AlertCircle,
  BrushCleaning,
  X,
} from "lucide-react";
import AddItemModal from "@/components/app-addItemModal";
import { useRouter } from "next/navigation";
import AppSelectModel from "@/components/app-selectModel";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Service {
  id?: number;
  type: string;
  ps: string;
  start_date: string;
  end_date: string;
  responsible: string;
  status: string;
  created_at?: string;
}

interface Team {
  id: number;
  name: string;
  position: string;
  primary_contact?: string;
  secondary_contact?: string;
}

interface Material {
  id: number;
  name: string;
  quantity?: number;
  unity_of_measure: string;
}

interface Equipment {
  id: number;
  name: string;
  description: string;
}

interface EPI {
  id: number;
  name: string;
  description: string;
}

interface Procedure {
  id: number;
  name: string;
  description: string;
  estimated_time: number;
  ps: string;
}

interface SelectedProcedure extends Procedure {
  execution_order: number;
}

interface SelectedMaterial extends Material {
  quantity: number;
}

interface SelectedEPI extends EPI {
  quantity: number;
}

interface ServiceFormData {
  type: string;
  ps: string;
  start_date: string;
  end_date: string;
  responsible: string;
  status: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const ServiceOrderForm: React.FC = () => {
  const [formData, setFormData] = useState<ServiceFormData>({
    type: "",
    ps: "",
    start_date: "",
    end_date: "",
    responsible: "",
    status: "",
  });

  const [filteredProcedures, setFilteredProcedures] = useState<Procedure[]>([]);

  const [selectedTeam, setSelectedTeam] = useState<Team[]>([]);
  const [selectedProcedures, setSelectedProcedures] = useState<
    SelectedProcedure[]
  >([]);
  const [selectedMaterials, setSelectedMaterials] = useState<
    SelectedMaterial[]
  >([]);
  const [selectedEquipments, setSelectedEquipments] = useState<Equipment[]>([]);
  const [selectedEPI, setSelectedEPI] = useState<SelectedEPI[]>([]);
  const [observations, setObservations] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [availableTeam, setAvailableTeam] = useState<Team[]>([]);
  const [availableProcedures, setAvailableProcedures] = useState<Procedure[]>(
    []
  );
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [availableEquipments, setAvailableEquipments] = useState<Equipment[]>(
    []
  );
  const [availableEPI, setAvailableEPI] = useState<EPI[]>([]);

  const [modalType, setModalType] = useState<
    null | "team" | "procedures" | "equipments" | "materials" | "epi"
  >(null);

  const router = useRouter();

  useEffect(() => {
    if (formData.ps && availableProcedures.length > 0) {
      const filtered = availableProcedures.filter(
        (procedure) => procedure.ps === formData.ps
      );
      setFilteredProcedures(filtered);
    } else {
      setFilteredProcedures([]);
    }
  }, [formData.ps, availableProcedures]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async (): Promise<void> => {
    setIsLoading(true);
    setError("");

    try {
      const [teamRes, proceduresRes, materialsRes, equipmentsRes, epiRes] =
        await Promise.all([
          fetch("/api/team"),
          fetch("/api/procedures"),
          fetch("/api/materials"),
          fetch("/api/equipments"),
          fetch("/api/epi"),
        ]);

      if (
        !teamRes.ok ||
        !proceduresRes.ok ||
        !materialsRes.ok ||
        !equipmentsRes.ok ||
        !epiRes.ok
      ) {
        throw new Error("Erro ao carregar dados do servidor");
      }

      const [teamData, proceduresData, materialsData, equipmentsData, epiData] =
        await Promise.all([
          teamRes.json(),
          proceduresRes.json(),
          materialsRes.json(),
          equipmentsRes.json(),
          epiRes.json(),
        ]);

      setAvailableTeam(teamData.data || teamData);
      setAvailableProcedures(proceduresData.data || proceduresData);
      setAvailableMaterials(materialsData.data || materialsData);
      setAvailableEquipments(equipmentsData.data || equipmentsData);
      setAvailableEPI(epiData.data || epiData);
    } catch (error) {
      setError(
        "Erro ao carregar dados do banco. Verifique sua conexão e tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof ServiceFormData,
    value: string
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "ps") {
      setSelectedProcedures((prev) =>
        prev.filter((procedure) => procedure.ps === value)
      );
    }
  };

  const addProcedure = (procedure: Procedure): void => {
    if (!selectedProcedures.find((p) => p.id === procedure.id)) {
      setSelectedProcedures((prev) => [
        ...prev,
        {
          ...procedure,
          execution_order: prev.length + 1,
        },
      ]);
    }
  };

  const removeProcedure = (id: number): void => {
    setSelectedProcedures((prev) =>
      prev
        .filter((p) => p.id !== id)
        .map((p, index) => ({
          ...p,
          execution_order: index + 1,
        }))
    );
  };

  const updateProcedureOrder = (id: number, newOrder: number): void => {
    if (newOrder > 0) {
      setSelectedProcedures((prev) =>
        prev.map((p) => (p.id === id ? { ...p, execution_order: newOrder } : p))
      );
    }
  };

  const addMaterial = (material: Material): void => {
    if (!selectedMaterials.find((m) => m.id === material.id)) {
      setSelectedMaterials((prev) => [
        ...prev,
        {
          ...material,
          quantity: 1,
        },
      ]);
    }
  };

  const updateMaterialQuantity = (id: number, quantity: number): void => {
    setSelectedMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, quantity: quantity } : m))
    );
  };

  const removeMaterial = (id: number): void => {
    setSelectedMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const addEquipment = (equipment: Equipment): void => {
    if (!selectedEquipments.find((e) => e.id === equipment.id)) {
      setSelectedEquipments((prev) => [...prev, equipment]);
    }
  };

  const removeEquipment = (id: number): void => {
    setSelectedEquipments((prev) => prev.filter((e) => e.id !== id));
  };

  const addEPI = (epi: EPI): void => {
    if (!selectedEPI.find((e) => e.id === epi.id)) {
      setSelectedEPI((prev) => [
        ...prev,
        {
          ...epi,
          quantity: 1,
        },
      ]);
    }
  };

  const updateEPIQuantity = (id: number, quantity: number): void => {
    setSelectedEPI((prev) =>
      prev.map((e) => (e.id === id ? { ...e, quantity: quantity } : e))
    );
  };

  const removeEPI = (id: number): void => {
    setSelectedEPI((prev) => prev.filter((e) => e.id !== id));
  };

  const toggleTeamMember = (member: Team): void => {
    setSelectedTeam((prev) => {
      const exists = prev.find((m) => m.id === member.id);
      if (exists) {
        return prev.filter((m) => m.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleSubmit = async (): Promise<void> => {
    if (
      !formData.type ||
      !formData.ps ||
      !formData.responsible ||
      !formData.start_date ||
      !formData.end_date
    ) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (selectedTeam.length === 0) {
      alert("Por favor, selecione pelo menos um membro da equipe.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const serviceData = {
        service: formData,
        team: selectedTeam.map((t) => t.id),
        procedures:
          selectedProcedures.length > 0
            ? selectedProcedures
                .sort((a, b) => a.execution_order - b.execution_order)
                .map((p) => ({
                  id_procedure: p.id,
                  execution_order: p.execution_order,
                }))
            : [],
        materials:
          selectedMaterials.length > 0
            ? selectedMaterials.map((m) => ({
                material_id: m.id,
                quantity: m.quantity,
              }))
            : [],
        equipments:
          selectedEquipments.length > 0
            ? selectedEquipments.map((e) => ({
                equipment_id: e.id,
              }))
            : [],
        epi:
          selectedEPI.length > 0
            ? selectedEPI.map((e) => ({
                epi_id: e.id,
                quantity: e.quantity,
              }))
            : [],
        observations:
          observations.trim().length > 0 ? observations.trim() : null,
      };

      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceData),
      });

      const result: ApiResponse<Service> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao criar ordem de serviço");
      }

      alert("Ordem de serviço criada com sucesso!");
      resetForm();
      router.push("/");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao criar ordem de serviço"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = (): void => {
    setFormData({
      type: "",
      ps: "",
      start_date: "",
      end_date: "",
      responsible: "",
      status: "Planejamento",
    });
    setSelectedTeam([]);
    setSelectedProcedures([]);
    setSelectedMaterials([]);
    setSelectedEquipments([]);
    setSelectedEPI([]);
    setObservations("");
    setError("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Carregando...
          </h2>
          <p className="text-gray-600">
            Aguarde enquanto carregamos as informações.
          </p>
        </div>
      </div>
    );
  }

  if (error && !availableTeam.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erro ao carregar dados
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadInitialData}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-600/95 flex items-center gap-2 mx-auto"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Tentar novamente"
            )}
          </button>
        </div>
      </div>
    );
  }

  const totalEstimatedTime = selectedProcedures.reduce(
    (total, proc) => total + (proc.estimated_time || 0),
    0
  );

  return (
    <div className="min-h-screen flex flex-col gap-6 items-center bg-gray-50 py-6">
      <div className="max-w-7xl w-full">
        <div className="bg-white shadow flex items-center justify-between rounded-sm p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Nova Ordem de Serviço
            </h1>
            <p className="text-gray-600 mt-1">
              Preencha os dados para criar uma nova ordem de serviço
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              disabled={isSubmitting}
            >
              <BrushCleaning className="w-4 h-4" />
              Limpar campos
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      <div className="max-w-7xl w-full flex flex-col gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-semibold">Informações Básicas</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PS *
              </label>
              <AppSelectModel
                value={formData.ps}
                onChange={(value) => handleInputChange("ps", value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Serviço *
              </label>
              <Input
                type="text"
                name="type"
                value={formData.type}
                className="w-full p-3 border rounded-lg focus-visible:ring-0"
                onChange={(e) => handleInputChange("type", e.target.value)}
                placeholder="Digite o serviço"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsável *
              </label>
              <Input
                type="text"
                value={formData.responsible}
                className="w-full p-3 border rounded-lg focus-visible:ring-0"
                onChange={(e) =>
                  handleInputChange("responsible", e.target.value)
                }
                placeholder="Nome do responsável"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início *
              </label>
              <Input
                type="date"
                className="w-full p-3 border rounded-lg focus-visible:ring-0"
                value={formData.start_date}
                onChange={(e) =>
                  handleInputChange("start_date", e.target.value)
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Término *
              </label>
              <Input
                type="date"
                className="w-full p-3 border rounded-lg focus-visible:ring-0"
                value={formData.end_date}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
                min={formData.start_date}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger className="max-w-[400px] w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="Planejamento">Planejamento</SelectItem>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-semibold">Equipe *</h2>
              <span
                className={
                  availableTeam.length > 0
                    ? "block text-sm text-gray-500"
                    : "hidden"
                }
              >
                ({selectedTeam.length} selecionados)
              </span>
            </div>
            <div>
              <button
                onClick={() => setModalType("team")}
                className="flex items-center gap-2 px-3 py-1.5 text-white bg-amber-600 rounded-sm hover:bg-amber-600/95"
              >
                <Plus size={16} />
                Adicionar membro
              </button>
            </div>
          </div>

          {availableTeam.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {availableTeam.map((member) => (
                <div
                  key={member.id}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedTeam.find((m) => m.id === member.id)
                      ? "border-amber-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => toggleTeamMember(member)}
                >
                  <div className="font-medium text-gray-900">{member.name}</div>
                  <div className="text-sm text-gray-600">{member.position}</div>
                  {/* {member.primary_contact && (
                    <div className="text-xs text-gray-500">
                      {member.primary_contact}
                    </div>
                  )} */}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-2 items-center justify-center text-gray-500">
              <p>Nenhum membro encontrado.</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-semibold">Procedimentos *</h2>
            </div>
            <div>
              <button
                onClick={() => setModalType("procedures")}
                className="flex items-center gap-2 px-3 py-1.5 text-white bg-amber-600 rounded-sm hover:bg-amber-600/95"
              >
                <Plus size={16} />
                Adicionar procedimento
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="flex font-medium text-gray-900 mb-3 gap-2 items-center">
                Todos os Procedimentos
                <span className="font-normal text-xs">
                  ({availableProcedures.length})
                </span>
              </h3>
              {availableProcedures.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableProcedures.map((procedure) => (
                    <div
                      key={procedure.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => addProcedure(procedure)}
                    >
                      <div className="font-medium flex items-center justify-between">
                        {procedure.name}
                        <span className="font-normal text-xs">
                          {procedure.ps}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {procedure.description}
                      </div>
                      {/* <div className="text-xs text-amber-600">
                        {procedure.estimated_time} min
                      </div> */}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-2 items-center justify-center text-gray-500">
                  <p className="text-sm">Nenhum procedimento encontrado.</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="flex font-medium text-gray-900 mb-3 gap-2 items-center">
                Do padrão -{" "}
                <span className="font-normal">
                  {formData.ps || "nenhum padrão selecionado"}
                </span>
                <span className="font-normal text-xs">
                  ({filteredProcedures.length})
                </span>
              </h3>
              {filteredProcedures.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredProcedures.map((procedure) => (
                    <div
                      key={procedure.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => addProcedure(procedure)}
                    >
                      <div className="font-medium flex items-center justify-between">
                        {procedure.name}
                        <span className="font-normal text-xs">
                          {procedure.ps}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {procedure.description}
                      </div>
                      {/* <div className="text-xs text-amber-600">
                        {procedure.estimated_time} min
                      </div> */}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-2 items-center justify-center text-gray-500">
                  <p className="text-sm">Nenhum procedimento encontrado.</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-medium text-gray-900">Selecionados</h3>
                <span
                  className={
                    availableProcedures.length == 0
                      ? "block text-sm text-gray-500"
                      : "hidden"
                  }
                >
                  ({selectedProcedures.length})
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedProcedures.length > 0 ? (
                  selectedProcedures.map((procedure) => (
                    <div
                      key={procedure.id}
                      className="group flex items-center gap-3 p-3 border rounded-sm hover:border-gray-300"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{procedure.name}</div>
                        {/* <div className="text-sm text-gray-600">
                          {procedure.estimated_time} min
                        </div> */}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => removeProcedure(procedure.id)}
                          className="text-red-600/70 group-hover:text-red-700 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400">
                    <p className="text-sm">Nenhum procedimento selecionado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-semibold">Materiais *</h2>
            </div>
            <div>
              <button
                onClick={() => setModalType("materials")}
                className="flex items-center gap-2 px-3 py-1.5 text-white bg-amber-600 rounded-sm hover:bg-amber-600/95"
              >
                <Plus size={16} />
                Adicionar material
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="flex font-medium text-gray-900 mb-3 gap-2 items-center">
                Disponíveis
                <span className="font-normal text-xs">
                  ({availableMaterials.length})
                </span>
              </h3>
              {availableMaterials.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                      onClick={() => addMaterial(material)}
                    >
                      <div>
                        <div className="font-medium">{material.name}</div>
                        <div className="text-sm text-gray-600">
                          {material.unity_of_measure}
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-2 items-center justify-center text-gray-500">
                  <p className="text-sm">Nenhum material encontrado.</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-medium text-gray-900">Selecionados</h3>
                <span
                  className={
                    filteredProcedures.length == 0
                      ? "block text-sm text-gray-500"
                      : "hidden"
                  }
                >
                  ({selectedMaterials.length})
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedMaterials.length > 0 ? (
                  selectedMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center gap-3 p-3 border border-amber-400 rounded-lg hover:border-amber-500"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{material.name}</div>
                        <div className="text-sm text-gray-600">
                          {material.unity_of_measure}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          min="1"
                          className="w-10 text-sm text-center focus-visible:ring-0 rounded"
                          value={material.quantity}
                          onChange={(e) =>
                            updateMaterialQuantity(
                              material.id,
                              parseInt(e.target.value) || 1
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeMaterial(material.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400">
                    <p className="text-sm">Nenhum material selecionado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-semibold">Equipamentos *</h2>
              <span
                className={
                  availableEquipments.length > 0
                    ? "block text-sm text-gray-500"
                    : "hidden"
                }
              >
                ({selectedEquipments.length} selecionados)
              </span>
            </div>
            <div>
              <button
                onClick={() => setModalType("equipments")}
                className="flex items-center gap-2 px-3 py-1.5 text-white bg-amber-600 rounded-sm hover:bg-amber-600/95"
              >
                <Plus size={16} />
                Adicionar equipamento
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="flex font-medium text-gray-900 mb-3 gap-2 items-center">
                Disponíveis
                <span className="font-normal text-xs">
                  ({availableEquipments.length})
                </span>
              </h3>
              {availableEquipments.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableEquipments.map((equipment) => (
                    <div
                      key={equipment.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                      onClick={() => addEquipment(equipment)}
                    >
                      <div>
                        <div className="font-medium">{equipment.name}</div>
                        <div className="text-sm text-gray-600">
                          {equipment.description}
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-2 items-center justify-center text-gray-500">
                  <p className="text-sm">Nenhum equipamento encontrado.</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-medium text-gray-900">Selecionados</h3>
                <span
                  className={
                    filteredProcedures.length == 0
                      ? "block text-sm text-gray-500"
                      : "hidden"
                  }
                >
                  ({selectedEquipments.length})
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedEquipments.length > 0 ? (
                  selectedEquipments.map((equipment) => (
                    <div
                      key={equipment.id}
                      className="flex items-center justify-between p-3 border border-amber-400 rounded-lg hover:border-amber-500"
                    >
                      <div>
                        <div className="font-medium">{equipment.name}</div>
                        <div className="text-sm text-gray-600">
                          {equipment.description}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEquipment(equipment.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400">
                    <p className="text-sm">Nenhum equipamento selecionado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-semibold">EPI *</h2>
              <span
                className={
                  availableEPI.length > 0
                    ? "block text-sm text-gray-500"
                    : "hidden"
                }
              >
                ({selectedEPI.length} selecionados)
              </span>
            </div>
            <div>
              <button
                onClick={() => setModalType("epi")}
                className="flex items-center gap-2 px-3 py-1.5 text-white bg-amber-600 rounded-sm hover:bg-amber-600/95"
              >
                <Plus size={16} />
                Adicionar epi
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="flex font-medium text-gray-900 mb-3 gap-2 items-center">
                Disponíveis
                <span className="font-normal text-xs">
                  ({availableEPI.length})
                </span>
              </h3>
              {availableEPI.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableEPI.map((epi) => (
                    <div
                      key={epi.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                      onClick={() => addEPI(epi)}
                    >
                      <div>
                        <div className="font-medium">{epi.name}</div>
                        <div className="text-sm text-gray-600">
                          {epi.description}
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-2 items-center justify-center text-gray-500">
                  <p className="text-sm">Nenhum EPI encontrado.</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-medium text-gray-900">Selecionados</h3>
                <span
                  className={
                    filteredProcedures.length == 0
                      ? "block text-sm text-gray-500"
                      : "hidden"
                  }
                >
                  ({selectedEPI.length})
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedEPI.length > 0 ? (
                  selectedEPI.map((epi) => (
                    <div
                      key={epi.id}
                      className="flex items-center gap-3 p-3 border border-amber-400 rounded-lg hover:border-amber-500"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{epi.name}</div>
                        <div className="text-sm text-gray-600">
                          {epi.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          min="1"
                          className="w-10 text-sm rounded text-center focus-visible:ring-0"
                          value={epi.quantity}
                          onChange={(e) =>
                            updateEPIQuantity(
                              epi.id,
                              parseInt(e.target.value) || 1
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeEPI(epi.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400">
                    <p className="text-sm">Nenhum EPI selecionado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-semibold">Observações</h2>
          </div>

          <textarea
            className="w-full p-3 border rounded-lg resize-none"
            rows={4}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Adicione observações relevantes para esta ordem de serviço..."
          />
        </div>

        <div className="bg-amber-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">
            Resumo da Ordem de Serviço
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
            <div>
              <div className="font-medium text-amber-800">Equipe</div>
              <div className="text-amber-700">
                {selectedTeam.length} membros
              </div>
            </div>
            <div>
              <div className="font-medium text-amber-800">Procedimentos</div>
              <div className="text-amber-700">
                {selectedProcedures.length} itens
              </div>
            </div>
            <div>
              <div className="font-medium text-amber-800">Materiais</div>
              <div className="text-amber-700">
                {selectedMaterials.length} itens
              </div>
            </div>
            <div>
              <div className="font-medium text-amber-800">EPIs</div>
              <div className="text-amber-700">{selectedEPI.length} itens</div>
            </div>
            <div>
              <div className="font-medium text-amber-800">Tempo Estimado</div>
              <div className="text-amber-700">{totalEstimatedTime} min</div>
            </div>
          </div>

          <div className="mt-4 pt-2.5 border-t border-amber-200">
            <div className="font-medium text-amber-800">Observações:</div>
            <div className="text-amber-700 text-sm">{observations}</div>
          </div>
        </div>

        <section className="flex items-center justify-end gap-4 bg-white p-6 rounded-sm shadow">
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-600/90 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </section>
      </div>
      <AddItemModal
        isOpen={modalType !== null}
        type={modalType as any}
        onClose={() => setModalType(null)}
        onSuccess={loadInitialData}
      />
    </div>
  );
};

export default ServiceOrderForm;
