import path from 'node:path'
import fs from 'node:fs'

const NAME_TO_ABBREVIATIONS = {
  image: 'IM',
  media: 'ME',
  object: 'OB',
  script: 'SC',
  style: 'ST',
  worker: 'WO',
  font: 'FO',
  connect: 'CO'
}

const ABBREVIATIONS_TO_NAME = {
  IM: 'image',
  ME: 'media',
  OB: 'object',
  SC: 'script',
  ST: 'style',
  WO: 'worker',
  FO: 'font',
  CO: 'connect'
}

export class SourcesModel {
  private appsPath = path.resolve('/', 'usr', 'share', 'local-cloud', 'apps')

  public get(packageName: Apps.App['package_name']): SecureSources.Source[] {
    const results: SecureSources.Source[] = []
    const manifestPath = path.join(this.appsPath, packageName, 'manifest.json')
    const manifestContent = fs.readFileSync(manifestPath, 'utf8')
    const manifest = JSON.parse(manifestContent)
    const entries = Object.entries<any>(manifest.sources)
    for (const [type, sources] of entries) {
      for (let index = 0; index < sources.length; index++) {
        const { src, description, enable } = sources[index]
        results.push({
          id: `${NAME_TO_ABBREVIATIONS[type]}:${index}`,
          type: type as any,
          source: src,
          description,
          enable
        })
      }
    }
    return results
  }

  public put(packageName: Apps.App['package_name'], id: SecureSources.Source['id'], value: boolean): void {
    let [abbreviation, index]: any = id.split(':')
    index = Number(index)
    const type = ABBREVIATIONS_TO_NAME[abbreviation]
    const manifestPath = path.join(this.appsPath, packageName, 'manifest.json')
    let manifestContent = fs.readFileSync(manifestPath, 'utf8')
    const manifest = JSON.parse(manifestContent)
    if (!manifest.sources) {
      return
    }
    manifest.sources[type][index].enable = value
    manifestContent = JSON.stringify(manifest)
    fs.writeFileSync(manifestPath, manifestContent, 'utf8')
  }
}