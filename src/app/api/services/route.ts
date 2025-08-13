import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { servicesAdvanced, servicesService } from "@/lib/database-service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const { data, error } = await supabase
        .from("services")
        .select(
          `
          *,
          service_team(
            team:team(id, name, position, primary_contact)
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
        .eq("id", id)
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { success: false, error: "Serviço não encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data });
    }

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Erro inesperado" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = body.service ?? body;
    const { type, ps, start_date, end_date, responsible, status } = payload;

    if (!type || !ps) {
      return NextResponse.json(
        { success: false, error: "Campos obrigatórios: type e ps" },
        { status: 400 }
      );
    }

    if (start_date && isNaN(Date.parse(start_date))) {
      return NextResponse.json(
        { success: false, error: "Formato de data inválido para start_date" },
        { status: 400 }
      );
    }

    if (end_date && isNaN(Date.parse(end_date))) {
      return NextResponse.json(
        { success: false, error: "Formato de data inválido para end_date" },
        { status: 400 }
      );
    }

    const { data: createdService, error: insertError } = await supabase
      .from("services")
      .insert([{ type, ps, start_date, end_date, responsible, status }])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    const associations: any = {};
    const serviceId = (createdService as any).id;

    try {
      if (
        body.observations &&
        typeof body.observations === "string" &&
        body.observations.trim().length > 0
      ) {
        const observationPayload = {
          service_id: serviceId,
          description: body.observations.trim(),
          observation_date: new Date().toISOString(),
          observation_type: "planning",
        };

        const { data: observationData, error: observationError } =
          await supabase
            .from("observations")
            .insert([observationPayload])
            .select();

        if (observationError) {
          throw new Error("Erro ao inserir observação:", observationError);
        } else {
          associations.observations = observationData;
        }
      }
    } catch (e) {
      throw new Error("Falha ao inserir observations");
    }

    try {
      if (Array.isArray(body.team) && body.team.length > 0) {
        const payloadTeam = body.team.map((teamId: any) => ({
          service_id: serviceId,
          team_id: teamId,
        }));
        const { data, error } = await supabase
          .from("service_team")
          .insert(payloadTeam)
          .select();
        if (error) {
          throw new Error("Erro ao inserir service_team:", error);
        } else {
          associations.team = data;
        }
      }
    } catch (e) {
      throw new Error("Falha ao inserir service_team");
    }

    try {
      if (Array.isArray(body.procedures) && body.procedures.length > 0) {
        const payloadProc = body.procedures.map((p: any) => {
          const procedurePayload = {
            service_id: serviceId,
            id_procedure: p.id_procedure ?? p.id_procedure ?? p.id,
            execution_order: p.execution_order || 1,
          };
          return procedurePayload;
        });

        let { data, error } = await supabase
          .from("procedure_order")
          .insert(payloadProc)
          .select();

        if (error) {
          throw new Error(
            "ERRO: Falha ao inserir procedimentos em ambas as tabelas:",
            error
          );
        } else {
          associations.procedures = data;
        }
      } else {
        throw new Error("Nenhum procedimento para inserir");
      }
    } catch (e) {
      throw new Error("Exceção ao inserir procedures");
    }

    try {
      if (Array.isArray(body.materials) && body.materials.length > 0) {
        const payloadMat = body.materials.map((m: any) => ({
          service_id: serviceId,
          material_id: m.material_id ?? m.id,
          quantity: m.quantity,
        }));
        const { data, error } = await supabase
          .from("service_materials")
          .insert(payloadMat)
          .select();
        if (error) {
          throw new Error("Erro ao inserir service_materials:", error);
        } else {
          associations.materials = data;
        }
      }
    } catch (e) {
      throw new Error("Falha ao inserir service_materials");
    }

    try {
      if (Array.isArray(body.equipments) && body.equipments.length > 0) {
        const payloadEq = body.equipments.map((eitem: any) => ({
          service_id: serviceId,
          equipment_id: eitem.equipment_id ?? eitem.id,
        }));
        const { data, error } = await supabase
          .from("service_equipments")
          .insert(payloadEq)
          .select();
        if (error) {
          throw new Error("Erro ao inserir service_equipments:", error);
        } else {
          associations.equipments = data;
        }
      }
    } catch (e) {
      throw new Error("Falha ao inserir service_equipments");
    }

    try {
      if (Array.isArray(body.epi) && body.epi.length > 0) {
        const payloadEpi = body.epi.map((ep: any) => ({
          service_id: serviceId,
          epi_id: ep.epi_id ?? ep.id,
          quantity: ep.quantity,
        }));
        const { data, error } = await supabase
          .from("service_epi")
          .insert(payloadEpi)
          .select();
        if (error) {
          throw new Error("Erro ao inserir service_epi:", error);
        } else {
          associations.epi = data;
        }
      }
    } catch (e) {
      throw new Error("Falha ao inserir service_epi");
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          service: createdService,
          associations,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID é obrigatório" },
        { status: 400 }
      );
    }

    const updatedService = await servicesService.update(id, updateData);

    return NextResponse.json({
      success: true,
      data: updatedService,
      message: "Serviço atualizado com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao atualizar serviço:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      procedures,
      materials,
      equipments,
      epis,
      team,
      ...serviceData
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID é obrigatório" },
        { status: 400 }
      );
    }

    const updatedService = await servicesService.update(id, serviceData);

    if (procedures && Array.isArray(procedures)) {
      await supabase.from("procedure_order").delete().eq("id_order", id);

      if (procedures.length > 0) {
        await servicesAdvanced.addProcedures(id, procedures);
      }
    }

    if (materials && Array.isArray(materials)) {
      await supabase.from("service_materials").delete().eq("service_id", id);

      if (materials.length > 0) {
        await servicesAdvanced.addMaterials(id, materials);
      }
    }

    if (equipments && Array.isArray(equipments)) {
      await supabase.from("service_equipments").delete().eq("service_id", id);

      if (equipments.length > 0) {
        await servicesAdvanced.addEquipments(id, equipments);
      }
    }

    if (epis && Array.isArray(epis)) {
      await supabase.from("service_epi").delete().eq("service_id", id);

      if (epis.length > 0) {
        await servicesAdvanced.addEPI(id, epis);
      }
    }

    if (team && Array.isArray(team)) {
      await supabase.from("service_team").delete().eq("service_id", id);

      if (team.length > 0) {
        const teamData = team.map((member) => ({
          service_id: id,
          team_id: member.team_id || member.id,
        }));

        await supabase.from("service_team").insert(teamData);
      }
    }

    const completeService = await servicesAdvanced.getByIdWithRelations(id);

    return NextResponse.json({
      success: true,
      data: completeService,
      message: "Serviço e relações atualizados com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao atualizar serviço completo:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
