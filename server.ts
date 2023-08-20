import app from "./app.tsx";

app.listen(3000, (_e, info) => {
  console.log("> running on port " + info.port);
});
