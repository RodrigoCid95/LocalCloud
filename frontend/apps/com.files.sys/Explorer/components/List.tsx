import { makeStyles, Spinner, Title3, tokens } from '@fluentui/react-components'
import { useExplorer } from './../context/explorer'
import OptionsProvider from "./providers/Options"
import RenameProvider from './providers/Rename'
import Item from './Item'

const useStyles = makeStyles({
  section: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: tokens.spacingHorizontalM,
    paddingTop: tokens.spacingVerticalL,
  },
  notFound: {
    textAlign: 'center',
    width: '100%'
  }
})

export default () => {
  const styles = useStyles()
  const { loading, items } = useExplorer()

  return (
    <RenameProvider>
      <OptionsProvider>
        {loading && <Spinner />}
        {!loading && items.length === 0 && <Title3 className={styles.notFound}>No hay nada por acá.</Title3>}
        {!loading && (
          <div className={styles.section}>
            {items.filter(item => !item.isFile).map(item => <Item key={item.name} item={item} />)}
          </div>
        )}
        {!loading && (
          <div className={styles.section}>
            {items.filter(item => item.isFile).map(item => <Item key={item.name} item={item} />)}
          </div>
        )}
      </OptionsProvider>
    </RenameProvider>
  )
}