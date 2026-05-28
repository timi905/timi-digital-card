import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
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

    const credentials = JSON.parse(process.env.GOOGLE_WALLET_CREDENTIALS!);
    const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID!;

    const safeSlug = slug.replace(/[^a-zA-Z0-9_-]/g, "_");
    const classId = `${issuerId}.timi_digital_card`;
    const objectId = `${issuerId}.digital_card_${safeSlug}`;

    const cardUrl = `https://card.timi905.com.au/card/${slug}`;

    const claims = {
      iss: credentials.client_email,
      aud: "google",
      typ: "savetowallet",
      iat: Math.floor(Date.now() / 1000),
      origins: ["https://card.timi905.com.au"],
      payload: {
        genericClasses: [
          {
            id: classId,
            classTemplateInfo: {
              cardTemplateOverride: {
                cardRowTemplateInfos: [
                  {
                    twoItems: {
                      startItem: {
                        firstValue: {
                          fields: [
                            {
                              fieldPath: "object.textModulesData['title']",
                            },
                          ],
                        },
                      },
                      endItem: {
                        firstValue: {
                          fields: [
                            {
                              fieldPath: "object.textModulesData['brand']",
                            },
                          ],
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
        genericObjects: [
          {
            id: objectId,
            classId,
            genericType: "GENERIC_TYPE_UNSPECIFIED",
            hexBackgroundColor: "#09090F",
            logo: {
              sourceUri: {
                uri:
                  card.logo_url ||
                  "https://card.timi905.com.au/favicon.ico",
              },
              contentDescription: {
                defaultValue: {
                  language: "en-US",
                  value: "TiMi FM",
                },
              },
            },
            cardTitle: {
              defaultValue: {
                language: "en-US",
                value: card.brand_en || "TiMi FM",
              },
            },
            header: {
              defaultValue: {
                language: "en-US",
                value: card.name_en || card.name_zh || "Digital Card",
              },
            },
            subheader: {
              defaultValue: {
                language: "en-US",
                value: card.title_en || card.title_zh || "",
              },
            },
            barcode: {
              type: "QR_CODE",
              value: cardUrl,
              alternateText: "Open digital card",
            },
            textModulesData: [
              {
                id: "title",
                header: card.title_zh || "Title",
                body: card.title_en || "",
              },
              {
                id: "brand",
                header: card.brand_zh || "Brand",
                body: card.brand_en || "TiMi FM",
              },
              {
                id: "phone",
                header: "Phone",
                body: card.phone || "",
              },
              {
                id: "email",
                header: "Email",
                body: card.email || "",
              },
              {
                id: "website",
                header: "Website",
                body: card.website || cardUrl,
              },
            ].filter((item) => item.body),
            linksModuleData: {
              uris: [
                {
                  uri: cardUrl,
                  description: "Open Digital Card",
                },
                card.website
                  ? {
                      uri: card.website,
                      description: "Website",
                    }
                  : null,
              ].filter(Boolean),
            },
          },
        ],
      },
    };

    const token = jwt.sign(claims, credentials.private_key, {
      algorithm: "RS256",
    });

    return NextResponse.redirect(
      `https://pay.google.com/gp/v/save/${token}`
    );
  } catch (err) {
    console.error("Google Wallet error:", err);
    return NextResponse.json(
      { error: "Failed to generate Google Wallet pass" },
      { status: 500 }
    );
  }
}