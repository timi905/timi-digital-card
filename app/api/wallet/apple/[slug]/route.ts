import fs from "fs";
import { NextResponse } from "next/server";
import { PKPass } from "passkit-generator";
import path from "path";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
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

    const pass = await PKPass.from(
      {
        model: path.join(
          process.cwd(),
          "pass-models",
          "digital-card.pass"
        ),
        certificates: {
  wwdr: Buffer.from(process.env.APPLE_WWDR_BASE64!, "base64"),
  signerCert: Buffer.from(process.env.APPLE_SIGNER_CERT_BASE64!, "base64"),
  signerKey: Buffer.from(process.env.APPLE_SIGNER_KEY_BASE64!, "base64"),
  signerKeyPassphrase: process.env.APPLE_SIGNER_KEY_PASSPHRASE!,
},
      },
      {
        serialNumber: `timi-${card.slug}-${Date.now()}`,
        webServiceURL: "https://card.timi905.com.au",
        authenticationToken: crypto.randomUUID(),
      }
    );

    const cardUrl = `https://card.timi905.com.au/card/${slug}`;

    pass.setBarcodes({
      message: cardUrl,
      format: "PKBarcodeFormatQR",
      messageEncoding: "iso-8859-1",
    });

    pass.primaryFields.push({
      key: "name",
      label: card.wallet_label || "Digital Card",
      value: card.name_en || card.name_zh || "TiMi FM",
    });

    pass.secondaryFields.push({
      key: "title",
      label: card.title_zh || "Title",
      value: card.title_en || card.title_zh || "",
    });

    pass.auxiliaryFields.push({
      key: "brand",
      label: card.brand_zh || "Brand",
      value: card.brand_en || "TiMi FM",
    });

    pass.backFields.push(
      {
        key: "phone",
        label: "Phone",
        value: card.phone || "",
      },
      {
        key: "email",
        label: "Email",
        value: card.email || "",
      },
      {
        key: "website",
        label: "Website",
        value: card.website || "https://card.timi905.com.au",
      },
      {
        key: "open",
        label: "Open Digital Card",
        value: cardUrl,
      }
    );

    const buffer = pass.getAsBuffer();
const arrayBuffer = buffer.buffer.slice(
  buffer.byteOffset,
  buffer.byteOffset + buffer.byteLength
);

return new Response(arrayBuffer, {
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="${slug}.pkpass"`,
      },
    });
  } catch (err) {
    console.error("Apple Wallet error:", err);
    return NextResponse.json(
      { error: "Failed to generate Apple Wallet pass" },
      { status: 500 }
    );
  }
}