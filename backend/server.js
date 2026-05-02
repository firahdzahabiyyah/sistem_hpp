const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize } = require('./src/models');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 4000;

// Routes (use route wrappers)
app.use('/api/products', require('./src/routes/products'));
app.use('/api/recipes', require('./src/routes/recipes'));
app.use('/api/ingredients', require('./src/routes/ingredients'));
app.use('/api/labor', require('./src/routes/labor'));
app.use('/api/overheads', require('./src/routes/overheads'));

app.get('/', (req, res) => res.json({ ok: true }));

sequelize.sync().then(() => {
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Kill the process using it or set PORT to a different value.`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
