"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UpdateServiceData {
  id: number;
  type?: string;
  ps?: string;
  start_date?: string;
  end_date?: string;
  responsible?: string;
  status?: string;
  procedures?: Array<{ id_procedure: number; execution_order: number }>;
  materials?: Array<{ material_id: number; quantity: number }>;
  equipments?: Array<{ equipment_id: number }>;
  epis?: Array<{ epi_id: number; quantity: number }>;
  team?: Array<{ team_id: number }>;
}

export function useServiceUpdate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const updateService = async (
    data: UpdateServiceData,
    options?: {
      redirectTo?: string;
      showSuccessAlert?: boolean;
      updateRelations?: boolean;
    }
  ) => {
    const {
      redirectTo = "/services",
      showSuccessAlert = true,
      updateRelations = false,
    } = options || {};

    setLoading(true);
    setError(null);

    try {
      const method = updateRelations ? "PATCH" : "PUT";

      const response = await fetch("/api/services", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao atualizar serviço");
      }

      if (showSuccessAlert) {
        alert("Serviço atualizado com sucesso!");
      }

      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      }

      return result.data;
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao atualizar serviço";
      setError(errorMessage);
      console.error("Erro ao atualizar:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateServiceBasic = async (
    serviceData: Omit<
      UpdateServiceData,
      "procedures" | "materials" | "equipments" | "epis" | "team"
    >
  ) => {
    return updateService(serviceData, { updateRelations: false });
  };

  const updateServiceWithRelations = async (serviceData: UpdateServiceData) => {
    return updateService(serviceData, { updateRelations: true });
  };

  return {
    updateService,
    updateServiceBasic,
    updateServiceWithRelations,
    loading,
    error,
    clearError: () => setError(null),
  };
}

export function useServiceBasicUpdate() {
  const { updateServiceBasic, loading, error, clearError } = useServiceUpdate();

  return {
    updateService: updateServiceBasic,
    loading,
    error,
    clearError,
  };
}
