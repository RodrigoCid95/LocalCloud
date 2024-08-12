import { MongoClient, ServerApiVersion } from 'mongodb'

declare const configs: PXIO.Configs

export const mongo = async () => {
  const { password } = configs.get('keys')
  const uri = `mongodb://lc:${password}@localhost:27017`
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  })
  await client.connect()
  return client.db('_lc')
}