import AppTable from "@/components/app-table";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <section className="w-full h-11/12 flex justify-center items-start p-6">
      <div className="w-full h-fit flex flex-col items-center gap-6">
        <div className="w-full bg-white shadow flex items-center justify-between rounded-sm p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Ordens de Serviço
            </h1>
            <p className="text-gray-600 mt-1">
              Crie e gerencie ordens de serviço.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href={'/createorder'} className="p-2 bg-amber-600 text-white rounded-sm flex items-center gap-2 cursor-pointer hover:bg-amber-600/95">
              <Plus size={16} />
              Criar ordem
            </Link>
          </div>
        </div>
        <div className="w-full bg-white flex flex-col shadow rounded-sm">
          <AppTable />
        </div>
      </div>
    </section>
  );
}
