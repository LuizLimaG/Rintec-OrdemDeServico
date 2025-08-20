import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ServiceStandard {
  ps_code: string;
  service_name: string;
  description?: string;
}

interface AppSelectModelProps {
  value: string;
  onChange: (psCode: string, serviceName?: string) => void;
  placeholder?: string;
}

const SERVICE_STANDARDS: ServiceStandard[] = [
  { ps_code: "AC-01", service_name: "Mobilizaçâo canteiro de obra" },
  { ps_code: "AC-02", service_name: "Furaçâo de lajes para colunas" },
  { ps_code: "AC-03", service_name: "Protótipo colunas e manifolds" },
  { ps_code: "AC-04", service_name: "Fixação de perfilados shaft central" },
  { ps_code: "AC-05", service_name: "Coluna recalque de água" },
  { ps_code: "AC-06", service_name: "Colunas AF" },
  { ps_code: "AC-07", service_name: "Colunas AQ/Retorno" },
  { ps_code: "AC-08", service_name: "Montagem manifold no local" },
  { ps_code: "AC-09", service_name: "Montagem de barrilete cobertura" },
  { ps_code: "AC-10", service_name: "Enchimento e testes colunas" },
  { ps_code: "AC-11", service_name: "Desvios águas horizontais hall" },
  { ps_code: "SB-01", service_name: "Preparação apartamento" },
  { ps_code: "SB-02", service_name: "Janelas forro de gesso" },
  { ps_code: "SB-03", service_name: "Furação de vigas e paredes" },
  { ps_code: "SB-04", service_name: "Fixação perfilados teto" },
  { ps_code: "SB-05", service_name: "Embutimentos ramais convencionais" },
  { ps_code: "SB-06", service_name: "Barrilete aéreo em pex" },
  { ps_code: "SB-07", service_name: "Retirada papelerias/saboneteiras" },
  { ps_code: "SB-08", service_name: "Chumbamento tubo camisa" },
  { ps_code: "SB-10", service_name: "Ponto para tanque/mlr canaleta" },
  { ps_code: "SB-11", service_name: "Ponto para pia embutido" },
  { ps_code: "SB-12", service_name: "Mudança ponto para pia bancada" },
  { ps_code: "SF-01", service_name: "Ponto para lavatório aparente" },
  { ps_code: "SF-02", service_name: "Ponto para bidê aparente" },
  { ps_code: "SF-03", service_name: "Ponto chuveiro embutido" },
  { ps_code: "SF-04", service_name: "Montagem kit chuveiro" },
  { ps_code: "SF-05", service_name: "Montagem coluna de banho" },
  { ps_code: "SF-06", service_name: "Preparação ponto esgoto vaso" },
  { ps_code: "SF-07", service_name: "Montagem vaso ca" },
  { ps_code: "SF-08", service_name: "Retirada de chuveiro elétrico" },
  { ps_code: "SF-09", service_name: "Remover registro de gaveta antigo" },
  { ps_code: "SF-10", service_name: "Remover registro de pressão antigo" },
  { ps_code: "SF-11", service_name: "Remover válvula descarga antiga" },
  { ps_code: "SF-12", service_name: "Banheiro embutido convencional af" },
  { ps_code: "SF-13", service_name: "Banheiro embutido convencional af/aq" },
  { ps_code: "SF-14", service_name: "Cozinha embutido convencional" },
  { ps_code: "SF-15", service_name: "Área de serviço embutido convencional" },
  { ps_code: "SF-17", service_name: "Desativação de colunas antigas fg" },
  { ps_code: "SF-19", service_name: "Retirada de boiler no forro" },
  { ps_code: "SF-20", service_name: "Descarte de vasos antigos" },
  { ps_code: "SF-22", service_name: "Tampas de pedra" },
  { ps_code: "KP-01", service_name: "Kit perfilados shaft central" },
  { ps_code: "KP-02", service_name: "Kit coluna de recalque" },
  { ps_code: "KP-03", service_name: "Kit coluna alimentação caixa d’água" },
  { ps_code: "KP-04", service_name: "Kit coluna água fria" },
  { ps_code: "KP-05", service_name: "Kit coluna água quente" },
  { ps_code: "KP-06", service_name: "Kit manifolds" },
  { ps_code: "KP-07", service_name: "Kit perfilados de teto" },
  { ps_code: "KP-08", service_name: "Kit tubos camisa" },
  { ps_code: "KP-09", service_name: "Preparação coluna de banho" },
  { ps_code: "KP-10", service_name: "Montagem kit chuveiros" },
];

const AppSelectModel: React.FC<AppSelectModelProps> = ({
  value,
  onChange,
  placeholder = "Selecione um ps",
}) => {
  const handleValueChange = (selectedValue: string) => {
    const selectedStandard = SERVICE_STANDARDS.find(
      (s) => s.ps_code === selectedValue
    );
    onChange(selectedValue, selectedStandard?.service_name);
  };

  const PREFIX_LABELS: Record<string, string> = {
    AC: "Serviços de Área Comum",
    SB: "Serviços Brutos",
    SF: "Serviços Finos",
    KP: "Kits Prontos",
  };

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full focus-visible:ring-0">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(
          SERVICE_STANDARDS.reduce((acc, item) => {
            const prefix = item.ps_code.split("-")[0];
            if (!acc[prefix]) acc[prefix] = [];
            acc[prefix].push(item);
            return acc;
          }, {} as Record<string, typeof SERVICE_STANDARDS>)
        ).map(([prefix, standards]) => (
          <SelectGroup key={prefix}>
            <SelectLabel>{PREFIX_LABELS[prefix] ?? prefix}</SelectLabel>
            {standards.map((standard) => (
              <SelectItem key={standard.ps_code} value={standard.ps_code}>
                <div className="flex flex-col">
                  <span className="font-normal">{standard.ps_code}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AppSelectModel;