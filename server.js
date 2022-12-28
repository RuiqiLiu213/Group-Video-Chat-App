const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

// run everytime someone connects to the webpage
// socket is the one the user connects to
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    console.log('~~~',roomId, userId)
    socket.join(roomId)
    // broadcast means sending message to everyone in the room except me
    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('send-message', (message) =>{
      console.log(message)
      socket.to(roomId).broadcast.emit('receive-message', message)
    })

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })

  //socket.on('send-message', (message, roomId, userId) =>{
    //console.log(message)
    //socket.to(roomId).broadcast.emit('receive-message', message)
  //})
})

server.listen(3000)