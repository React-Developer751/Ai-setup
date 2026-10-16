import { useState } from 'react'
import type { EditOp } from './generator/edit/edits'
import { parseHoursText, parseServices } from './generator/edit/understand'

type Props = { onApply: (ops: EditOp[]) => void }

/** The real facts of the business in one place: they become ordinary changes (undo works, the chat sees them). */
function BusinessForm({ onApply }: Props) {
  const [whatsapp, setWhatsapp] = useState('')
  const [hours, setHours] = useState('')
  const [address, setAddress] = useState('')
  const [services, setServices] = useState('')
  const [note, setNote] = useState('')

  const apply = () => {
    const ops: EditOp[] = []
    if (whatsapp.trim()) ops.push({ op: 'contact', field: 'whatsapp', value: whatsapp.trim() })
    const parsedHours = hours.trim() ? parseHoursText(`hours: ${hours.trim()}`) : undefined
    if (hours.trim() && !parsedHours) {
      setNote('The opening hours need a time, for example "Mon-Sat 9am-7pm, Sun closed".')
      return
    }
    if (parsedHours) ops.push({ op: 'contact', field: 'hours', value: parsedHours })
    if (address.trim()) ops.push({ op: 'contact', field: 'address', value: address.trim() })
    const items = services.trim() ? parseServices(`services: ${services.split('\n').map((l) => l.trim()).filter(Boolean).join(', ')}`) : undefined
    if (services.trim() && !items) {
      setNote('I could not read the services. One per line, with the price after the name: "Haircut 300".')
      return
    }
    if (items) ops.push({ op: 'services', items })
    if (!ops.length) {
      setNote('Fill in at least one field.')
      return
    }
    setNote('')
    onApply(ops)
  }

  const field = 'w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
  return (
    <details className="rounded-xl border border-gray-200 bg-white" open>
      <summary className="cursor-pointer list-none px-3 py-2 text-sm font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">Your business details ▾</summary>
      <div className="space-y-2.5 px-3 pb-3 text-xs text-gray-600">
        <p>Real facts instead of the samples: the WhatsApp button, the map, opening hours and your own services and prices.</p>
        <label className="block space-y-1">
          <span className="font-medium text-gray-700">WhatsApp number (with country code)</span>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+91 98765 43210" className={field} inputMode="tel" />
        </label>
        <label className="block space-y-1">
          <span className="font-medium text-gray-700">Opening hours</span>
          <input value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Mon-Sat 9am-7pm, Sun closed" className={field} />
        </label>
        <label className="block space-y-1">
          <span className="font-medium text-gray-700">Address (shows a Google map)</span>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="12 MG Road, Pune 411001" className={field} />
        </label>
        <label className="block space-y-1">
          <span className="font-medium text-gray-700">Services and prices (one per line)</span>
          <textarea value={services} onChange={(e) => setServices(e.target.value)} rows={4} placeholder={'Haircut 300\nFacial 800\nBridal makeup 5000'} className={`${field} resize-y`} />
        </label>
        {note && <p className="text-amber-700">{note}</p>}
        <button type="button" onClick={apply} className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          Put these on my site
        </button>
      </div>
    </details>
  )
}

export default BusinessForm
