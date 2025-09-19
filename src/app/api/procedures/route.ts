import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const ps = searchParams.get("ps");

    if (id) {
      const { data, error } = await supabase
        .from("procedures")
        .select(
          `
          *,
          procedure_materials(
            quantity,
            material:materials(id, name, unity_of_measure)
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

      return NextResponse.json({ success: true, data });
    }

    let query = supabase
      .from("procedures")
      .select(
        `
        *,
        procedure_materials(
          quantity,
          material:materials(id, name, unity_of_measure)
        )
      `
      )
      .order("id", { ascending: true });

    if (ps) {
      query = query.eq("ps", ps);
    }

    const { data, error } = await query;

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
    const { name, description, estimated_time, ps, materials } = body;

    if (!name || !ps) {
      return NextResponse.json(
        { success: false, error: "Nome e PS são obrigatórios" },
        { status: 400 }
      );
    }

    const { data: procedure, error: procedureError } = await supabase
      .from("procedures")
      .insert([{ name, description, estimated_time, ps }])
      .select()
      .single();

    if (procedureError) {
      return NextResponse.json(
        { success: false, error: procedureError.message },
        { status: 500 }
      );
    }

    if (materials && Array.isArray(materials) && materials.length > 0) {
      const procedureMaterials = materials.map((material: any) => ({
        procedure_id: procedure.id,
        material_id: material.material_id || material.id,
        quantity: material.quantity || 1,
      }));

      const { error: materialsError } = await supabase
        .from("procedure_materials")
        .insert(procedureMaterials);

      if (materialsError) {
        await supabase.from("procedures").delete().eq("id", procedure.id);
        return NextResponse.json(
          {
            success: false,
            error: "Erro ao associar materiais ao procedimento",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: true, data: procedure },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
