const app = require('express')()
const Ziggurat = require('./utils/ziggurat')
const Elevator = require('./domains/elevator')
const random = new Ziggurat()

const CALLS = isNaN(process.argv[1]) ? 100 : parseInt(process.argv[1])

const shafts = [new Elevator(1), new Elevator(2), new Elevator(3)]

const stats = {
    wait: 0,
    trip: 0,
    total: 0
}

function simulate(num_calls = 100) {
    const origin = random_floor(),
    dest = random_floor(),
    next_call = random_interval()

    const [total, wait, trip] = handle_elevators(origin, dest)

    stats.wait += wait
    stats.total += total
    stats.trip += trip

    if (num_calls > 0)
        setTimeout(() => simulate(--num_calls), next_call * 1000)
    else
        results()
}

function results() {
    Object.keys(stats).forEach((key) => console.log(`The Average ${key} Time: ${stats[key]/CALLS}s per call`))
}

function handle_elevators(origin, dest) {
    shafts.sort((a, b) => {
      const [est_1,,] = a.estimate(origin, dest)
      const [est_2,,] = b.estimate(origin, dest)
      return est_1 - est_2
    })

    const estimates = shafts[0].estimate(origin, dest)
    shafts[0].call(origin, dest)
    return estimates
}

function random_interval() {
    return Math.floor(Math.random() * 5) + 1
}

function random_floor() {
    return Math.round(Math.abs(random.nextGaussian() * 100)) % 100
}

app.listen(3322, () => {
    console.log('Elevator Simulator')
    simulate(CALLS)
})