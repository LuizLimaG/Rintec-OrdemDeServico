"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  FileText,
  Download,
  Package,
  Wrench,
  Users,
  ListOrdered,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { servicesAdvanced } from "@/lib/database-service";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ServiceWithRelations {
  id: number;
  type: string | null;
  start_date: string | null;
  end_date: string | null;
  ps: string | null;
  created_at: string | null;
  responsible: string | null;
  status: string | null;
  procedure_order?: Array<{
    execution_order: number | null;
    procedure: {
      id: number;
      name: string | null;
      description: string | null;
      estimated_time: number | null;
      ps: string | null;
    };
  }>;
  service_materials?: Array<{
    quantity: number;
    material: {
      id: number;
      name: string | null;
      unity_of_measure: string | null;
    };
  }>;
  service_equipments?: Array<{
    equipment: {
      id: number;
      name: string | null;
      description: string | null;
    };
  }>;
  service_epi?: Array<{
    quantity: number;
    epi_item: {
      id: number;
      name: string | null;
      description: string | null;
    };
  }>;
  service_team?: Array<{
    team: {
      id: number;
      name: string | null;
      position: string | null;
      primary_contact: string | null;
    };
  }>;
  observations?: Array<{
    id: number;
    observation_date: string | null;
    description: string | null;
    observation_type: string | null;
    team_member: {
      id: number;
      name: string | null;
      position: string | null;
      primary_contact: string | null;
    };
  }>;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function ServicePage({ params }: Props) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [service, setService] = useState<ServiceWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [channel, setChannel] = useState("email");
  const [destination, setDestination] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID do serviço não encontrado");
      setLoading(false);
      return;
    }

    fetchServiceData(id);
  }, [id]);

  const fetchServiceData = async (serviceId: string) => {
    try {
      setLoading(true);
      const data = await servicesAdvanced.getByIdWithRelations(
        Number(serviceId)
      );
      setService(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar dados do serviço"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não informado";
    const endDateString = dateString;
    const [year, month, day] = endDateString.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString("pt-BR");
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Não informado";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getStatusColor = (status?: string | null) => {
    if (!status) return "bg-gray-100 text-gray-800";

    switch (status) {
      case "Concluída":
        return "bg-green-100 text-green-800";
      case "Planejamento":
        return "bg-blue-100 text-blue-800";
      case "Pendente":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGoBack = () => {
    router.back();
  };

  const sendMail = async () => {
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/send_order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, channel, destination }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no envio");
      setMessage("Enviado com sucesso!");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="mt-4 text-gray-600">Carregando dados do serviço...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center flex flex-col gap-3">
              <div className="text-red-500 text-4xl">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Erro ao carregar serviço
              </h2>
              <p className="text-gray-600 mb-3">
                {error || "Serviço não encontrado"}
              </p>
              <Button onClick={handleGoBack} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 print:bg-white">
        <div className="bg-white shadow-sm border-b print:hidden">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button onClick={handleGoBack} variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Detalhes do Serviço
                  </h1>
                </div>
              </div>

              <Button onClick={handlePrint} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="hidden print:block print-header bg-white">
          <div className="print-title">RELATÓRIO DE SERVIÇO</div>
        </div>

        <div className="max-w-6xl mx-auto p-4 space-y-6 print:p-0 print:space-y-4 print:bg-white">
          <div>
            <Card className="print:border print:p-6 max-w-none print:shadow-none print:border-amber-600 rounded-sm gap-2">
              <CardHeader className="print:p-0">
                <CardTitle className="flex items-center justify-between print:print-section-title print:flex print:justify-between">
                  <span className="flex items-center print:block print:text-[13px]">
                    <FileText className="w-5 h-5 mr-2 text-amber-600 print:hidden" />
                    Informações do Serviço
                  </span>
                  {service.status && (
                    <Badge
                      className={`${getStatusColor(
                        service.status
                      )} print:text-[11px] print:inline-block`}
                    >
                      {service.status}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 print:p-0">
                <div className="w-full grid grid-cols-1 md:grid-cols-2 space-y-4">
                  <div className="w-full col-span-2 flex justify-between gap-4">
                    <div className="print:print-field w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1 print:text-[12px]">
                        Nome do Serviço
                      </label>
                      <p className="text-gray-900 bg-gray-100 p-3 rounded-xs print:print-field-value">
                        {service.type || "Não informado"}
                      </p>
                    </div>

                    <div className="print:print-field w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1 print:text-[12px]">
                        PS
                      </label>
                      <p className="text-gray-900 bg-gray-100 p-3 rounded-sm print:print-field-value">
                        {service.ps || "Não informado"}
                      </p>
                    </div>
                  </div>

                  {service.responsible && (
                    <div className="w-full print:print-field md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1 print:text-[12px]">
                        Responsável
                      </label>
                      <p className="w-full text-gray-900 bg-gray-100 p-3 rounded-sm print:print-field-value">
                        {service.responsible}
                      </p>
                    </div>
                  )}
                </div>

                <div className="print:mt-4">
                  <div className="w-full flex gap-4">
                    <div className="w-full print:print-field">
                      <label className="block text-sm font-medium text-gray-700 mb-1 print:text-[12px]">
                        Data de Início
                      </label>
                      <p className="text-gray-900 bg-gray-100 p-3 rounded-sm print:print-field-value">
                        {formatDate(service.start_date)}
                      </p>
                    </div>

                    <div className="w-full print:print-field">
                      <label className="block text-sm font-medium text-gray-700 mb-1 print:text-[12px]">
                        Data de Término
                      </label>
                      <p className="text-gray-900 p-3 bg-gray-100 rounded-sm print:print-field-value">
                        {formatDate(service.end_date)}
                      </p>
                    </div>

                    <div className="w-full print:hidden">
                      <label className="block text-sm font-medium text-gray-700 mb-1 print:text-[12px]">
                        Criado em
                      </label>
                      <p className="text-gray-900 bg-gray-100 p-3 rounded-sm print:print-field-value">
                        {formatDateTime(service.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Card className="print:border print:p-6 max-w-none print:shadow-none print:border-amber-600 rounded-sm gap-2">
              <CardHeader className="print:p-0 ">
                <CardTitle className="flex items-center justify-between print:print-section-title">
                  <div className="flex items-center print:text-[14px]">
                    <ListOrdered className="w-5 h-5 mr-2 text-amber-600 print:hidden" />
                    Procedimentos:
                  </div>
                  {service.procedure_order && (
                    <div>
                      {service.procedure_order.length > 0 && (
                        <span className="font-medium text-xs">
                          {service.procedure_order[0].procedure.ps}
                        </span>
                      )}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="print:p-0">
                {service.procedure_order &&
                service.procedure_order.length > 0 ? (
                  <div className="space-y-2">
                    {service.procedure_order
                      .sort(
                        (a, b) =>
                          (a.execution_order || 0) - (b.execution_order || 0)
                      )
                      .map((item, index) => (
                        <div key={index} className="print:print-item">
                          <div className="flex items-start justify-between print:print-item-header">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <h4 className="text-gray-900 print:text-[12px]">
                                  <span>{item.execution_order} - </span>
                                  {item.procedure?.name || "Sem nome"}
                                </h4>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="bg-gray-100 p-6 rounded-sm text-center text-gray-500 print:text-center print:p-4">
                    Nenhum procedimento cadastrado
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="print:border print:p-6 max-w-none print:shadow-none print:border-amber-600 rounded-sm gap-2">
              <CardHeader className="print:p-0 ">
                <CardTitle className="flex items-center print:text-[14px]">
                  <Package className="w-5 h-5 mr-2 text-amber-600 print:hidden" />
                  Materiais:
                </CardTitle>
              </CardHeader>
              <CardContent className="print:p-0 ">
                {service.service_materials &&
                service.service_materials.length > 0 ? (
                  <div className="space-y-3 print:space-y-2">
                    {service.service_materials.map((item, index) => (
                      <div key={index} className="print:print-item">
                        <div className="flex items-center justify-between print:print-item-header">
                          <div>
                            <h4 className="text-gray-900 print:text-[12px]">
                              {item.material?.name || "Sem nome"}
                            </h4>
                          </div>
                          <Badge className="bg-white text-black text-[12px]">
                            {item.quantity} Un.
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-100 p-6 rounded-sm text-center text-gray-500 print:text-center print:p-4">
                    Nenhum material cadastrado
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="print:border print:p-6 max-w-none print:shadow-none print:border-amber-600 rounded-sm gap-2">
              <CardHeader className="print:p-0 ">
                <CardTitle className="flex items-center print:text-[14px]">
                  <Wrench className="w-5 h-5 mr-2 text-amber-600 print:hidden" />
                  Equipamentos:
                </CardTitle>
              </CardHeader>
              <CardContent className="print:p-0 ">
                {service.service_equipments &&
                service.service_equipments.length > 0 ? (
                  <div className="space-y-3 print:space-y-2">
                    {service.service_equipments.map((item, index) => (
                      <div key={index} className="print:print-item">
                        <h4 className="text-gray-900 print:text-[12px]">
                          {item.equipment?.name || "Sem nome"}
                        </h4>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-100 p-6 rounded-sm text-center text-gray-500 print:text-center print:p-4">
                    Nenhum equipamento cadastrado
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="print:border print:p-6 max-w-none print:shadow-none print:border-amber-600 rounded-sm gap-2">
              <CardHeader className="print:p-0 ">
                <CardTitle className="flex items-center print:text-[14px]">
                  <User className="w-5 h-5 mr-2 text-amber-600 print:hidden" />
                  EPIs:
                </CardTitle>
              </CardHeader>
              <CardContent className="print:p-0 ">
                {service.service_epi && service.service_epi.length > 0 ? (
                  <div className="space-y-3 print:space-y-2">
                    {service.service_epi.map((item, index) => (
                      <div key={index} className="print:print-item">
                        <div className="flex items-center justify-between print:print-item-header">
                          <div>
                            <h4 className="text-gray-900 print:text-[12px]">
                              {item.epi_item?.name || "Sem nome"}
                            </h4>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-100 p-6 rounded-sm text-center text-gray-500 print:text-center print:p-4">
                    Nenhum EPI cadastrado
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="print:print-section print:print-avoid-break">
            <Card className="print:border print:p-6 max-w-none print:shadow-none print:border-amber-600 gap-2 rounded-sm">
              <CardHeader className="print:p-0 ">
                <CardTitle className="flex items-center print:text-[14px]">
                  <Users className="w-5 h-5 mr-2 text-amber-600 print:hidden" />
                  Equipe:
                </CardTitle>
              </CardHeader>
              <CardContent className="print:p-0 ">
                {service.service_team && service.service_team.length > 0 ? (
                  <div className="flex flex-col gap-4 print:print-grid">
                    {service.service_team.map((member, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2 max-w-[250px] w-full">
                          <h4 className="font-medium text-gray-900 print:text-[12px]">
                            {member.team?.name || "Sem nome"}
                          </h4>
                          -
                          <p className="text-sm text-gray-600 print:text-[12px]">
                            {member.team?.position || "Função não informada"}
                          </p>
                        </div>
                        <div className="print:hidden">
                          <Tooltip>
                            <TooltipTrigger
                              onClick={() => setIsModalOpen(true)}
                              className="font-normal text-white flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:shadow hover:bg-gray-50"
                            >
                              <Upload
                                size={18}
                                className="text-amber-600"
                                strokeWidth={2}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p>Enviar ordem para membro</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-100 p-6 rounded-sm text-center text-gray-500 print:text-center print:p-4">
                    Nenhum membro da equipe cadastrado
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="print:print-section print:print-page-break">
            <Card className="print:border print:p-6 max-w-none print:shadow-none print:border-amber-600 rounded-sm gap-2">
              <CardHeader className="print:p-0 ">
                <CardTitle className="flex items-center print:text-[14px]">
                  <FileText className="w-5 h-5 mr-2 text-amber-600 print:hidden" />
                  Observações:
                </CardTitle>
              </CardHeader>
              <CardContent className="print:p-0 ">
                {service.observations && service.observations.length > 0 ? (
                  <div className="space-y-4 print:space-y-3">
                    {service.observations.map((obs, index) => (
                      <div key={index} className="print:print-observation">
                        <p className="text-gray-800 print:text-[12px]">
                          {service.observations
                            ? service.observations.length
                            : ""}
                          - {obs?.description || "Sem descrição"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-100 p-6 rounded-sm text-center text-gray-500 print:text-center print:p-4">
                    Nenhuma observação cadastrada
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-50/70 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Enviar PDF</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <label className="block mb-2 text-sm font-medium">Canal</label>
            <select
              className="w-full border rounded p-2 mb-4"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            >
              <option value="email">E-mail</option>
              <option value="whatsapp">WhatsApp - Indisponível</option>
            </select>

            <label className="block mb-2 text-sm font-medium">
              {channel === "email"
                ? "E-mail de destino"
                : "WHATSAPP INDISPONÍVEL NO MOMENTO"}
            </label>
            <input
              type="text"
              className="w-full border rounded p-2 mb-4"
              placeholder={
                channel === "email"
                  ? "exemplo@dominio.com"
                  : "WHATSAPP INDISPONÍVEL NO MOMENTO"
              }
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />

            {message && (
              <p className="text-sm mb-2 text-center text-red-500">{message}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsModalOpen(false)} variant="outline">
                Cancelar
              </Button>
              <Button onClick={sendMail} disabled={sending}>
                {sending ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
