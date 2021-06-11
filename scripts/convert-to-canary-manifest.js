const {
  loadDataFromFile,
  writeDataToFile
} = require('../build_scripts/generate-manifest-helpers')

const manifestPath = process.argv[2]
if (!manifestPath) {
  console.error('Please provide path to the manifest to be replaced')
  process.exit(1)
}

const manifest = loadDataFromFile(manifestPath)

const canaryManifest = {
  ...manifest,
  ...{
    name: 'Neo4j Browser Canary',
    short_name: 'Neo4j Browser Canary',
    icons: [
      {
        src: './assets/images/device-icons/neo4j-browser-canary.svg',
        type: 'svg'
      }
    ]
  }
}

writeDataToFile(manifestPath, canaryManifest)
