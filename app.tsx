import { n, nhttp, renderToHtml, serveStatic } from "./deps.ts";
import Home from "./components/home.tsx";
import Meet from "./components/meet.tsx";
import { wsHandlers, wsLogin, joinRoom, createRoom,getRoom, getPeers } from "./ws.ts";

const ARGS = Deno.args ?? [];
const isDev = ARGS.includes("--dev");

const app = nhttp();

app.use("/assets", serveStatic("public"));

app.engine(renderToHtml);

app.post("/api/join-or-create", wsLogin);
app.post("/api/create", createRoom);
app.post("/api/join", joinRoom);
app.get("/peers", getPeers);
app.get("/room/:room", getRoom);
app.get("/", () => <Home />);
app.get("/ws/:token", wsHandlers);
app.get(
  "/meet",
  ({ params }) => <Meet isDev={isDev} />,
);

export default app;
