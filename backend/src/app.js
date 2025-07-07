const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const cartRoutes = require('./routes/cartRoutes')
const orderRoutes = require('./routes/orderRoutes')

const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());

app.use(cors());

app.use('/api', authRoutes);
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    })
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));


