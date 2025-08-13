import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const { data, error } = await supabase
        .from("team")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    const { data, error } = await supabase
      .from("team")
      .select("*")
      .order("id");

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Erro no GET /api/team:", err);
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, position, secondary_contact, primary_contact } = body;

    if (!name || !position) {
      return NextResponse.json({ success: false, error: "Campos obrigatórios: name e position" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("team")
      .insert([{ name, position, secondary_contact, primary_contact }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error("Erro no POST /api/team:", err);
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updatedData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID é obrigatório" }, { status: 400 });
    }

    if (!updatedData || Object.keys(updatedData).length === 0) {
      return NextResponse.json({ success: false, error: "Nenhum campo para atualizar foi fornecido" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("team")
      .update(updatedData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Erro no PATCH /api/team:", err);
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID é obrigatório" }, { status: 400 });
    }

    const { data: existing, error: checkError } = await supabase
      .from("team")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError) {
      return NextResponse.json({ success: false, error: checkError.message }, { status: 500 });
    }

    const { error } = await supabase
      .from("team")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err) {
    console.error("Erro no DELETE /api/team:", err);
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
  }
}