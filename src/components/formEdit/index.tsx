"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { servicesAdvanced } from "@/lib/database-service";
import { Button } from "../ui/button";

interface Service {
  id: number;
  type: string | null;
  ps: string | null;
  start_date: string | null;
  end_date: string | null;
  responsible: string | null;
  status: string | null;
  created_at: string | null;
  service_team?: Array<{
    team: {
      id: number;
      name: string | null;
      position: string | null;
      primary_contact: string | null;
    };
  }>;
}

interface FormEditProps {
  service: Service;
}

export default function FormEdit({ service }: FormEditProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serviceRendered, setServiceRendered] = useState<Service>(service);
  const [formData, setFormData] = useState({
    type: service.type || "",
    ps: service.ps || "",
    start_date: service.start_date ? service.start_date.split("T")[0] : "",
    end_date: service.end_date ? service.end_date.split("T")[0] : "",
    responsible: service.responsible || "",
    status: service.status || "planejamento",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/services", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: service.id,
          ...formData,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erro ao atualizar serviço");
      }

      toast("Serviço atualizado com sucesso!", {
        action: {
          label: "Fechar",
          onClick: () => {
            toast.dismiss();
          },
        },
      });
      router.push("/");
      router.refresh();
    } catch (error: any) {
      toast(`Erro ao atualizar serviço: ${error.message}`, {
        action: {
          label: "Fechar",
          onClick: () => {
            toast.dismiss();
          },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (serviceId: string) => {
    try {
      const data = await servicesAdvanced.getByIdWithRelations(
        Number(serviceId)
      );
      setServiceRendered(data);
    } catch (error) {
      console.error("Erro ao buscar serviço:", error);
      toast("Erro ao carregar serviço", {
        action: {
          label: "Fechar",
          onClick: () => {
            toast.dismiss();
          },
        },
      });
    }
  };

  useEffect(() => {
    if (service.id) {
      fetchData(String(service.id));
    }
  }, [service.id]);

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl w-full space-y-6 bg-white p-6 rounded-sm mt-10"
    >
      <h1 className="text-2xl font-bold mb-4 text-center">Editar Serviço</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 "
          >
            Tipo do Serviço
          </label>
          <Input
            type="text"
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="bg-white disabled:opacity-100 cursor-not-allowed"
            disabled
            placeholder="Ex: Manutenção preventiva"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="ps"
            className="block text-sm font-medium text-gray-700 "
          >
            PS (Permissão de Serviço)
          </label>
          <Input
            type="text"
            id="ps"
            name="ps"
            value={formData.ps}
            onChange={handleChange}
            className="bg-white disabled:opacity-100 cursor-not-allowed"
            disabled
            placeholder="Ex: PS-2024-001"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="start_date"
            className="block text-sm font-medium text-gray-700 "
          >
            Data de Início
          </label>
          <Input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="bg-white focus-visible:ring-0"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="end_date"
            className="block text-sm font-medium text-gray-700 "
          >
            Data de Fim
          </label>
          <Input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="bg-white focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="responsible"
          className="block text-sm font-medium text-gray-700 "
        >
          Responsável
        </label>
        <Input
          type="text"
          id="responsible"
          name="responsible"
          value={formData.responsible}
          onChange={handleChange}
          className="bg-white focus-visible:ring-0"
          placeholder="Nome do responsável"
        />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="block text-sm font-medium text-gray-700">Equipe</h1>
        <div>
          {serviceRendered.service_team?.map((teamMember) => (
            <div
              key={teamMember.team.id}
              className="flex flex-col items-start justify-center bg-gray-100 px-6 py-3 rounded-md max-w-fit"
            >
              <span className="text-sm text-gray-800">
                {teamMember.team.name || "Não informado"} -{" "}
                {teamMember.team.position || "Não informado"}
              </span>
              <span className="text-xs text-gray-500">
                Contato: {teamMember.team.primary_contact || "Não informado"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-6 pt-4">
        <Button
          type="button"
          variant={"outline"}
          onClick={() => router.back()}
          className="cursor-pointer"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-amber-600 text-white hover:bg-amber-600/90 hover:text-white cursor-pointer"
        >
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  );
}
