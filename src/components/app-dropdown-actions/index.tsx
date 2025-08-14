import {
  ChevronDown,
  Eye,
  MoreHorizontal,
  Pen,
  Pencil,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { servicesService } from "@/lib/database-service";

interface AppDropdownActionsProps {
  id: string;
}

export default function AppDropdownActions({ id }: AppDropdownActionsProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const viewOrder = () => {
    router.push(`/order/service/${id}`);
  };

  const editOrder = () => {
    router.push(`/service/${id}`);
  };

  const deleteItem = async () => {
    setIsDeleting(true);

    try {
      await servicesService.delete(Number(id));

      setIsDeleteModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Erro ao deletar o serviço: " + (error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer">
          <div className="flex items-end gap-2 px-2 py-1 border rounded-sm">
            Ver
            <MoreHorizontal size={16} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuItem>
            <button
              onClick={() => editOrder()}
              className="flex items-center gap-2 p-1 text-black font-medium"
            >
              <SquarePen size={20} color="black" />
              Editar
            </button>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <button
              onClick={() => viewOrder()}
              className="flex items-center gap-2 p-1 text-black font-medium"
            >
              <Eye size={20} color="black" />
              Visualizar
            </button>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <button
              onClick={() => handleDeleteClick()}
              className="flex items-center gap-2 p-1 text-red-500 font-medium"
            >
              <Trash2 size={20} color="red" />
              Deletar
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá deletar permanentemente
              o serviço e remover todos os dados relacionados dos nossos
              servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteItem}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deletando..." : "Sim, deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
