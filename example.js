/*
 * Copyright © 2018-20 LiquidPlayer
 *
 * Released under the MIT license.
 * See https://github.com/LiquidPlayer/LiquidCore/LICENSE.md for terms.
 */

 /* Hello, World! */

 // react doesn't want to resolve liquid core, have to uncomment following line on build
//  const {LiquidCore} = require('liquidcore')

// A micro service will exit when it has nothing left to do.  So to
// avoid a premature exit, set an indefinite timer.  When we
// exit() later, the timer will get invalidated.
setInterval(()=>{}, 1000)

console.log('Hello, World!')

LiquidCore.emit('my_event', {foo: "hello, world", bar: 5, l337 : ['a', 'b'] })

// Listen for a request from the host for the 'ping' event
LiquidCore.on( 'ping', () => {
    // When we get the ping from the host, respond with "Hello, World!"
    // and then exit.
    LiquidCore.emit( 'pong', { message: 'Hello, World from LiquidCore!' } )
    process.exit(0)
})

// Ok, we are all set up.  Let the host know we are ready to talk
LiquidCore.emit( 'ready' )