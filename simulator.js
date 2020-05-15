const app = require('express')()
const crypto = require('crypto')
const Ziggurat = require('./utils/ziggurat')
const Elevator = require('./domains/elevator')

const random = new Ziggurat()
const hashtable = {}

const CALLS = isNaN(process.argv[1]) ? 100 : parseInt(process.argv[1])

const shafts = [new Elevator(1), new Elevator(2), new Elevator(3)]

const stats = {
    wait: 0,
    trip: 0,
    total: 0
}

const record = ({ floor, elevator }) => {
    console.log(`Elevator ${elevator} has just visited floor ${floor}`)
}

shafts.forEach((e) => e.onArrival(record))

function simulate(num_calls = 100) {
    const origin = random_floor(),
    dest = random_floor(),
    next_call = random_interval(),
    stamp = Date.now()

    handle_elevators(origin, dest)

    // hashtable[key(origin, dest, stamp)] = { origin, dest, init: stamp }

    if (num_calls > 0)
        setTimeout(() => simulate(--num_calls), next_call * 1000)

}

function results() {
    Object.keys(stats).forEach((key) => console.log(`The Average ${key} Time: ${stats[key]/CALLS}s per call`))
}

function handle_elevators(origin, dest) {
    shafts.sort((a, b) => a.estimate(origin, dest) -  b.estimate(origin, dest))

    shafts[0].call(origin, dest)
}

function random_interval() {
    return Math.floor(Math.random() * 5) + 1
}

function random_floor() {
    return Math.round(Math.abs(random.nextGaussian() * 100)) % 99 + 1
}

function key(origin, dest, stamp) {
    return crypto.createHmac('sha256', stamp).update((origin + dest).toString()).digest('hex')
}

/*
    So it occurred to me that, the estimations calculated by the
    estimate function change relative to subsequent elevator calls.
*/

app.listen(3322, () => {
    console.log('Elevator Simulator')
    simulate(CALLS)
})