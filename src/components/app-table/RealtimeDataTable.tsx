'use client'
import { useRealtimeServices } from "@/hooks/useRealtimeServices";
import { columns, Service } from "./columns";
import { DataTable } from "./data-table";
import { useEffect, useState } from "react";

interface RealtimeDataTableProps {
  initialData: Service[]
}

export default function RealtimeDataTable({ initialData }: RealtimeDataTableProps) {
  const [tableData, setTableData] = useState<Service[]>(initialData);
  const { services, loading, error } = useRealtimeServices();

  useEffect(() => {
    if (services && services.length > 0) {
      const sortedServices = [...services].sort((a: any, b: any) => a.id - b.id);
      setTableData(sortedServices);
    }
  }, [services]);

  if (error) {
    return (
      <div className="p-4 text-red-500 border border-red-200 rounded">
        <h3 className="font-semibold">Erro na conexão realtime</h3>
        <p>Exibindo dados estáticos. Erro: {error}</p>
        <DataTable columns={columns} data={initialData} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={tableData} loading={loading}/>
    </div>
  );
}