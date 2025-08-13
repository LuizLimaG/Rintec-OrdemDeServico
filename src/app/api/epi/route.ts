import { NextRequest as EPINextRequest, NextResponse as EPINextResponse } from "next/server";
import { supabase as epiSupabase } from "@/lib/supabase";

export async function GET(req: EPINextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const { data, error } = await epiSupabase
        .from("epi")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return EPINextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return EPINextResponse.json({ success: true, data });
    }

    const { data, error } = await epiSupabase
      .from("epi")
      .select("*")
      .order("id");

    if (error) {
      return EPINextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return EPINextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Erro no GET /api/epi:", err);
    return EPINextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: EPINextRequest) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || !description) {
      return EPINextResponse.json({ success: false, error: "Campos obrigatórios: name e description" }, { status: 400 });
    }

    const { data, error } = await epiSupabase
      .from("epi")
      .insert([{ name, description }])
      .select()
      .single();

    if (error) {
      return EPINextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return EPINextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error("Erro no POST /api/epi:", err);
    return EPINextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PATCH(req: EPINextRequest) {
  try {
    const body = await req.json();
    const { id, updatedData } = body;

    if (!id) {
      return EPINextResponse.json({ success: false, error: "ID é obrigatório" }, { status: 400 });
    }

    if (!updatedData || Object.keys(updatedData).length === 0) {
      return EPINextResponse.json({ success: false, error: "Nenhum campo para atualizar foi fornecido" }, { status: 400 });
    }

    const { data, error } = await epiSupabase
      .from("epi")
      .update(updatedData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return EPINextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return EPINextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Erro no PATCH /api/epi:", err);
    return EPINextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(req: EPINextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return EPINextResponse.json({ success: false, error: "ID é obrigatório" }, { status: 400 });
    }

    const { data: existing, error: checkError } = await epiSupabase
      .from("epi")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError) {
      return EPINextResponse.json({ success: false, error: checkError.message }, { status: 500 });
    }

    const { error } = await epiSupabase
      .from("epi")
      .delete()
      .eq("id", id);

    if (error) {
      return EPINextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return EPINextResponse.json({ success: true, deletedId: id });
  } catch (err) {
    console.error("Erro no DELETE /api/epi:", err);
    return EPINextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}