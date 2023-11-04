import { type DataBasesConfigProfile } from 'interfaces/DataBases'
import { paths } from './paths'

export const databases: DataBasesConfigProfile = {
  systemDB: paths.system.database,
  systemAppDB: paths.system.apps.app.databases.database
}