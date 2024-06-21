function setupSocket(io) {
  io.on('connection', (socket) => {
      console.log('A user connected');

      // Handle custom events here
      socket.on('customEvent', (data) => {
          console.log('Received customEvent with data:', data);
          socket.emit('responseEvent', { message: 'Hello from server' });
      });

      socket.on('disconnect', () => {
          console.log('A user disconnected');
      });
  });
}

module.exports = { setupSocket };
