// backend/src/io.js
// Shared Socket.IO instance
let _io = null;

export const setIo = (io) => { _io = io; };
export const getIo = () => _io;

// These functions are kept for compatibility but are no longer used with Socket.IO
// Socket.IO handles socket management internally
export const addClientSocket = () => {};
export const removeClientSocket = () => {};