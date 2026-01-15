require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const seedData = require('./config/seeder');

// Route files
const sensorRoutes = require('./routes/sensorRoutes');
const reportRoutes = require('./routes/reportRoutes');
const healthRoutes = require('./routes/healthRoutes');

// Connect to Database
connectDB().then(() => {
    seedData();
});

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
// We handle CORS here to allow the frontend to connect
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust this in production to specific frontend domains
        methods: ["GET", "POST"]
    }
});

// Security Middleware
app.use(helmet());
app.use(cors());

// Body Parser
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} called`);
    next();
});

// Pass io instance to the app so it can be accessed in controllers
app.set('socketio', io);

// Mount routers
app.use('/api/sensors', sensorRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api', healthRoutes);

// Socket.io connection logic
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

/**
 * WEB SOCKETS INTEGRATION EXPLANATION:
 * 1. We create a native Node.js HTTP server and wrap the Express app around it.
 * 2. We initialize Socket.io by passing this HTTP server.
 * 3. We use `app.set('socketio', io)` to make the io instance available globally 
 *    within the Express application.
 * 4. In the sensorController, we retrieve the io instance via `req.app.get('socketio')`.
 * 5. When new data is POSTed to /api/sensors/ingest, we immediately call `io.emit()` 
 *    to broadcast the data to all connected clients.
 */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
