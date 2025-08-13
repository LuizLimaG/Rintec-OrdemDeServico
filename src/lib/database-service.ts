import { supabase } from "@/lib/supabase";

class DatabaseService {
  constructor(private tableName: string) {}

  async getAll(orderBy = "id", ascending = true) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .order(orderBy, { ascending });

    if (error) throw error;
    return data;
  }

  async getById(id: number) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  async create(data: any) {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async update(id: number, data: any) {
    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async delete(id: number) {
    const { error } = await supabase.from(this.tableName).delete().eq("id", id);

    if (error) throw error;
    return true;
  }
}

export const servicesService = new DatabaseService("services");
export const proceduresService = new DatabaseService("procedures");
export const teamService = new DatabaseService("team");
export const materialsService = new DatabaseService("materials");
export const equipmentsService = new DatabaseService("equipments");
export const epiService = new DatabaseService("epi");
export const observationsService = new DatabaseService("observations");
export const procedureOrderService = new DatabaseService("procedure_order");

export class ServicesAdvanced extends DatabaseService {
  constructor() {
    super("services");
  }

  async getWithRelations() {
    const { data, error } = await supabase
      .from("services")
      .select(
        `
        *,
        service_team(
          team:team(id, name, position)
        ),
        procedure_order(
          execution_order,
          procedure:procedures(id, name, description, estimated_time, ps)
        ),
        service_materials(
          quantity,
          material:materials(id, name, unity_of_measure)
        ),
        service_equipments(
          equipment:equipments(id, name, description)
        ),
        service_epi(
          quantity,
          epi_item:epi(id, name, description)
        ),
        observations(
          id,
          description,
          observation_date,
          observation_type,
          team_member:team(id, name, position)
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  async getByIdWithRelations(id: number) {
    try {
      const res = await fetch(`/api/services?id=${encodeURIComponent(id)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });


      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error || `Erro ao buscar serviço (status ${res.status})`
        );
      }

      return json.data;
    } catch (err) {
      console.error("Erro no getByIdWithRelations:", err);
      throw err;
    }
  }

  async addProcedures(
    serviceId: number,
    procedures: Array<{ id_procedure: number; execution_order: number }>
  ) {
    const { data, error } = await supabase.from("procedure_order").insert(
      procedures.map((proc) => ({
        id_order: serviceId,
        id_procedure: proc.id_procedure,
        execution_order: proc.execution_order,
      }))
    );

    if (error) throw error;
    return data;
  }

  async addMaterials(
    serviceId: number,
    materials: Array<{ material_id: number; quantity: number }>
  ) {
    const { data, error } = await supabase.from("service_materials").insert(
      materials.map((mat) => ({
        service_id: serviceId,
        material_id: mat.material_id,
        quantity: mat.quantity,
      }))
    );

    if (error) throw error;
    return data;
  }

  async addEquipments(
    serviceId: number,
    equipments: Array<{ equipment_id: number }>
  ) {
    const { data, error } = await supabase.from("service_equipments").insert(
      equipments.map((eq) => ({
        service_id: serviceId,
        equipment_id: eq.equipment_id,
      }))
    );

    if (error) throw error;
    return data;
  }

  async addEPI(
    serviceId: number,
    epis: Array<{ epi_id: number; quantity: number }>
  ) {
    const { data, error } = await supabase.from("service_epi").insert(
      epis.map((epi) => ({
        service_id: serviceId,
        epi_id: epi.epi_id,
        quantity: epi.quantity,
      }))
    );

    if (error) throw error;
    return data;
  }

  async updateServiceWithRelations(
    serviceId: number,
    serviceData: any,
    relations?: {
      procedures?: Array<{ id_procedure: number; execution_order: number }>;
      materials?: Array<{ material_id: number; quantity: number }>;
      equipments?: Array<{ equipment_id: number }>;
      epis?: Array<{ epi_id: number; quantity: number }>;
      team?: Array<{ team_id: number }>;
    }
  ) {
    try {
      const updatedService = await this.update(serviceId, serviceData);

      if (relations) {
        if (relations.procedures !== undefined) {
          await this.updateServiceProcedures(serviceId, relations.procedures);
        }

        if (relations.materials !== undefined) {
          await this.updateServiceMaterials(serviceId, relations.materials);
        }

        if (relations.equipments !== undefined) {
          await this.updateServiceEquipments(serviceId, relations.equipments);
        }

        if (relations.epis !== undefined) {
          await this.updateServiceEPIs(serviceId, relations.epis);
        }

        if (relations.team !== undefined) {
          await this.updateServiceTeam(serviceId, relations.team);
        }
      }

      return updatedService;
    } catch (error) {
      console.error("Erro ao atualizar serviço com relacionamentos:", error);
      throw error;
    }
  }

  async updateServiceProcedures(
    serviceId: number,
    procedures: Array<{ id_procedure: number; execution_order: number }>
  ) {
    await supabase.from("procedure_order").delete().eq("id_order", serviceId);

    if (procedures.length > 0) {
      await this.addProcedures(serviceId, procedures);
    }
  }

  async updateServiceMaterials(
    serviceId: number,
    materials: Array<{ material_id: number; quantity: number }>
  ) {
    await supabase
      .from("service_materials")
      .delete()
      .eq("service_id", serviceId);

    if (materials.length > 0) {
      await this.addMaterials(serviceId, materials);
    }
  }

  async updateServiceEquipments(
    serviceId: number,
    equipments: Array<{ equipment_id: number }>
  ) {
    await supabase
      .from("service_equipments")
      .delete()
      .eq("service_id", serviceId);

    if (equipments.length > 0) {
      await this.addEquipments(serviceId, equipments);
    }
  }

  async updateServiceEPIs(
    serviceId: number,
    epis: Array<{ epi_id: number; quantity: number }>
  ) {
    await supabase.from("service_epi").delete().eq("service_id", serviceId);

    if (epis.length > 0) {
      await this.addEPI(serviceId, epis);
    }
  }

  async updateServiceTeam(serviceId: number, team: Array<{ team_id: number }>) {
    await supabase.from("service_team").delete().eq("service_id", serviceId);

    if (team.length > 0) {
      const teamData = team.map((member) => ({
        service_id: serviceId,
        team_id: member.team_id,
      }));

      await supabase.from("service_team").insert(teamData);
    }
  }

  async getBasicById(id: number) {
    return await this.getById(id);
  }

  async validateServiceExists(id: number): Promise<boolean> {
    try {
      const service = await this.getById(id);
      return !!service;
    } catch (error) {
      return false;
    }
  }
}

export const servicesAdvanced = new ServicesAdvanced();

export interface Service {
  id: number;
  type: string | null;
  ps: string | null;
  start_date: string | null;
  end_date: string | null;
  responsible: string | null;
  status: string | null;
  created_at: string | null;
}

export interface Team {
  id: number;
  name: string | null;
  position: string | null;
  primary_contect: string | null;
  secondary_contact: string | null;
}

export interface Material {
  id: number;
  name: string | null;
  quantity: number | null;
  unity_of_measure: string | null;
}

export interface Equipment {
  id: number;
  name: string | null;
  description: string | null;
}

export interface EPI {
  id: number;
  name: string | null;
  description: string | null;
}

export interface Procedure {
  id: number;
  description: string | null;
  name: string | null;
  estimated_time: number | null;
}

export interface Observation {
  id: number;
  service_id: number | null;
  description: string | null;
  observation_date: string | null;
  observation_type: string | null;
  team_member_id: number | null;
}
