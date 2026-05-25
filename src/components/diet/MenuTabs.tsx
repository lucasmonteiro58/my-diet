import type { Menu } from '../../types/diet'

interface MenuTabsProps {
  menus: Menu[]
  activeId: string
  onChange: (id: string) => void
}

export function MenuTabs({ menus, activeId, onChange }: MenuTabsProps) {
  return (
    <div className="sticky top-[calc(var(--app-header-height,56px)+var(--banner-height,0px))] z-10 -mx-4 bg-surface/95 px-4 py-2 backdrop-blur-md">
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
      {menus.map((menu) => {
        const active = menu.id === activeId
        return (
          <button
            key={menu.id}
            type="button"
            onClick={() => onChange(menu.id)}
            className={[
              'shrink-0 rounded-2xl px-4 py-2.5 text-left transition',
              active
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25 dark:bg-brand-700 dark:shadow-black/35'
                : 'border border-border bg-surface-elevated text-ink hover:border-brand-300 dark:hover:border-brand-300/60',
            ].join(' ')}
          >
            <p className="text-sm font-semibold">{menu.title}</p>
            <p
              className={`text-xs ${active ? 'text-brand-100/90 dark:text-white/60' : 'text-ink-muted'}`}
            >
              {menu.subtitle}
            </p>
          </button>
        )
      })}
      </div>
    </div>
  )
}
