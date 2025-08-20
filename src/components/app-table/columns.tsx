"use client";
import { ColumnDef } from "@tanstack/react-table";
import AppDropdownActions from "../app-dropdown-actions";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export type Service = {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  ps: string;
  created_at: string;
};

export const columns: ColumnDef<Service>[] = [
  {
    accessorKey: "ps",
    header: () => {
      return <div className="text-left">PS</div>;
    },
    cell: ({ row }) => {
      const item = row.getValue("ps") as string;
      return <div>{item}</div>;
    },
  },
  {
    accessorKey: "type",
    header: () => {
      return <div className="text-left">Nome</div>;
    },
    cell: ({ row }) => {
      const item = row.original.type;
      return (
        <div className="text-left">
          <Tooltip>
            <TooltipTrigger>
              <div className="max-w-[200px] truncate">{item}</div>
            </TooltipTrigger>
            <TooltipContent>{item}</TooltipContent>
          </Tooltip>
        </div>
      );
    },
  },
  {
    accessorKey: "responsible",
    header: () => {
      return <div className="text-center">Responsável</div>;
    },
    cell: ({ row }) => {
      const item = row.getValue("responsible") as string;
      return <div className="truncate text-center"> {item} </div>;
    },
  },
  {
    accessorKey: "start_date",
    header: () => {
      return <div className="text-center">Data de Início</div>;
    },
    cell: ({ row }) => {
      const endDateString = row.getValue("start_date") as string;
      const [year, month, day] = endDateString.split("-");
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      const formatedDate = date.toLocaleDateString("pt-br");
      return <div className="text-center">{formatedDate}</div>;
    },
  },
  {
    accessorKey: "end_date",
    header: () => {
      return <div className="text-center">Data de Término</div>;
    },
    cell: ({ row }) => {
      const endDateString = row.getValue("end_date") as string;
      const [year, month, day] = endDateString.split("-");
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      const formatedDate = date.toLocaleDateString("pt-br");
      return <div className="text-center">{formatedDate}</div>;
    },
  },
  {
    accessorKey: "created_at",
    header: () => {
      return <div className="text-center">Data de Criação</div>;
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      const created_at_formated = date.toLocaleDateString("pt-br");
      return <div className="text-center">{created_at_formated}</div>;
    },
  },
  {
    accessorKey: "actions",
    header: () => {
      return <div className="text-right">Ações</div>;
    },
    cell: ({ row }) => {
      const order = row.original;

      return (
        <div className="text-right">
          <AppDropdownActions id={order.id} />
        </div>
      );
    },
  },
];
