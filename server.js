const cluster = require('node:cluster')
const http = require('node:http')
const process = require('node:process')

const numOfWorkers =
  process.env.HEROKU_AVAILABLE_PARALLELISM || // for fir-based apps
  process.env.WEB_CONCURRENCY || // for cedar-based apps
  1

const port = process.env.PORT || 5006

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`)
  for (let i = 0; i < numOfWorkers; i++) {
    cluster.fork()
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`)
  })
} else {
  http.createServer((req, res) => {
    res.writeHead(200)
    res.end('hello world\n')
  }).listen(port)
  console.log(`Worker ${process.pid} started`)
}
