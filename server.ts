import app from "./app.tsx";
let hostname 
hostname = 'localhost'
hostname = 'localhost'
// hostname = '192.168.130.247'
// hostname = '192.168.1.2'
app.listen({ port: 3000, hostname }, (_e, info) => {
  console.log(`> running on port http://${info.hostname}:${info.port}`);
});
