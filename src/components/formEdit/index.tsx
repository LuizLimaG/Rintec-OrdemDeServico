'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Service {
  id: number;
  type: string | null;
  ps: string | null;
  start_date: string | null;
  end_date: string | null;
  responsible: string | null;
  status: string | null;
  created_at: string | null;
}

interface FormEditProps {
  service: Service;
}

export default function FormEdit({ service }: FormEditProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: service.type || '',
    ps: service.ps || '',
    start_date: service.start_date ? service.start_date.split('T')[0] : '',
    end_date: service.end_date ? service.end_date.split('T')[0] : '',
    responsible: service.responsible || '',
    status: service.status || 'planejado'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/services', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: service.id,
          ...formData
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao atualizar serviço');
      }

      alert('Serviço atualizado com sucesso!');
      router.push('/');
      router.refresh();

    } catch (error: any) {
      console.error('Erro ao atualizar:', error);
      alert(`Erro ao atualizar serviço: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
          Tipo do Serviço
        </label>
        <input
          type="text"
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Ex: Manutenção preventiva"
          required
        />
      </div>

      <div>
        <label htmlFor="ps" className="block text-sm font-medium text-gray-700 mb-2">
          PS (Permissão de Serviço)
        </label>
        <input
          type="text"
          id="ps"
          name="ps"
          value={formData.ps}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Ex: PS-2024-001"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
            Data de Início
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
            Data de Fim
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <div>
        <label htmlFor="responsible" className="block text-sm font-medium text-gray-700 mb-2">
          Responsável
        </label>
        <input
          type="text"
          id="responsible"
          name="responsible"
          value={formData.responsible}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Nome do responsável"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="Planejamento">Planejado</option>
          <option value="Em Andamento">Em Andamento</option>
          <option value="Pausada">Pausado</option>
          <option value="Concluída">Concluído</option>
          <option value="Cancelada">Cancelado</option>
        </select>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-600/95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Informações do Serviço</h3>
        <p className="text-sm text-gray-600">ID: {service.id}</p>
        <p className="text-sm text-gray-600">
          Criado em: {service.created_at ? new Date(service.created_at).toLocaleString('pt-BR') : 'N/A'}
        </p>
      </div>
    </form>
  );
} 