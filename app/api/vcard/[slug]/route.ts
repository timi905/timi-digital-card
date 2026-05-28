import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

function escapeVCard(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: card, error } = await supabase
    .from("digital_cards")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const fullName = card.name_en || card.name_zh || "TiMi FM";
  const org = card.brand_en || card.brand_zh || "TiMi FM";
  const title = card.title_en || card.title_zh || "";
  const website = card.website || `https://card.timi905.com.au/card/${slug}`;
  const note = `Digital card: https://card.timi905.com.au/card/${slug}`;

  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCard(fullName)}`,
    `ORG:${escapeVCard(org)}`,
    `TITLE:${escapeVCard(title)}`,
    card.phone ? `TEL;TYPE=CELL:${escapeVCard(card.phone)}` : "",
    card.email ? `EMAIL;TYPE=INTERNET:${escapeVCard(card.email)}` : "",
    `URL:${escapeVCard(website)}`,
    card.instagram
      ? `X-SOCIALPROFILE;TYPE=instagram:https://instagram.com/${escapeVCard(
          card.instagram.replace("@", "")
        )}`
      : "",
    `NOTE:${escapeVCard(note)}`,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");

  return new Response(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.vcf"`,
    },
  });
}