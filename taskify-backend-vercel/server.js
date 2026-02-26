const app = require('./index');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Monolithic backend running on port ${PORT}`);
  console.log(`- Auth: http://localhost:${PORT}/api/auth`);
  console.log(`- Tasks: http://localhost:${PORT}/api/tasks`);
  console.log(`- Groups: http://localhost:${PORT}/api/groups`);
});
