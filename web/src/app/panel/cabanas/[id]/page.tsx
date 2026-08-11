import Link from "next/link";
import { notFound } from "next/navigation";
import SaveForm from "@/components/panel/SaveForm";
import ImageManager from "@/components/panel/ImageManager";
import Icon from "@/components/Icon";
import { Field, inputCx } from "@/components/Bits";
import { updatePropertyAction, addAmenityAction, deleteAmenityAction, addBlockAction, deleteBlockAction } from "@/app/actions";
import { getPropertyById, getImages, getAmenities, getBlocks } from "@/lib/data";
import { prettyDate } from "@/lib/utils";

const ICONS = ["check","wifi","river","snow","heat","fire","bbq","kitchen","utensils","fridge","microwave","oven","toaster","kettle","coffee","cleaning","bath","shower","bidet","toilet","tv","streaming","cable","balcony","terrace","patio","garden","beach","view","family","restaurant","bar","sofa","wardrobe","hanger","plug","floor","fan","hiking","kayak","fishing","boat","accessible","nosmoke","language","bed"];

export default async function EditProperty({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getPropertyById(id);
  if (!p) notFound();

  const [images, amenities, blocks] = await Promise.all([getImages(p.id), getAmenities(p.id), getBlocks(p.id)]);
  const categories = [...new Set(amenities.map((a) => a.category))];

  return (
    <div className="space-y-16">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-[clamp(1.6rem,3.6vw,2.4rem)]">{p.name}</h2>
        <Link href={`/cabanas/${p.slug}`} target="_blank" className="ul-slide text-[13px] text-ink-45 hover:text-ink">Ver publicada ↗</Link>
      </div>

      {/* ---- Datos + precios ---- */}
      <section className="shell">
        <div className="core p-6 sm:p-8">
          <h3 className="text-[11px] uppercase tracking-[0.16em] text-ink-45">Datos y precios</h3>
          <SaveForm action={updatePropertyAction} className="mt-6">
            <input type="hidden" name="id" value={p.id} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre"><input name="name" defaultValue={p.name} className={inputCx} /></Field>
              <Field label="Tipo"><input name="kind" defaultValue={p.kind} className={inputCx} /></Field>
              <div className="sm:col-span-2">
                <Field label="Bajada / frase corta"><input name="tagline" defaultValue={p.tagline} className={inputCx} /></Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Descripción" hint="Dejá una línea en blanco entre párrafos">
                  <textarea name="description" rows={7} defaultValue={p.description} className={`${inputCx} resize-y`} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Dirección"><input name="address" defaultValue={p.address} className={inputCx} /></Field>
              </div>
              <Field label="Latitud"><input name="lat" type="number" step="any" defaultValue={p.lat} className={inputCx} /></Field>
              <Field label="Longitud"><input name="lng" type="number" step="any" defaultValue={p.lng} className={inputCx} /></Field>

              <Field label="Superficie (m²)"><input name="sizeM2" type="number" defaultValue={p.sizeM2} className={inputCx} /></Field>
              <Field label="Dormitorios"><input name="bedrooms" type="number" defaultValue={p.bedrooms} className={inputCx} /></Field>
              <Field label="Baños"><input name="bathrooms" type="number" defaultValue={p.bathrooms} className={inputCx} /></Field>
              <Field label="Camas"><input name="beds" type="number" defaultValue={p.beds} className={inputCx} /></Field>
              <Field label="Huéspedes máximo"><input name="maxGuests" type="number" defaultValue={p.maxGuests} className={inputCx} /></Field>
              <Field label="Noches mínimas"><input name="minNights" type="number" defaultValue={p.minNights} className={inputCx} /></Field>

              <Field label="Precio por noche (ARS)"><input name="basePrice" type="number" defaultValue={p.basePrice} className={inputCx} /></Field>
              <Field label="Precio temporada alta"><input name="highPrice" type="number" defaultValue={p.highPrice} className={inputCx} /></Field>
              <Field label="Limpieza final"><input name="cleaningFee" type="number" defaultValue={p.cleaningFee} className={inputCx} /></Field>
              <Field label="Puntaje (0-10)"><input name="rating" type="number" step="0.1" defaultValue={p.rating} className={inputCx} /></Field>
              <Field label="Cantidad de opiniones"><input name="reviews" type="number" defaultValue={p.reviews} className={inputCx} /></Field>
              <Field label="Horario check-in"><input name="checkIn" defaultValue={p.checkIn} className={inputCx} /></Field>
              <Field label="Horario check-out"><input name="checkOut" defaultValue={p.checkOut} className={inputCx} /></Field>

              <label className="flex items-center gap-3 self-end pb-3 text-[14px]">
                <input type="checkbox" name="active" defaultChecked={p.active === 1}
                  className="h-4 w-4 accent-[var(--color-palm)]" />
                Visible en el sitio
              </label>
            </div>
          </SaveForm>
        </div>
      </section>

      {/* ---- Fotos ---- */}
      <section>
        <h3 className="mb-5 text-[11px] uppercase tracking-[0.16em] text-ink-45">Fotos · la primera es la portada</h3>
        <ImageManager propertyId={p.id} images={images} />
      </section>

      {/* ---- Servicios ---- */}
      <section className="shell">
        <div className="core p-6 sm:p-8">
          <h3 className="text-[11px] uppercase tracking-[0.16em] text-ink-45">Servicios y equipamiento</h3>

          <form action={addAmenityAction} className="mt-6 grid gap-3 sm:grid-cols-12">
            <input type="hidden" name="propertyId" value={p.id} />
            <div className="sm:col-span-4">
              <input name="label" required placeholder="Ej: Hidromasaje" className={inputCx} />
            </div>
            <div className="sm:col-span-3">
              <input name="category" list="cats" defaultValue="Varios" placeholder="Categoría" className={inputCx} />
              <datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <div className="sm:col-span-3">
              <select name="icon" className={inputCx}>{ICONS.map((i) => <option key={i} value={i}>{i}</option>)}</select>
            </div>
            <label className="flex items-center gap-2 text-[13px] sm:col-span-1">
              <input type="checkbox" name="featured" className="h-4 w-4 accent-[var(--color-palm)]" />Dest.
            </label>
            <button className="rounded-full bg-ink px-4 py-2 text-[13px] text-cream transition-all duration-400 hover:bg-palm-deep active:scale-[0.97] sm:col-span-1">
              Añadir
            </button>
          </form>

          <div className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {categories.map((cat) => (
              <div key={cat}>
                <p className="text-[11px] uppercase tracking-[0.14em] text-ink-45">{cat}</p>
                <ul className="mt-3 space-y-1.5">
                  {amenities.filter((a) => a.category === cat).map((a) => (
                    <li key={a.id} className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[14px] transition-colors hover:bg-shell/70">
                      <Icon name={a.icon} className="h-4 w-4 shrink-0 text-palm" />
                      <span className="flex-1">{a.label}</span>
                      {a.featured === 1 && <span className="tag bg-palm-wash text-palm-deep">dest.</span>}
                      <form action={deleteAmenityAction}>
                        <input type="hidden" name="id" value={a.id} />
                        <button aria-label="Quitar" className="opacity-0 transition-opacity group-hover:opacity-100">
                          <Icon name="trash" className="h-3.5 w-3.5 text-[#8a3a24]" />
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Bloqueos de calendario ---- */}
      <section className="shell">
        <div className="core p-6 sm:p-8">
          <h3 className="text-[11px] uppercase tracking-[0.16em] text-ink-45">Bloquear fechas</h3>
          <p className="mt-2 text-[13.5px] text-ink-45">Las fechas bloqueadas no se pueden solicitar desde el sitio.</p>

          <form action={addBlockAction} className="mt-5 grid gap-3 sm:grid-cols-12">
            <input type="hidden" name="propertyId" value={p.id} />
            <div className="sm:col-span-3"><input type="date" name="fromDate" required className={inputCx} /></div>
            <div className="sm:col-span-3"><input type="date" name="toDate" required className={inputCx} /></div>
            <div className="sm:col-span-4"><input name="reason" placeholder="Motivo" defaultValue="No disponible" className={inputCx} /></div>
            <button className="rounded-full bg-ink px-4 py-2 text-[13px] text-cream transition-all duration-400 hover:bg-palm-deep active:scale-[0.97] sm:col-span-2">
              Bloquear
            </button>
          </form>

          {blocks.length > 0 && (
            <ul className="mt-6 space-y-2">
              {blocks.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-4 rounded-xl bg-shell/70 px-4 py-2.5 text-[14px]">
                  <span>{prettyDate(b.fromDate)} → {prettyDate(b.toDate)}</span>
                  <span className="text-[12.5px] text-ink-45">{b.reason}</span>
                  <form action={deleteBlockAction}>
                    <input type="hidden" name="id" value={b.id} />
                    <button aria-label="Quitar"><Icon name="trash" className="h-3.5 w-3.5 text-[#8a3a24]" /></button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export const dynamic = "force-dynamic";
