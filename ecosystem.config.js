module.exports = {
  apps: [{
    name: "keystone-cms",
    script: "yarn",
    args: "start",
    instances: "max",
    exec_mode: "cluster",
    watch: false,
    node_args: "--harmony",
    env: {
      NODE_ENV: "production"
    }
  }]
}
