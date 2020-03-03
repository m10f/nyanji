const moment = require('moment')

if (process.argv.length < 3) {
    console.log('Usage: nyanji <host>')
    process.exit(1)
}

const me = "nyanji"
const host = process.argv[2]
const socket = require('socket.io-client')(host)

var nyanjis = new Map()
const storePattern = /^!nyanji\s+:([^:]+):\s+(.*)$/
const nyanjiPattern = /:([^:]+):/g

socket.on('connect', () => {
    console.log('connected to ' + host)
    socket.emit('nick', me)
    say("nyan nyan!")
})

// rate limited output buffer
var outBuf = []
function _drain() {
    var msg = outBuf.shift()
    socket.emit('message', msg)
    if (outBuf.length > 0) {
        setTimeout(_drain, 1000)
    }
}
function say(msg) {
    outBuf.push(msg)
    if (outBuf.length === 1) {
        setTimeout(_drain, 1000)
    }
}

socket.on('message', msg => {
    if(msg.nick == me)
        return

    let match = storePattern.exec(msg.message)
    if (match !== null) {
        nyanjis.set(match[1], match[2])
        say("nyaaaaaa!")
    } else {
        let ms = [...msg.message.matchAll(nyanjiPattern)]
        for (const nyan of ms) {
            let n = nyanjis.get(nyan[1])
            if(n !== undefined) {
                say(n + " " + "nya~")
            }
        }
    }
})