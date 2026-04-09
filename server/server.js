const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_db')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const { globalErrorHandler } = require('./routes/errorHandler');

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/recruiter', require('./routes/recruiter'));
app.use('/api/students',  require('./routes/student'));
app.use('/api/teachers',  require('./routes/teacher'));
app.use('/api/events',    require('./routes/events'));
app.use('/api/clubs',     require('./routes/clubs'));
app.use('/api/jobs',      require('./routes/jobs'));
app.use('/api/db',        require('./routes/db'));
app.use('/api/upload',    require('./routes/upload'));
app.use('/api/marksheet', require('./routes/marksheet'));
app.use('/api/messages',  require('./routes/messages'));

// Error handler should be the last middleware
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
