import style from './style.css'

const Badge = ({children = null, status = 'ok', size = 'medium'}) => {
  let cn = style.badge
  if (status) cn += ' ' + style[status]
  if (size) cn += ' ' + style[size]
  return <div className={cn}>{children}</div>
}

export default Badge
