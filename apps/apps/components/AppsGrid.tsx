import { Badge, Caption1, Card, CardHeader, Subtitle2, Text, mergeClasses } from '@fluentui/react-components'
import { AppsRegular } from '@fluentui/react-icons'

import { useStyles } from '../styles'
import type { AppInfo } from '../types'
import { getExtensions } from '../utils'

type AppsGridProps = {
  apps: AppInfo[]
  selectedPackageName: string
  currentPackageName: string
  onSelect: (packageName: string) => void
}

export const AppsGrid = ({ apps, selectedPackageName, currentPackageName, onSelect }: AppsGridProps) => {
  const styles = useStyles()

  return (
    <div className={styles.grid}>
      {apps.map(app => {
        const extensions = getExtensions(app)
        const selected = selectedPackageName === app.packageName
        const isReadOnly = app.packageName === currentPackageName

        return (
          <Card
            key={app.packageName}
            className={mergeClasses(styles.appCard, selected && styles.selectedCard, isReadOnly && styles.readOnlyCard)}
            onClick={() => onSelect(app.packageName)}
          >
            <div className={styles.cardBody}>
              <CardHeader
                image={(
                  <div className={styles.appIcon}>
                    <AppsRegular />
                  </div>
                )}
                header={<Subtitle2>{app.title || app.packageName}</Subtitle2>}
                description={<Caption1>{app.author || app.packageName}</Caption1>}
              />
              <Text className={styles.description}>
                {app.description || 'Aplicacion de LocalCloud'}
              </Text>
              <div className={styles.badges}>
                <Badge appearance="tint">{app.packageName}</Badge>
                {isReadOnly && (
                  <Badge color="important" appearance="tint">Solo lectura</Badge>
                )}
                {extensions.slice(0, 2).map(extension => (
                  <Badge key={extension} appearance="outline">{extension}</Badge>
                ))}
                {extensions.length > 2 && (
                  <Badge appearance="outline">+{extensions.length - 2}</Badge>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
