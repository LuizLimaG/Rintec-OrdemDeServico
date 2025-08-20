import FormEdit from '@/components/formEdit'
import { supabase } from '@/lib/supabase'

export default async function PaginaEditar({ params }: any) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) return <div>Erro ao carregar serviço</div>

  return (
    <div className="flex flex-col items-center justify-center">
      <FormEdit service={data} />
    </div>
  )
}
