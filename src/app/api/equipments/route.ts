import { NextRequest as ENextRequest, NextResponse as ENextResponse } from "next/server";
import { supabase as eSupabase } from "@/lib/supabase";

export async function GET(req: ENextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const { data, error } = await eSupabase
        .from("equipments")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return ENextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return ENextResponse.json({ success: true, data });
    }

    const { data, error } = await eSupabase
      .from("equipments")
      .select("*")
      .order("id");

    if (error) {
      return ENextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return ENextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Erro no GET /api/equipments:", err);
    return ENextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: ENextRequest) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || !description) {
      return ENextResponse.json({ success: false, error: "Campos obrigatórios: name e description" }, { status: 400 });
    }

    const { data, error } = await eSupabase
      .from("equipments")
      .insert([{ name, description }])
      .select()
      .single();

    if (error) {
      return ENextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return ENextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error("Erro no POST /api/equipments:", err);
    return ENextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PATCH(req: ENextRequest) {
  try {
    const body = await req.json();
    const { id, updatedData } = body;

    if (!id) {
      return ENextResponse.json({ success: false, error: "ID é obrigatório" }, { status: 400 });
    }

    if (!updatedData || Object.keys(updatedData).length === 0) {
      return ENextResponse.json({ success: false, error: "Nenhum campo para atualizar foi fornecido" }, { status: 400 });
    }

    const { data, error } = await eSupabase
      .from("equipments")
      .update(updatedData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return ENextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return ENextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Erro no PATCH /api/equipments:", err);
    return ENextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(req: ENextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return ENextResponse.json({ success: false, error: "ID é obrigatório" }, { status: 400 });
    }

    const { data: existing, error: checkError } = await eSupabase
      .from("equipments")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError) {
      return ENextResponse.json({ success: false, error: checkError.message }, { status: 500 });
    }

    const { error } = await eSupabase
      .from("equipments")
      .delete()
      .eq("id", id);

    if (error) {
      return ENextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return ENextResponse.json({ success: true, deletedId: id });
  } catch (err) {
    console.error("Erro no DELETE /api/equipments:", err);
    return ENextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}