import React, { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import AppSelectModel from "../app-selectModel";

interface Material {
  id: number;
  name: string;
  unity_of_measure: string;
}

interface SelectedMaterial extends Material {
  quantity: number;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "team" | "procedures" | "materials" | "equipments" | "epi";
  onSuccess: () => void;
}

const AddItemModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  type,
  onSuccess,
}) => {
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<
    SelectedMaterial[]
  >([]);

  useEffect(() => {
    if (isOpen && type === "procedures") {
      loadMaterials();
    }
    if (!isOpen) {
      setForm({});
      setSelectedMaterials([]);
    }
  }, [isOpen, type]);

  const loadMaterials = async () => {
    try {
      const response = await fetch("/api/materials");
      const result = await response.json();
      setAvailableMaterials(result.data || result);
    } catch (error) {
      console.error("Erro ao carregar materiais:", error);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const addMaterial = (material: Material) => {
    if (!selectedMaterials.find((m) => m.id === material.id)) {
      setSelectedMaterials((prev) => [...prev, { ...material, quantity: 1 }]);
    }
  };

  const removeMaterial = (materialId: number) => {
    setSelectedMaterials((prev) => prev.filter((m) => m.id !== materialId));
  };

  const updateMaterialQuantity = (materialId: number, quantity: number) => {
    setSelectedMaterials((prev) =>
      prev.map((m) => (m.id === materialId ? { ...m, quantity } : m))
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let endpoint = `/api/${type}`;
      let payload = { ...form };

      if (type === "procedures" && selectedMaterials.length > 0) {
        payload.materials = selectedMaterials.map((m) => ({
          material_id: m.id,
          quantity: m.quantity,
        }));
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      setForm({});
      setSelectedMaterials([]);
      onClose();
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getTitle = () => {
    const titles = {
      team: "Adicionar Membro da Equipe",
      procedures: "Adicionar Procedimento",
      materials: "Adicionar Material",
      equipments: "Adicionar Equipamento",
      epi: "Adicionar EPI",
    };
    return titles[type];
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">{getTitle()}</h2>

        {type === "team" && (
          <div className="flex flex-col gap-4">
            <input
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Nome *"
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <input
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Cargo *"
              onChange={(e) => handleChange("position", e.target.value)}
            />
            <input
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Contato principal"
              onChange={(e) => handleChange("primary_contact", e.target.value)}
            />
          </div>
        )}

        {type === "procedures" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <Input
                className="w-full focus-visible:ring-0"
                placeholder="Nome do procedimento *"
                onChange={(e) => handleChange("name", e.target.value)}
              />
              <Textarea
                className="w-full resize-none focus-visible:ring-0"
                placeholder="Descrição"
                rows={3}
                onChange={(e) => handleChange("description", e.target.value)}
                maxLength={1000}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  className="w-full focus-visible:ring-0"
                  placeholder="Tempo estimado (min)"
                  onChange={(e) =>
                    handleChange("estimated_time", Number(e.target.value))
                  }
                />
                <AppSelectModel
                  value={form.ps}
                  onChange={(value: any) => handleChange("ps", value)}
                />
              </div>
            </div>
          </div>
        )}

        {type === "materials" && (
          <div className="flex flex-col gap-4">
            <Input
              className="w-full focus-visible:ring-0"
              placeholder="Nome do material *"
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <Select
              onValueChange={(value) => handleChange("unity_of_measure", value)}
              value={form.unity_of_measure || ""}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a unidade *" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UN">Unidade (UN)</SelectItem>
                <SelectItem value="M">Metro (M)</SelectItem>
                <SelectItem value="M²">Metro Quadrado (M²)</SelectItem>
                <SelectItem value="M³">Metro Cúbico (M³)</SelectItem>
                <SelectItem value="KG">Quilograma (KG)</SelectItem>
                <SelectItem value="L">Litro (L)</SelectItem>
                <SelectItem value="ML">Mililitro (ML)</SelectItem>
                <SelectItem value="CX">Caixa (CX)</SelectItem>
                <SelectItem value="PC">Peça (PC)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {type === "equipments" && (
          <div className="flex flex-col gap-4">
            <input
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Nome do equipamento *"
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <textarea
              className="w-full border p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Descrição"
              rows={3}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
        )}

        {type === "epi" && (
          <div className="flex flex-col gap-4">
            <input
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Nome do EPI *"
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <textarea
              className="w-full border p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Descrição"
              rows={3}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
