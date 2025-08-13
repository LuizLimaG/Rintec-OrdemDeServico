import { NextRequest as PRNextRequest, NextResponse as PRNextResponse } from "next/server";
import { supabase as prSupabase } from "@/lib/supabase";

export async function GET(req: PRNextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const { data, error } = await prSupabase
        .from("procedures")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return PRNextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return PRNextResponse.json({ success: true, data });
    }

    const { data, error } = await prSupabase
      .from("procedures")
      .select("*")
      .order("id");

    if (error) {
      return PRNextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return PRNextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Erro no GET /api/procedures:", err);
    return PRNextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: PRNextRequest) {
  try {
    const body = await req.json();
    const { description, name, estimated_time, ps } = body;

    if (!name || !description) {
      return PRNextResponse.json({ success: false, error: "Campos obrigatórios: name e description" }, { status: 400 });
    }

    const { data, error } = await prSupabase
      .from("procedures")
      .insert([{ description, name, estimated_time, ps }])
      .select()
      .single();

    if (error) {
      return PRNextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return PRNextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error("Erro no POST /api/procedures:", err);
    return PRNextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PATCH(req: PRNextRequest) {
  try {
    const body = await req.json();
    const { id, updatedData } = body;

    if (!id) {
      return PRNextResponse.json({ success: false, error: "ID é obrigatório" }, { status: 400 });
    }

    if (!updatedData || Object.keys(updatedData).length === 0) {
      return PRNextResponse.json({ success: false, error: "Nenhum campo para atualizar foi fornecido" }, { status: 400 });
    }

    const { data, error } = await prSupabase
      .from("procedures")
      .update(updatedData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return PRNextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return PRNextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Erro no PATCH /api/procedures:", err);
    return PRNextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(req: PRNextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return PRNextResponse.json({ success: false, error: "ID é obrigatório" }, { status: 400 });
    }

    const { data: existing, error: checkError } = await prSupabase
      .from("procedures")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError) {
      return PRNextResponse.json({ success: false, error: checkError.message }, { status: 500 });
    }

    const { error } = await prSupabase
      .from("procedures")
      .delete()
      .eq("id", id);

    if (error) {
      return PRNextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return PRNextResponse.json({ success: true, deletedId: id });
  } catch (err) {
    console.error("Erro no DELETE /api/procedures:", err);
    return PRNextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}
