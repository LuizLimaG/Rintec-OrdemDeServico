import AppSelectModel from "@/components/app-selectModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrushCleaning, FileText } from "lucide-react";

interface OrderBasicInfoProps {
  value: {
    ps: string;
    type: string;
    responsible: string;
    start_date: string;
    end_date: string;
    status: string;
  };
  onChange: (field: any, value: string) => void;
  clean?: () => void;
}

export default function OrderBasicInfo(props: OrderBasicInfoProps) {
  const handlePSChange = (psCode: string, serviceName?: string) => {
    props.onChange("ps", psCode);

    if (serviceName) {
      props.onChange("type", serviceName);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-amber-600" />
          <h2 className="text-xl font-semibold">Informações Básicas *</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Padrão de Serviço (PS)
          </label>
          <AppSelectModel
            value={props.value.ps}
            onChange={handlePSChange}
            placeholder="Selecione o padrão"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Serviço
            <span className="text-xs text-gray-500 ml-1">
              (Preenchimento automático)
            </span>
          </label>
          <Input
            type="text"
            name="type"
            value={props.value.type}
            className="w-full p-3 border rounded-lg focus-visible:ring-0 bg-gray-50"
            onChange={(e) => props.onChange("type", e.target.value)}
            placeholder="Nome do serviço"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Responsável
          </label>
          <Input
            type="text"
            value={props.value.responsible}
            className="w-full p-3 border rounded-lg focus-visible:ring-0"
            onChange={(e) => props.onChange("responsible", e.target.value)}
            placeholder="Nome do responsável"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Início
          </label>
          <Input
            type="date"
            className="w-full p-3 border rounded-lg focus-visible:ring-0"
            value={props.value.start_date}
            onChange={(e) => props.onChange("start_date", e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Término
          </label>
          <Input
            type="date"
            className="w-full p-3 border rounded-lg focus-visible:ring-0"
            value={props.value.end_date}
            onChange={(e) => props.onChange("end_date", e.target.value)}
            min={props.value.start_date}
            required
          />
        </div>
      </div>
    </div>
  );
}