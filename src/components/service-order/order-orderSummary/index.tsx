interface OrderSummaryProps {
    teamCount: number;
    proceduresCount: number;
    materialsCount: number;
    epiCount: number;
    totalEstimatedTime: number;
    observations: string;
}

export default function OrderSummary(props: OrderSummaryProps) {
  return (
    <div className="bg-amber-50 rounded-lg p-6 max-w-[1280px]">
      <h3 className="text-lg font-semibold text-amber-900 mb-4">
        Resumo da Ordem de Serviço
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
        <div>
          <div className="font-medium text-amber-800">Equipe</div>
          <div className="text-amber-700">{props.teamCount} membros</div>
        </div>
        <div>
          <div className="font-medium text-amber-800">Procedimentos</div>
          <div className="text-amber-700">
            {props.proceduresCount} itens
          </div>
        </div>
        <div>
          <div className="font-medium text-amber-800">Materiais</div>
          <div className="text-amber-700">{props.materialsCount} itens</div>
        </div>
        <div>
          <div className="font-medium text-amber-800">EPIs</div>
          <div className="text-amber-700">{props.epiCount} itens</div>
        </div>
        <div>
          <div className="font-medium text-amber-800">Tempo Estimado</div>
          <div className="text-amber-700">{props.totalEstimatedTime} min</div>
        </div>
      </div>

      <div className="mt-4 pt-2.5 border-t border-amber-200">
        <div className="font-medium text-amber-800">Observações:</div>
        <div className="text-amber-700 text-sm overflow-hidden">
          <span className="w-full">
            {props.observations || "Nenhuma observação adicionada."}
          </span>
        </div>
      </div>
    </div>
  );
}
