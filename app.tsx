import { n, nhttp, renderToHtml, serveStatic, cors } from "./deps.ts";
import Home from "./components/home.tsx";
import Meet from "./components/meet.tsx";
import {
  wsHandlers,
  wsLogin,
  joinRoom,
  createRoom,
  getRoom,
  getPeers,
  resetPeers,
} from "./ws.ts";
import { RequestEvent, TObject } from "https://deno.land/x/nhttp@1.3.7/mod.ts";
import { NHttp } from "https://deno.land/x/nhttp@1.3.7/index.ts";

const ARGS: string[] = Deno.args ?? [];
const isDev: boolean = ARGS.includes("--dev");

const app = nhttp();

app.use("/assets", serveStatic("public"));
app.use(cors());
app.engine(renderToHtml);

app.post("/api/join-or-create", wsLogin);
app.post("/api/create", createRoom);
app.post("/api/join", joinRoom);
app.get("/peers", getPeers);
app.post("/test-speed", (rev) => {
  rev.response.status(200).send({
    body: rev.body,
    query: rev.query,
  });
});
app.get("/reset-peers", resetPeers);
app.get("/room/:room", getRoom);
app.get("/", () => <Home />);
app.get("/ws/:token", wsHandlers);

app.get("/meet", ({ params }) => <Meet isDev={isDev} />);

export default app;
