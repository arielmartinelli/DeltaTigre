import SaveForm from "@/components/panel/SaveForm";
import Icon from "@/components/Icon";
import { Field, inputCx } from "@/components/Bits";
import { updateSettingsAction, saveActivityAction, deleteActivityAction } from "@/app/actions";
import { getSettings, getActivities } from "@/lib/data";

export default async function ContentPanel() {
  const [s, activities] = await Promise.all([getSettings(), getActivities()]);

  return (
    <div className="space-y-14">
      <section className="shell">
        <div className="core p-6 sm:p-8">
          <h3 className="text-[11px] uppercase tracking-[0.16em] text-ink-45">Portada y contacto</h3>
          <SaveForm action={updateSettingsAction} className="mt-6 space-y-4">
            <Field label="Etiqueta superior del hero"><input name="hero_eyebrow" defaultValue={s.hero_eyebrow} className={inputCx} /></Field>
            <Field label="Título del hero" hint="Usá Enter para cortar la línea">
              <textarea name="hero_title" rows={2} defaultValue={s.hero_title} className={`${inputCx} resize-none`} />
            </Field>
            <Field label="Bajada del hero">
              <textarea name="hero_subtitle" rows={3} defaultValue={s.hero_subtitle} className={`${inputCx} resize-none`} />
            </Field>
            <Field label="Título de la sección «El lugar»"><input name="about_title" defaultValue={s.about_title} className={inputCx} /></Field>
            <Field label="Texto de «El lugar»">
              <textarea name="about_body" rows={4} defaultValue={s.about_body} className={`${inputCx} resize-none`} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="WhatsApp del propietario" hint="Solo números, con código de país">
                <input name="whatsapp" defaultValue={s.whatsapp} placeholder="5491133334444" className={inputCx} />
              </Field>
              <Field label="Email de contacto"><input name="email" type="email" defaultValue={s.email} className={inputCx} /></Field>
              <Field label="Instagram (URL)"><input name="instagram" defaultValue={s.instagram} className={inputCx} /></Field>
            </div>
          </SaveForm>
        </div>
      </section>

      <section>
        <h3 className="mb-5 text-[11px] uppercase tracking-[0.16em] text-ink-45">Experiencias · qué hacer</h3>

        <div className="space-y-4">
          {activities.map((a) => (
            <div key={a.id} className="shell">
              <div className="core p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <p className="font-display text-[21px]">{a.title}</p>
                  <form action={deleteActivityAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="inline-flex items-center gap-1.5 text-[12.5px] text-[#8a3a24] transition-opacity hover:opacity-70">
                      <Icon name="trash" className="h-3.5 w-3.5" />Eliminar
                    </button>
                  </form>
                </div>
                <SaveForm action={saveActivityAction} label="Guardar" className="space-y-3">
                  <input type="hidden" name="id" value={a.id} />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Título"><input name="title" defaultValue={a.title} className={inputCx} /></Field>
                    <Field label="Etiqueta"><input name="tag" defaultValue={a.tag} className={inputCx} /></Field>
                    <Field label="Orden"><input name="sortOrder" type="number" defaultValue={a.sortOrder} className={inputCx} /></Field>
                  </div>
                  <Field label="Imagen (ruta)" hint="Ej: /img/delta-uno/11.webp o /uploads/archivo.jpg">
                    <input name="image" defaultValue={a.image} className={inputCx} />
                  </Field>
                  <Field label="Resumen"><input name="summary" defaultValue={a.summary} className={inputCx} /></Field>
                  <Field label="Texto largo">
                    <textarea name="body" rows={3} defaultValue={a.body} className={`${inputCx} resize-none`} />
                  </Field>
                </SaveForm>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 shell">
          <div className="core p-5 sm:p-6">
            <p className="font-display text-[21px]">Nueva experiencia</p>
            <SaveForm action={saveActivityAction} label="Crear" className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Título"><input name="title" required className={inputCx} /></Field>
                <Field label="Etiqueta"><input name="tag" placeholder="Aire libre" className={inputCx} /></Field>
                <Field label="Orden"><input name="sortOrder" type="number" defaultValue={99} className={inputCx} /></Field>
              </div>
              <Field label="Imagen (ruta)"><input name="image" placeholder="/img/delta-dos/07.webp" className={inputCx} /></Field>
              <Field label="Resumen"><input name="summary" className={inputCx} /></Field>
              <Field label="Texto largo"><textarea name="body" rows={3} className={`${inputCx} resize-none`} /></Field>
            </SaveForm>
          </div>
        </div>
      </section>
    </div>
  );
}

export const dynamic = "force-dynamic";
