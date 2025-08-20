"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Wrench,
  Package,
  Shield,
  FileText,
  Plus,
  Save,
  Loader2,
  AlertCircle,
  BrushCleaning,
} from "lucide-react";
import AddItemModal from "@/components/app-addItemModal";
import { useRouter } from "next/navigation";
import OrderSummary from "@/components/service-order/order-orderSummary";
import OrderBasicInfo from "@/components/service-order/order-basicInfoOrder/index";
import SelectionSection, {
  ProcedureAvailableItem,
  ProcedureSelectedItem,
  MaterialAvailableItem,
  MaterialSelectedItem,
  EquipmentAvailableItem,
  EquipmentSelectedItem,
  EPIAvailableItem,
  EPISelectedItem,
} from "@/components/service-order/order-itemSelector";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import AppFixedButton from "@/components/app-bottomFixedButton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const addProcedure = async (procedure: Procedure): Promise<void> => {
    if (!selectedProcedures.find((p) => p.id === procedure.id)) {
      const newProcedure = {
        ...procedure,
        execution_order: selectedProcedures.length + 1,
      };

      setSelectedProcedures((prev) => [...prev, newProcedure]);

      try {
        const response = await fetch(`/api/procedures?id=${procedure.id}`);
        const result = await response.json();

        if (result.success && result.data.procedure_materials) {
          const procedureMaterials = result.data.procedure_materials;

          const newMaterials: SelectedMaterial[] = [];

          procedureMaterials.forEach((pm: any) => {
            const existingMaterial = selectedMaterials.find(
              (m) => m.id === pm.material.id
            );

            if (!existingMaterial) {
              newMaterials.push({
                id: pm.material.id,
                name: pm.material.name,
                unity_of_measure: pm.material.unity_of_measure,
                quantity: pm.quantity,
              });
            } else {
              updateMaterialQuantity(
                pm.material.id,
                existingMaterial.quantity + pm.quantity
              );
            }
          });

          if (newMaterials.length > 0) {
            setSelectedMaterials((prev) => [...prev, ...newMaterials]);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar materiais do procedimento:", error);
      }
    }
  };

  const removeProcedure = (id: string | number): void => {
    const procedureToRemove = selectedProcedures.find((p) => p.id === id);

    if (procedureToRemove) {
      setSelectedProcedures((prev) =>
        prev
          .filter((p) => p.id !== id)
          .map((p, index) => ({
            ...p,
            execution_order: index + 1,
          }))
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

  const updateMaterialQuantity = (
    id: string | number,
    quantity: number
  ): void => {
    setSelectedMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, quantity: quantity } : m))
    );
  };

  const removeMaterial = (id: string | number): void => {
    setSelectedMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const addEquipment = (equipment: Equipment): void => {
    if (!selectedEquipments.find((e) => e.id === equipment.id)) {
      setSelectedEquipments((prev) => [...prev, equipment]);
    }
  };

  const removeEquipment = (id: string | number): void => {
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

  const updateEPIQuantity = (id: string | number, quantity: number): void => {
    setSelectedEPI((prev) =>
      prev.map((e) => (e.id === id ? { ...e, quantity: quantity } : e))
    );
  };

  const removeEPI = (id: string | number): void => {
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
      toast("Por favor, preencha todos os campos obrigatórios.", {
        action: {
          label: "Fechar",
          onClick: () => {
            toast.dismiss();
          },
        },
      });
      return;
    }

    if (selectedTeam.length === 0) {
      toast("Por favor, selecione pelo menos um membro da equipe.", {
        action: {
          label: "Fechar",
          onClick: () => {
            toast.dismiss();
          },
        },
      });
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

      toast("Ordem de serviço criada com sucesso!", {
        action: {
          label: "Fechar",
          onClick: () => {
            toast.dismiss();
          },
        },
      });
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
      status: "",
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
          <div className="flex flex-row items-center gap-2">
            <span className="text-sm font-normal text-gray-500">
              Campos com * são obrigatórios
            </span>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              disabled={isSubmitting}
            >
              <BrushCleaning className="w-4 h-4" />
              Limpar todos os campos
            </button>
          </div>
        </div>

        {error &&
          toast(error, {
            action: {
              label: "Fechar",
              onClick: () => {
                toast.dismiss();
              },
            },
          })}
      </div>

      <div className="max-w-7xl w-full flex flex-col gap-6">
        <OrderBasicInfo
          value={formData}
          onChange={handleInputChange}
          clean={resetForm}
        />

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
                  className={`flex items-center justify-between px-3 py-2 border-2 rounded-sm cursor-pointer transition-all ${
                    selectedTeam.find((m) => m.id === member.id)
                      ? "border-amber-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => toggleTeamMember(member)}
                >
                  <div className="font-medium text-gray-900">{member.name}</div>
                  <div className="text-sm text-gray-600">{member.position}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-2 items-center justify-center text-gray-500">
              <p>Nenhum membro encontrado.</p>
            </div>
          )}
        </div>

        <SelectionSection
          title="Procedimentos"
          icon={<Wrench className="w-5 h-5 text-amber-600" />}
          available={filteredProcedures}
          selected={selectedProcedures}
          onAdd={addProcedure}
          onRemove={removeProcedure}
          onAddNew={() => setModalType("procedures")}
          renderAvailableItem={(procedure: any, onAdd: any) => (
            <ProcedureAvailableItem procedure={procedure} onAdd={onAdd} />
          )}
          renderSelectedItem={(procedure: any, onRemove: any) => (
            <ProcedureSelectedItem procedure={procedure} onRemove={onRemove} />
          )}
        />

        <SelectionSection
          title="Materiais"
          icon={<Package className="w-5 h-5 text-amber-600" />}
          available={availableMaterials}
          selected={selectedMaterials}
          onAdd={addMaterial}
          onRemove={removeMaterial}
          onAddNew={() => setModalType("materials")}
          hasQuantity={true}
          onUpdateQuantity={updateMaterialQuantity}
          renderAvailableItem={(material: any, onAdd: any) => (
            <MaterialAvailableItem material={material} onAdd={onAdd} />
          )}
          renderSelectedItem={(
            material: any,
            onRemove: any,
            onUpdateQuantity: any
          ) => (
            <MaterialSelectedItem
              material={material}
              onRemove={onRemove}
              onUpdateQuantity={onUpdateQuantity}
            />
          )}
        />

        <SelectionSection
          title="Equipamentos"
          icon={<Wrench className="w-5 h-5 text-amber-600" />}
          available={availableEquipments}
          selected={selectedEquipments}
          onAdd={addEquipment}
          onRemove={removeEquipment}
          onAddNew={() => setModalType("equipments")}
          renderAvailableItem={(equipment: any, onAdd: any) => (
            <EquipmentAvailableItem equipment={equipment} onAdd={onAdd} />
          )}
          renderSelectedItem={(equipment: any, onRemove: any) => (
            <EquipmentSelectedItem equipment={equipment} onRemove={onRemove} />
          )}
        />

        <SelectionSection
          title="EPI"
          icon={<Shield className="w-5 h-5 text-amber-600" />}
          available={availableEPI}
          selected={selectedEPI}
          onAdd={addEPI}
          onRemove={removeEPI}
          onAddNew={() => setModalType("epi")}
          hasQuantity={true}
          onUpdateQuantity={updateEPIQuantity}
          renderAvailableItem={(epi: any, onAdd: any) => (
            <EPIAvailableItem epi={epi} onAdd={onAdd} />
          )}
          renderSelectedItem={(
            epi: any,
            onRemove: any,
            onUpdateQuantity: any
          ) => (
            <EPISelectedItem
              epi={epi}
              onRemove={onRemove}
              onUpdateQuantity={onUpdateQuantity}
            />
          )}
        />

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-semibold">Observações</h2>
          </div>

          <Textarea
            className="w-full h-[137px] resize-none focus-visible:ring-0"
            rows={4}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Adicione observações relevantes para esta ordem de serviço..."
            maxLength={1000}
          />
        </div>

        <OrderSummary
          totalEstimatedTime={totalEstimatedTime}
          teamCount={selectedTeam.length}
          proceduresCount={selectedProcedures.length}
          materialsCount={selectedMaterials.length}
          epiCount={selectedEPI.length}
          observations={observations}
        />

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
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger>
              <AppFixedButton icon={BrushCleaning} onClick={resetForm} />
            </TooltipTrigger>
            <TooltipContent>Limpar todos os campos</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <AppFixedButton
                icon={Save}
                className="bg-amber-600 text-white hover:bg-amber-600/90 hover:text-white"
                onClick={handleSubmit}
              />
            </TooltipTrigger>
            <TooltipContent>Salvar</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default ServiceOrderForm;
