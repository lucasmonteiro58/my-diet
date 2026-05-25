import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useSharedDiets } from '../../contexts/SharedDietsContext'
import { BottomSheet } from '../ui/BottomSheet'
import { Button } from '../ui/Button'
import { TextField } from '../ui/TextField'

interface AddSharedPlanSheetProps {
  open: boolean
  onClose: () => void
}

export function AddSharedPlanSheet({ open, onClose }: AddSharedPlanSheetProps) {
  const { addByCode, addingCode } = useSharedDiets()
  const [code, setCode] = useState('')

  async function handleConfirm() {
    if (!code.trim()) return
    await addByCode(code)
    setCode('')
    onClose()
  }

  function handleClose() {
    setCode('')
    onClose()
  }

  const isValid = code.trim().length === 6

  return (
    <BottomSheet open={open} onClose={handleClose} title="Adicionar dieta">
      <div className="space-y-5 px-5 pb-4">
        <p className="text-sm text-ink-muted">
          Peça para a pessoa compartilhar o código de 6 caracteres do plano dela e insira
          abaixo.
        </p>

        <TextField
          label="Código de compartilhamento"
          placeholder="Ex: A3F7K2"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          disabled={addingCode}
          className="text-center text-lg font-bold tracking-[0.35em]"
        />

        <Button
          fullWidth
          disabled={addingCode || !isValid}
          onClick={() => void handleConfirm()}
        >
          {addingCode ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando...
            </>
          ) : (
            'Adicionar dieta'
          )}
        </Button>
      </div>
    </BottomSheet>
  )
}
