/*

So we have to write a function that determines the series of elevators that are called after a number of elevator calls.
We are in a 100 floor skyscraper that has 3 elevators.

so it takes 1s to move to a floor, and 5s to wrap up a floor.

It takes 30s at the lobby floor

MAX 10 people per pick up.

potential questions:
- I'm a little confused as to what exactly is defined as an "elevator call." Is a call a request for the elevator, or a request to be sent to another floor, or both?
- It's said that the destination floor is known on an elevator call. But if we can have multiple passengers being picked up on a single floor, then won't there eventually be multiple destination floors?
  or is the function called for every single call regardless of # of passengers per floor?
- Can I divide floors between elevators? For example, I might want elevator 1 to handle floors 2-30, and elevator 2 to handle 30-50 etc.
- How should I spread out when each call is made in terms of time? Should I do a consistent interval or should I randomize the intervals between calls as well?


Once someone calls an elevator, we should find the closest, least busy elevator,
and assign it to that.

The least busy elevator has fewer destinations, and is less far away, AND more importantly is going in the same direction.


*/
const events = require('events')

function Elevator(name) {
    this.queue = [[],[],[]] // a queue of floors for the elevator to visit.
    this.moving = false
    this.current = 1
    this.name = name
    this.people = 0
    this.emitter = new events.EventEmitter()

    // this will be a map that keeps track of the number of passengers at each floor
    this.per_floor = {}
}

Elevator.prototype.call = function (origin, dest) {
    const [on_deck, next, off] = this.queue


    let direction



    if (this.current === this.queue[0]) {

        if(this.queue.length > 1) {
            direction = this.current < this.queue[1] ? 'UP' : 'DOWN'
        } else {
            direction = ''
        }

    } else {
        direction = this.current < this.queue[0] ? 'UP' : 'DOWN'
    }

    if (direction === '') return this.queue.push(origin, dest)//

    /*

        If the direction is going up:
            1 - the origin floor is on the way to the next dest
            2 -

            7
            2 3 - 8
            3, 7, 8

    */

    if (origin < dest) {

        if(direction === 'UP') {

                if (this.current < origin && this.queue[0] > dest) {
                    // append to data structure
                }

        }

    }


    // while (this.queue[i] < origin && i < this.queue.length) i++

    // if(this.queue[i] !== origin)
    //     this.queue.splice(i-1, 0, origin)

    // while (this.queue[i] < dest && i < this.queue.length) i++

    // if(this.queue[i] !== dest)
    //     this.queue.splice(i-1, 0, dest)






    if(this.per_floor[origin])
        this.per_floor[origin] += 1
    else
        this.per_floor[origin] = 1

    if (this.per_floor[dest])
        this.per_floor[dest] -= 1
    else
        this.per_floor[dest] = -1

    if(!this.moving)
        this.deliver()
}

Elevator.prototype.deliver = function () {
    if(this.queue.length === 0)
        return

    if (!this.moving) this.moving = true

    let extra

    if (this.current === this.queue[0]) {
        this.emitter.emit('floor', { elevator: this.name, floor: this.current })
        extra = this.current === 1 ? 30 : 5
        this.people += this.per_floor[this.current]
        this.per_floor[this.current] = 0 // passengers either all get off or get on the elevator, so no one waits on the floor
        this.queue.shift()
    } else
        extra = 1

    if (this.queue.length > 0) {
        setTimeout(() => {

            if (this.current < this.queue[0])
                this.current++
            else if (this.current > this.queue[0])
                this.current--


            this.deliver()

        }, 1000 * extra)
    } else {
        this.moving = false
    }
}

Elevator.prototype.inQueue = function (floor) {
    return this.queue.indexOf(floor) > -1
}

 // calculate time to travel based on floors/wait_time
Elevator.prototype.calculate_trip = function (origin, dest) {
    return Math.abs(dest - origin) + (dest === 1 || origin === 1 ? 30 : 5)
}

Elevator.prototype.onArrival = function (callback) {
    this.emitter.on('floor', callback)
}

Elevator.prototype.estimate = function (og, dt) {
    if (this.queue.length < 0) return this.calculate_trip(og, dt)
    let est = 0, //Total estimate to get passenger to destination
        last = this.current,
        i = 0,
        people = this.people,
        // Added a modifier for direction, to prioritize elevators going in the same direction
        mod = this.queue > 0 ? dt > og && this.queue[0] > dt ? 1 : dt < og && this.queue[0] < last ? 1 : 2 : 1

    while (this.queue[i] < og && i < this.queue.length) {
        est += this.calculate_trip(last, this.queue[i]) * mod
        last = this.queue[i]
        people += this.per_floor[last]
        i++
    }

    //if there are still 10 people in the elevator when it reaches the origin, lets send a very large number
    if (people >= 10) return 10000000000000

    if ( og === this.queue[i]) {
        i++ //if origin is being visited,
    } else {
        est += this.calculate_trip(last, og) * mod// if we are visiting a floor higher up than the origin
        last = og
    }

    while (last < dt && i < this.queue.length) {
        est += this.calculate_trip(last, this.queue[i]) * mod
        last = this.queue[i]
        i++
    }

    est += this.calculate_trip(last, dt) * mod

    return est
}

module.exports = Elevator