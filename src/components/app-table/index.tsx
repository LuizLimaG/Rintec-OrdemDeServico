"use server";
import { servicesService } from "@/lib/database-service";
import { columns, Service } from "./columns";
import { DataTable } from "./data-table";
import { useRealtimeServices } from "@/hooks/useRealtimeServices";
import RealtimeDataTable from "./RealtimeDataTable";

async function GetData(): Promise<Service[]> {
  try {
    const data = await servicesService.getAll('id', false);
    data.sort((a, b) => a.id - b.id)
    return data || [];
  } catch (error) {
    return [];
  }
}

export default async function AppTable() {
  const data = await GetData();

  return (
    <div>
      <RealtimeDataTable initialData={data} />
    </div>
  );
}