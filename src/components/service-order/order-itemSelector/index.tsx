import { Plus, X, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";

interface BaseItem {
  id: string | number;
  name: string;
  description?: string;
}

interface ProcedureItem extends BaseItem {
  ps: string;
  estimated_time?: number;
}

interface MaterialItem extends BaseItem {
  unity_of_measure: string;
  quantity?: number;
}

interface EquipmentItem extends BaseItem {
  description: string;
}

interface EPIItem extends BaseItem {
  description: string;
  quantity?: number;
}

interface SelectionSectionProps<T extends BaseItem> {
  title: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  available: T[];
  selected: T[];
  onAdd: (item: T) => void;
  onRemove: (id: string | number) => void;
  onAddNew: () => void;
  filtered?: T[];
  filterLabel?: string;
  renderAvailableItem: (item: T, onAdd: (item: T) => void) => React.ReactNode;
  renderSelectedItem: (
    item: T,
    onRemove: (id: string | number) => void,
    onUpdateQuantity?: (id: string | number, quantity: number) => void
  ) => React.ReactNode;
  hasQuantity?: boolean;
  onUpdateQuantity?: (id: string | number, quantity: number) => void;
}

function SelectionSection<T extends BaseItem>({
  title,
  icon,
  available,
  selected,
  onAdd,
  onRemove,
  onAddNew,
  filtered,
  filterLabel,
  renderAvailableItem,
  renderSelectedItem,
  hasQuantity = false,
  onUpdateQuantity,
  children,
}: SelectionSectionProps<T>) {
  const showFiltered = filtered && filtered.length > 0;
  const gridCols = showFiltered ? "lg:grid-cols-3" : "lg:grid-cols-2";

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-xl font-semibold">{title} *</h2>
          <div>{children}</div>
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 px-3 py-1.5 text-white bg-amber-600 rounded-sm hover:bg-amber-600/95 cursor-pointer"
        >
          <Plus size={16} />
          Adicionar {title.toLowerCase()}
        </button>
      </div>

      <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
        {showFiltered && (
          <div>
            <h3 className="flex font-medium text-gray-900 mb-3 gap-2 items-center">
              Todos os {title}
              <span className="font-normal text-xs">({available.length})</span>
            </h3>
            <ItemList
              items={available}
              renderItem={(item) => renderAvailableItem(item, onAdd)}
              emptyMessage={`Nenhum ${title.toLowerCase()} encontrado.`}
            />
          </div>
        )}

        <div>
          <h3 className="flex font-medium text-gray-900 mb-3 gap-2 items-center">
            {showFiltered ? (
              <>
                {filterLabel}
                <span className="font-normal text-xs">
                  ({filtered!.length})
                </span>
              </>
            ) : (
              <>Disponíveis</>
            )}
          </h3>
          <ItemList
            items={showFiltered ? filtered! : available}
            renderItem={(item) => renderAvailableItem(item, onAdd)}
            emptyMessage={`Nenhum ${title.toLowerCase()} encontrado.`}
          />
        </div>

        <div>
          <h3 className="flex font-medium text-gray-900 mb-3 gap-2 items-center">
            Selecionados
          </h3>
          <ItemList
            items={selected}
            renderItem={(item) =>
              renderSelectedItem(item, onRemove, onUpdateQuantity)
            }
            emptyMessage={`Nenhum ${title.toLowerCase()} selecionado`}
          />
        </div>
      </div>
    </div>
  );
}

interface ItemListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  emptyMessage: string;
}

