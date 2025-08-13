import FormEdit from '@/components/formEdit'
import { supabase } from '@/lib/supabase'

export default async function PaginaEditar({ params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) return <div>Erro ao carregar serviço</div>

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Editar Serviço</h1>
      <FormEdit service={data} />
    </div>
  )
}
