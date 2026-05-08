type Props = {
  title: string
  subtitle?: string
  thinBorder?: boolean
}

function PageHeader({ title, subtitle, thinBorder }: Props) {
  return (
    <header className={`page-header${thinBorder ? ' with-thin-border' : ''}`}>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  )
}

export default PageHeader
