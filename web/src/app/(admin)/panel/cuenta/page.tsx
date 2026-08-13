import PageHead from "@/components/panel/PageHead";
import CuentaForm from "@/components/panel/CuentaForm";
import Icon from "@/components/Icon";
import { getOwnerSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function CuentaPage() {
  const session = await getOwnerSession();
  if (!session) return null;

  return (
    <>
      <PageHead
        eyebrow="Acceso"
        title="Mi cuenta"
        description="Cambiá tu email o tu contraseña. Son los datos con los que entrás al panel."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="shell">
            <div className="core p-6 sm:p-8">
              <CuentaForm name={session.name} email={session.email} />
            </div>
          </div>
        </div>

        <aside className="lg:col-span-2">
          <div className="shell">
            <div className="core space-y-5 p-6">
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink-45">Recomendaciones</p>
              {[
                ["check", "Usá al menos 12 caracteres, mezclando palabras que recuerdes."],
                ["nosmoke", "No reutilices una contraseña que tengas en otro servicio."],
                ["info", "Si cambiás el email, ese pasa a ser tu usuario para entrar."],
                ["users", "Al guardar seguís con la sesión abierta, no te desloguea."],
              ].map(([ic, t]) => (
                <p key={t} className="flex items-start gap-3 text-[13.5px] leading-relaxed text-ink-70">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-palm-wash text-palm-deep">
                    <Icon name={ic} className="h-3.5 w-3.5" />
                  </span>
                  {t}
                </p>
              ))}
              <p className="border-t border-ink/8 pt-4 text-[12px] leading-relaxed text-ink-45">
                Si perdés el acceso, se puede restablecer desde la computadora del proyecto con
                <code className="mx-1 rounded bg-ink/6 px-1.5 py-0.5">npm run owner</code>.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
