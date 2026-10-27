require('dotenv').config();
const http = require('http');

const express = require('express');

const cors = require('cors');
const port = process.env.PORT || 5000;

const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const { setupSocket } = require('./socket/socket');
const errorHandlerMiddleware = require('./middlewares/errorHandlerMiddleware');

const app = express();
const server = http.createServer(app);


app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

app.use(errorHandlerMiddleware);

mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err)); 


setupSocket(server);


server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});