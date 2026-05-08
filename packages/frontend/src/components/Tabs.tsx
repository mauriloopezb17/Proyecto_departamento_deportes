import { useState, type ReactNode } from 'react'
import './Tabs.css'

export type TabDef = {
  id: string
  label: string
  content: ReactNode
}

type Props = {
  tabs: TabDef[]
  defaultTab?: string
  align?: 'left' | 'center'
}

function Tabs({ tabs, defaultTab, align = 'left' }: Props) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id)
  return (
    <>
      <div className={`tabs ${align === 'center' ? 'tabs-center' : ''}`}>
        {tabs.map((t) => (
          <div
            key={t.id}
            className={`tab ${active === t.id ? 'active' : ''}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </div>
        ))}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          className={`tab-content ${active === t.id ? 'active' : ''}`}
        >
          {active === t.id && t.content}
        </div>
      ))}
    </>
  )
}

export default Tabs
