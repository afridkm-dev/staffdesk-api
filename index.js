const { app } = require('./app');

const port = Number(process.env.PORT) || 10000;

app.listen(port, () => {
  console.log(`Employee API listening on port ${port}`);
});
