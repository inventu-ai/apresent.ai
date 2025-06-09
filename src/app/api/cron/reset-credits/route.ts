import { NextResponse } from "next/server";

// Esta API não é mais necessária - o reset agora é automático baseado no banco
export async function POST() {
  return NextResponse.json({ 
    message: "Reset automático implementado - esta API não é mais necessária",
    info: "O sistema agora verifica e reseta créditos automaticamente baseado nas datas no banco de dados"
  });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
