let ws = require('ws')

const wss = new ws.Server({ port: 8121 })

function send(packet) {
  let str = JSON.stringify(packet)
  wss.clients.forEach(client => client.readyState === ws.OPEN && client.send(str))
}

module.exports = function (RED) {
  RED.httpAdmin.get('/msgs/client.js', function (req, res) {
    res.sendFile(__dirname + '/client.js')
  })
  RED.httpAdmin.get('/msgs', function (req, res) {
    res.sendFile(__dirname + '/main.html')
  })

  let hooks = [
    'onSend',
    'preRoute',
    'preDeliver',
    'postDeliver',
    'onReceive',
    'postReceive',
    'onComplete'
  ]

  for (let hook of hooks) {
    RED.hooks.add(hook, data => {
      send({ hook, data })
    })
  }

  RED.hooks.add('preDeliver.modify', data => {
    if (data.msg.payload == true) {
      data.msg.test = 'test'
    }
  })

  // wss.on('connection', socket => {
  //   let dir = {}
  //   RED.nodes.eachNode(node => {
  //     dir[node.id] = {
  //       type: node.type,
  //       label: ''
  //     }
  //   })
  // })
}
