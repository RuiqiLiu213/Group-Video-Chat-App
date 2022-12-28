const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const textGrid = document.getElementById('text-grid')
const myPeer = new Peer(undefined)
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

myPeer.on('open', id => {
  console.log('join room')
  socket.emit('join-room', ROOM_ID, id)
})

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })

  myPeer.on('call', call => {
    // console.log('call', call)
    // Answer the call, providing our mediaStream
    call.answer(stream)
    const video = document.createElement('video')
    // `stream` is the MediaStream of the remote peer.
    // Here you'd add it to an HTML video/canvas element.
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream) // start call to a peer, providing our mediaStream
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })
  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}



document.getElementById('send-button').addEventListener('click', function() {
  const message = document.getElementById('message-input').value;
  if (message != ""){
    //console.log(myPeer.id, message);
    socket.emit('send-message', message, ROOM_ID, myPeer.id)
    const div = document.createElement('div');
    div.innerHTML = message;
    textGrid.append(div)
  }
});

socket.on('receive-message', message => {
  const div = document.createElement('div');
  div.innerHTML = message;
  textGrid.append(div)
})


