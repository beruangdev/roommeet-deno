import { FC, Helmet, n } from "../deps.ts";
import Base from "./base.tsx";

const LINKS = [
  {
    title: "Repo",
    href: "https://github.com/herudi/deno-webrtc-video-meet",
  },
  {
    title: "NHttp",
    href: "https://github.com/nhttp/nhttp",
  },
  {
    title: "Author",
    href: "https://github.com/herudi",
  },
  {
    title: "Deno",
    href: "https://deno.land",
  },
  {
    title: "Logo",
    href: "https://twitter.com/SamipPoudel3",
  },
];

const LinkBottom: FC<{
  href: string;
}> = ({ href, children }) => {
  return (
    <>
      <a target="_blank" style={{ color: "white", margin: 5 }} href={href}>
        {children}
      </a>
      <span>~</span>
    </>
  );
};

const Home: FC = () => {
  return (
    <Base>
      <Helmet>
        <title>Login - Deno Lite Meet</title>
      </Helmet>

      <div id="home">
        <div
          style={{
            textAlign: "center",
            width: "100%",
            marginTop: 40,
          }}
        >
          <img
            src="https://st2.zoom.us/static/6.3.14970/image/new/topNav/Zoom_logo.svg"
            alt="deno"
            width="150"
          />
          <h1 style={{ marginBottom: 5 }}>Deno Lite Meet</h1>
          <div style={{ marginBottom: 15 }}>
            Simple webRTC with Deno native websocket
          </div>
          <form id="form">
            <input
              title="Can't use special character"
              class="my-input"
              type="text"
              id="room"
              placeholder="Room (no special char)"
              pattern="^[a-zA-Z0-9]+$"
              value="123"
              required
            />
            <input
              class="my-input"
              type="text"
              id="email"
              placeholder="Email"
              value="admin@local.com"
              required
            />
            <input
              class="my-input"
              type="text"
              id="username"
              placeholder="Name"
              value="admin"
              required
            />
            <input
              class="my-input"
              type="text"
              id="password"
              placeholder="Password"
              value="123"
            />
            <input class="my-input" type="submit" value="Join / Create" />
          </form>
          <div style={{ marginTop: 15 }}>
            <span>~</span>
            {LINKS.map(({ title, href }) => {
              return <LinkBottom href={href}>{title}</LinkBottom>;
            })}
          </div>
        </div>
      </div>

      <script src={"/assets/home.js"}></script>
    </Base>
  );
};

export default Home;
