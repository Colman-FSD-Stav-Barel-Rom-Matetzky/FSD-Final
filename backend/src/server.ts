import { app } from "./app";

const PORT = process.env.PORT || 4040;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default server;
