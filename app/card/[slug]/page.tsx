import { supabase } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";

export default async function CardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: card, error } = await supabase
    .from("digital_cards")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !card) {
    return (
      <main className="min-h-screen bg-[#09090F] text-white flex items-center justify-center p-6">
        <p>Card not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090F] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#C8102E33,transparent_38%),radial-gradient(circle_at_bottom,#E8A83822,transparent_36%)]" />

      <div className="relative min-h-screen flex items-center justify-center p-5">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.06] backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#C8102E] via-[#E8A838] to-[#C8102E]" />

          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              {card.logo_url && (
                <img
                  src={card.logo_url}
                  alt="Logo"
                  className="mb-6 h-12 w-auto object-contain"
                />
              )}

              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-[#E8A838] blur-xl opacity-30" />
                <div className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-br from-[#E8A838] to-[#C8102E]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-black">
                    <img
                      src={card.avatar_url || "https://placehold.co/300x300"}
                      alt={card.name_en || card.name_zh || "Digital Card"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">
                  {card.name_en}
                </h1>

                {card.name_zh && (
                  <p className="text-xl text-white/85">{card.name_zh}</p>
                )}
              </div>

              <div className="mt-4 space-y-1">
                {card.title_zh && (
                  <p className="text-white/90 font-medium">{card.title_zh}</p>
                )}

                {card.title_en && (
                  <p className="text-white/55">{card.title_en}</p>
                )}
              </div>

              <div className="mt-4 rounded-full border border-white/10 bg-white/5 px-5 py-2">
                <p className="text-sm text-white/70">
                  {card.brand_zh || card.brand_en}
                </p>
              </div>

              <a
                href={card.button_link || card.website}
                target="_blank"
                className="mt-8 w-full rounded-2xl bg-gradient-to-r from-[#C8102E] to-[#E8A838] py-4 text-lg font-bold text-white shadow-lg shadow-red-950/30 hover:scale-[1.02] transition"
              >
                {card.button_text_zh || card.button_text_en || "Open"}
              </a>

              <a
                href={`/api/vcard/${slug}`}
                className="mt-3 w-full rounded-2xl border border-[#E8A838]/35 bg-[#111111] px-4 py-3 text-center text-white transition hover:border-[#E8A838] hover:bg-[#1a1a1a]"
              >
                <p className="text-[10px] uppercase tracking-widest text-[#E8A838]/80">
                  Contact
                </p>
                <p className="mt-1 text-sm font-semibold">Save Contact</p>
              </a>

              <div className="mt-6 w-full space-y-2 text-left">
                {card.phone && (
                  <a
                    href={`tel:${card.phone}`}
                    className="block rounded-2xl bg-white/7 border border-white/10 hover:bg-white/10 transition p-3.5"
                  >
                    <p className="text-xs uppercase tracking-widest text-white/40">
                      Phone
                    </p>
                    <p className="mt-1 text-white">{card.phone}</p>
                  </a>
                )}

                {card.email && (
                  <a
                    href={`mailto:${card.email}`}
                    className="block rounded-2xl bg-white/7 border border-white/10 hover:bg-white/10 transition p-3.5"
                  >
                    <p className="text-xs uppercase tracking-widest text-white/40">
                      Email
                    </p>
                    <p className="mt-1 text-white break-all">{card.email}</p>
                  </a>
                )}

                {card.website && (
                  <a
                    href={card.website}
                    target="_blank"
                    className="block rounded-2xl bg-white/7 border border-white/10 hover:bg-white/10 transition p-3.5"
                  >
                    <p className="text-xs uppercase tracking-widest text-white/40">
                      Website
                    </p>
                    <p className="mt-1 text-white break-all">{card.website}</p>
                  </a>
                )}

                {card.instagram && (
                  <a
                    href={`https://instagram.com/${card.instagram.replace(
                      "@",
                      ""
                    )}`}
                    target="_blank"
                    className="block rounded-2xl bg-white/7 border border-white/10 hover:bg-white/10 transition p-3.5"
                  >
                    <p className="text-xs uppercase tracking-widest text-white/40">
                      Instagram
                    </p>
                    <p className="mt-1 text-white">{card.instagram}</p>
                  </a>
                )}
              </div>

              <div className="mt-8 flex flex-col items-center">
                <div className="rounded-2xl bg-white p-3">
                  <QRCodeSVG
                    value={`https://card.timi905.com.au/card/${slug}`}
                    size={120}
                  />
                </div>

                <p className="mt-3 text-xs text-white/40">
                  {card.qr_label_zh ||
                    card.qr_label_en ||
                    "Scan to open digital card"}
                </p>
              </div>

              <p className="mt-8 text-xs text-white/35">
                {card.brand_en} · {card.tagline_zh || card.tagline_en}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}