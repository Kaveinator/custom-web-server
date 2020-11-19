const Debug = require("./Server/Debug"),
      HttpServer = require("./Server/Net/Http/Server");

async function Start(args) {
    Debug.Log("Server Booting...");
    process.title = "HTTP Server";
    // Start HTTP
    HttpServer.Start(80); // Default port is 80, feel free to change it
}

Start(process.argv.slice(2));