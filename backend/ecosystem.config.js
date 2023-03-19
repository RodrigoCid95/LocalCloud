module.exports = {
  apps : [{
    name: 'LocalCloud',
    script: "server/main.js",
    instances : "max",
    exec_mode : "cluster",
    args: '--prod --no-crypto'
  }]
}