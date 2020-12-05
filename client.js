let socket
function connect() {
  let socket = new WebSocket(`ws://${window.location.hostname}:8121/`)
  socket.onopen = () => {
    // console.log('open')
  }
  socket.onmessage = message => {
    let { hook, data } = JSON.parse(message.data)
    if (hook == 'onSend') data.forEach(d => processData(hook, d))
    else processData(hook, data)
  }
  socket.onclose = () => {
    console.log('close, attempt reopen')
    setTimeout(() => socket.readyState !== WebSocket.OPEN && connect(), 5000)
  }
}
connect()

let hooks = ['preRoute', 'preDeliver', 'postDeliver', 'onReceive', 'postReceive', 'onComplete']

const msgs = {}

function makeID(data) {
  return [data.msg._msgid, data.destination ? data.destination.id : data.node.id]
    .join('-')
    .replace(/\./g, '-')
}

function processData(hook, data) {
  const ID = makeID(data)
  if (!msgs[ID]) {
    if (!data.source) {
      // Must be inject starter, ignore
      return
    }
    newMsg(data)
  }
  const msg = msgs[ID]

  msg[hook] = data
  drawRow(ID)
}

function newMsg(data) {
  const ID = makeID(data)
  msgs[ID] = {
    source: data.source && data.source.id,
    msgid: data.msg._msgid,
    destination: data.destination && data.destination.id,
    msg: data.msg,
    msgStr: JSON.stringify(data.msg)
  }
}

function drawRow(ID) {
  let msg = msgs[ID]

  let cols = [
    msg.msg ? `<code>${JSON.stringify(msg.msg)}</code>` : '',
    msg.source || '',
    msg.destination || '',

    ...hooks.map(hook => {
      if (msg[hook]) {
        if (JSON.stringify(msg[hook].msg) != msg.msgStr) {
          return 'MISMATCH'
        }
        return 'OK'
      }
      return ''
    })
  ]

  let row = $(`#${ID}`)
  if (!row.length) row = $('<tr>', { id: ID }).appendTo($('#main-table'))

  row.empty().append(cols.map(text => $('<td>').html(text)))
}
