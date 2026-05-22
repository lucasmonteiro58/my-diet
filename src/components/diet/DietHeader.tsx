import { Calendar, Mail, MessageCircle, User } from 'lucide-react'
import type { DietPlan } from '../../types/diet'

interface DietHeaderProps {
  plan: DietPlan
}

export function DietHeader({ plan }: DietHeaderProps) {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-5 text-white shadow-lg shadow-brand-600/20">
      <p className="text-xs font-medium uppercase tracking-wider text-brand-100">
        Plano Alimentar
      </p>
      <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold">
        <User className="h-6 w-6 shrink-0 opacity-90" />
        {plan.patientName}
      </h1>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-brand-50">
        <Calendar className="h-4 w-4" />
        {plan.date}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {plan.nutritionist.whatsapp && (
          <a
            href={`https://wa.me/55${plan.nutritionist.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur transition hover:bg-white/25"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
        )}
        {plan.nutritionist.email && (
          <a
            href={`mailto:${plan.nutritionist.email}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur transition hover:bg-white/25"
          >
            <Mail className="h-3.5 w-3.5" />
            E-mail
          </a>
        )}
      </div>
    </section>
  )
}
