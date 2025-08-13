"use client";

import React, { useState } from "react";
import AppSelectModel from "../app-selectModel";

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

  const handleChange = (field: string, value: string | number) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let endpoint = `/api/${type}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
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

  return (
    <div className="fixed inset-0 z-50 bg-gray-50/70 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow">
        <h2 className="text-lg font-bold mb-4">Adicionar {type}</h2>

        {type === "team" && (
          <div className="flex flex-col gap-2">
            <input
              className="w-full border p-2 rounded-sm"
              placeholder="Nome"
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <input
              className="w-full border p-2 rounded-sm"
              placeholder="Cargo"
              onChange={(e) => handleChange("position", e.target.value)}
            />
            <input
              className="w-full border p-2 rounded-sm"
              placeholder="Contato principal"
              onChange={(e) => handleChange("primary_contact", e.target.value)}
            />
          </div>
        )}

        {type === "procedures" && (
          <div className="flex flex-col gap-2">
            <input
              className="w-full border p-2 rounded-sm"
              placeholder="Nome"
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <textarea
              className="w-full border p-2 rounded-sm resize-none"
              placeholder="Descrição"
              onChange={(e) => handleChange("description", e.target.value)}
            />
            <input
              type="number"
              className="w-full border p-2 rounded-sm"
              placeholder="Tempo estimado (min)"
              onChange={(e) =>
                handleChange("estimated_time", Number(e.target.value))
              }
            />
            <AppSelectModel 
              value={form.ps} 
              onChange={(value: string) => {
                handleChange("ps", value);
              }} 
            />
          </div>
        )}

        {type === "materials" && (
          <div className="flex flex-col gap-2">
            <input
              className="w-full border p-2 rounded-sm"
              placeholder="Nome"
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <input
              className="w-full border p-2 rounded-sm"
              placeholder="Unidade de medida"
              onChange={(e) => handleChange("unity_of_measure", e.target.value)}
            />
          </div>
        )}

        {type === "equipments" && (
          <div className="flex flex-col gap-2">
            <input
              className="w-full border p-2 rounded-sm"
              placeholder="Nome"
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <textarea
              className="w-full border p-2 rounded-sm resize-none"
              placeholder="Descrição"
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
        )}

        {type === "epi" && (
          <div className="flex flex-col gap-2">
            <input
              className="w-full border p-2 rounded-sm"
              placeholder="Nome"
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <textarea
              className="w-full border p-2 rounded-sm resize-none"
              placeholder="Descrição"
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded underline text-red-500 cursor-pointer hover:text-red-400"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-amber-600 text-white rounded cursor-pointer hover:bg-amber-600/95"
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