import { NextRequest as MNextRequest, NextResponse as MNextResponse } from "next/server";
import { supabase as mSupabase } from "@/lib/supabase";

export async function GET(req: MNextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const { data, error } = await mSupabase
        .from("materials")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return MNextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return MNextResponse.json({ success: true, data });
    }

    const { data, error } = await mSupabase
      .from("materials")
      .select("*")
      .order("id");

    if (error) {
      return MNextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Normalize field name if DB column is named 'unity_of_measure'
    const normalized = (data || []).map((row: any) => ({
      ...row,
      unity_of_measure: row.unity_of_measure ?? row.unity_of_measure ?? null,
    }));

    return MNextResponse.json({ success: true, data: normalized });
  } catch (err) {
    console.error("Erro no GET /api/materials:", err);
    return MNextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: MNextRequest) {
  try {
    const body = await req.json();
    // accept either unity_of_measure or unity_of_measure
    const unity_of_measure = body.unity_of_measure ?? body.unity_of_measure;
    const { name } = body;

    if (!name || !unity_of_measure) {
      return MNextResponse.json({ success: false, error: "Campos obrigatórios: name e unity_of_measure" }, { status: 400 });
    }

    const insertPayload: any = { name, unity_of_measure };

    const { data, error } = await mSupabase
      .from("materials")
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      return MNextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Normalize returned row
    const normalized = { ...data, unity_of_measure: data.unity_of_measure ?? data.unity_of_measure ?? null };

    return MNextResponse.json({ success: true, data: normalized }, { status: 201 });
  } catch (err) {
    console.error("Erro no POST /api/materials:", err);
    return MNextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PATCH(req: MNextRequest) {
  try {
    const body = await req.json();
    const { id, updatedData } = body;

    if (!id) {
      return MNextResponse.json({ success: false, error: "ID é obrigatório" }, { status: 400 });
    }

    if (!updatedData || Object.keys(updatedData).length === 0) {
      return MNextResponse.json({ success: false, error: "Nenhum campo para atualizar foi fornecido" }, { status: 400 });
    }

    if (updatedData.unity_of_measure && !updatedData.unity_of_measure) {
      updatedData.unity_of_measure = updatedData.unity_of_measure;
    }

    const { data, error } = await mSupabase
      .from("materials")
      .update(updatedData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return MNextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const normalized = { ...data, unity_of_measure: data.unity_of_measure ?? data.unity_of_measure ?? null };

    return MNextResponse.json({ success: true, data: normalized });
  } catch (err) {
    console.error("Erro no PATCH /api/materials:", err);
    return MNextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(req: MNextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return MNextResponse.json({ success: false, error: "ID é obrigatório" }, { status: 400 });
    }

    const { data: existing, error: checkError } = await mSupabase
      .from("materials")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError) {
      return MNextResponse.json({ success: false, error: checkError.message }, { status: 500 });
    }

    const { error } = await mSupabase
      .from("materials")
      .delete()
      .eq("id", id);

    if (error) {
      return MNextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return MNextResponse.json({ success: true, deletedId: id });
  } catch (err) {
    console.error("Erro no DELETE /api/materials:", err);
    return MNextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}