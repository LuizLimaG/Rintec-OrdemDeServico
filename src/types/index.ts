export interface Service {
  id?: number;
  type: string;
  ps: string;
  start_date: string;
  end_date: string;
  responsible: string;
  status: string;
  created_at?: string;
}

export interface Team {
  id: number;
  name: string;
  position: string;
  primary_contact?: string;
  secondary_contact?: string;
}

export interface Material {
  id: number;
  name: string;
  quantity?: number;
  unity_of_measure: string;
}

export interface Equipment {
  id: number;
  name: string;
  description: string;
}

export interface EPI {
  id: number;
  name: string;
  description: string;
}

export interface Procedure {
  id: number;
  name: string;
  description: string;
  estimated_time: number;
  ps: string;
}

export interface SelectedProcedure extends Procedure {
  execution_order: number;
}

export interface SelectedMaterial extends Material {
  quantity: number;
}

export interface SelectedEPI extends EPI {
  quantity: number;
}

export interface ServiceFormData {
  type: string;
  ps: string;
  start_date: string;
  end_date: string;
  responsible: string;
  status: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}