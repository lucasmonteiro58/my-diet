import { Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useDiet } from '../../contexts/DietContext'
import type { FoodItem, FoodLocation } from '../../types/diet'
import { Button } from '../ui/Button'
import { BottomSheet } from '../ui/BottomSheet'
import { TextField } from '../ui/TextField'

export interface FoodEditTarget {
  location: FoodLocation
  preparationName: string
  mealName: string
  food?: FoodItem
}

interface FoodEditSheetProps {
  target: FoodEditTarget | null
  onClose: () => void
  onSave?: (location: FoodLocation, data: { name: string; quantity: string }) => Promise<void>
  onRemove?: (location: FoodLocation) => Promise<void>
}

export function FoodEditSheet({ target, onClose, onSave, onRemove }: FoodEditSheetProps) {
  const { saveFood, removeFood } = useDiet()
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isNew = !target?.food

  const [prevTarget, setPrevTarget] = useState<FoodEditTarget | null>(null)

  if (target !== prevTarget) {
    setPrevTarget(target)
    setName(target?.food?.name ?? '')
    setQuantity(target?.food?.quantity ?? '')
    setError(null)
    setBusy(false)
  }

  const handleSave = async () => {
    if (!target) return
    setBusy(true)
    setError(null)
    try {
      if (onSave) {
        await onSave(target.location, { name, quantity })
      } else {
        await saveFood(target.location, { name, quantity })
      }
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.')
    } finally {
      setBusy(false)
    }
  }

  const handleRemove = async () => {
    if (!target?.food) return
    setBusy(true)
    setError(null)
    try {
      if (onRemove) {
        await onRemove(target.location)
      } else {
        await removeFood(target.location)
      }
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível remover.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <BottomSheet
      open={target !== null}
      onClose={onClose}
      title={isNew ? 'Adicionar alimento' : 'Editar alimento'}
      ariaLabel={isNew ? 'Adicionar alimento' : 'Editar alimento'}
    >
      <div className="space-y-4 px-5 pb-2">
        {target && (
          <p className="text-xs text-ink-muted">
            {target.mealName}
            {target.preparationName ? ` · ${target.preparationName}` : ''}
          </p>
        )}

        <TextField
          label="Alimento"
          placeholder="Ex: Banana"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
          disabled={busy}
        />

        <TextField
          label="Quantidade"
          hint="Inclua gramas quando souber, ex: 2 fatias (50g)"
          placeholder="Ex: 1 unidade média (80g)"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          autoComplete="off"
          disabled={busy}
        />

        {error && (
          <p className="rounded-xl bg-danger-subtle px-3 py-2 text-sm text-danger-text">
            {error}
          </p>
        )}

        <Button fullWidth disabled={busy || !name.trim() || !quantity.trim()} onClick={() => void handleSave()}>
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar'
          )}
        </Button>

        {!isNew && (
          <Button fullWidth variant="ghost" disabled={busy} onClick={() => void handleRemove()}>
            <Trash2 className="h-4 w-4 text-danger" />
            <span className="text-danger">Remover alimento</span>
          </Button>
        )}
      </div>
    </BottomSheet>
  )
}