function ItemList<T>({ items, renderItem, emptyMessage }: ItemListProps<T>) {
  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {items.length > 0 ? (
        items.map(renderItem)
      ) : (
        <div className="flex gap-2 items-center justify-center text-gray-500">
          <p className="text-sm">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}

export function ProcedureAvailableItem({
  procedure,
  onAdd,
}: {
  procedure: ProcedureItem;
  onAdd: (item: ProcedureItem) => void;
}) {
  return (
    <div
      key={procedure.id}
      className="p-3 border border-gray-200 rounded-sm hover:bg-gray-50 cursor-pointer"
      onClick={() => onAdd(procedure)}
    >
      <div className="font-normal flex items-center justify-between">
        {procedure.name}
        <span className="font-normal text-xs">{procedure.ps}</span>
      </div>
    </div>
  );
}

export function ProcedureSelectedItem({
  procedure,
  onRemove,
}: {
  procedure: ProcedureItem;
  onRemove: (id: string | number) => void;
}) {
  return (
    <div
      key={procedure.id}
      className="group flex items-center gap-3 p-3 border border-amber-400 rounded-sm hover:border-amber-500"
    >
      <div className="flex-1">
        <div className="font-normal cursor-default">{procedure.name}</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onRemove(procedure.id)}
          className="text-red-600/70 group-hover:text-red-700 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function MaterialAvailableItem({
  material,
  onAdd,
}: {
  material: MaterialItem;
  onAdd: (item: MaterialItem) => void;
}) {
  return (
    <div
      key={material.id}
      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-between"
      onClick={() => onAdd(material)}
    >
      <div className="flex items-center gap-2">
        <div className="font-normal">{material.name}</div>
        <div className="text-sm text-gray-600 lowercase">
          {material.unity_of_measure}
        </div>
      </div>
      <Plus className="w-4 h-4 text-gray-400" />
    </div>
  );
}

export function MaterialSelectedItem({
  material,
  onRemove,
  onUpdateQuantity,
}: {
  material: MaterialItem;
  onRemove: (id: string | number) => void;
  onUpdateQuantity?: (id: string | number, quantity: number) => void;
}) {
  return (
    <div
      key={material.id}
      className="flex items-center gap-3 p-3 border border-amber-400 rounded-lg hover:border-amber-500"
    >
      <div className="flex-1 flex items-center gap-2">
        <div className="font-normal cursor-default">{material.name}</div>
        <span className="cursor-default">-</span>
        <div className="text-sm text-gray-600 lowercase cursor-default">
          {material.unity_of_measure}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          min="1"
          className="w-10 h-4 text-sm text-center focus-visible:ring-0 border-none shadow-none rounded-sm"
          value={material.quantity || 1}
          onChange={(e) =>
            onUpdateQuantity?.(material.id, parseInt(e.target.value) || 1)
          }
        />
        <button
          type="button"
          onClick={() => onRemove(material.id)}
          className="text-red-600 hover:text-red-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function EquipmentAvailableItem({
  equipment,
  onAdd,
}: {
  equipment: EquipmentItem;
  onAdd: (item: EquipmentItem) => void;
}) {
  return (
    <div
      key={equipment.id}
      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-between"
      onClick={() => onAdd(equipment)}
    >
      <div className="flex items-center gap-2">
        <div className="font-normal">{equipment.name}</div>
        <div className="text-sm text-gray-600">{equipment.description}</div>
      </div>
      <Plus className="w-4 h-4 text-gray-400" />
    </div>
  );
}

export function EquipmentSelectedItem({
  equipment,
  onRemove,
}: {
  equipment: EquipmentItem;
  onRemove: (id: string | number) => void;
}) {
  return (
    <div
      key={equipment.id}
      className="flex items-center justify-between p-3 border border-amber-400 rounded-lg hover:border-amber-500"
    >
      <div className="flex items-center gap-2">
        <div className="font-normal cursor-default">{equipment.name}</div>
        <span className="cursor-default">-</span>
        <div className="text-sm text-gray-600 cursor-default">
          {equipment.description}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(equipment.id)}
        className="text-red-600 hover:text-red-800 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function EPIAvailableItem({
  epi,
  onAdd,
}: {
  epi: EPIItem;
  onAdd: (item: EPIItem) => void;
}) {
  return (
    <div
      key={epi.id}
      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-between"
      onClick={() => onAdd(epi)}
    >
      <div className="flex items-center gap-2">
        <div className="font-normal">{epi.name}</div>
        <div className="text-sm text-gray-600">{epi.description}</div>
      </div>
      <Plus className="w-4 h-4 text-gray-400" />
    </div>
  );
}

export function EPISelectedItem({
  epi,
  onRemove,
  onUpdateQuantity,
}: {
  epi: EPIItem;
  onRemove: (id: string | number) => void;
  onUpdateQuantity?: (id: string | number, quantity: number) => void;
}) {
  return (
    <div
      key={epi.id}
      className="flex items-center gap-3 p-3 border border-amber-400 rounded-lg hover:border-amber-500"
    >
      <div className="flex-1 flex items-center gap-2">
        <div className="font-normal cursor-default">{epi.name}</div>
        <span className="cursor-default">-</span>
        <div className="text-sm text-gray-600 cursor-default">
          {epi.description}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          min="1"
          className="w-10 h-4 text-sm rounded text-center focus-visible:ring-0 border-none shadow-none"
          value={epi.quantity || 1}
          onChange={(e) =>
            onUpdateQuantity?.(epi.id, parseInt(e.target.value) || 1)
          }
        />
        <button
          type="button"
          onClick={() => onRemove(epi.id)}
          className="text-red-600 hover:text-red-800 cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default SelectionSection;
