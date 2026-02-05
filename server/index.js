require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { apiRateLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");

const mpesaLogRoutes = require("./routes/mpesaLogRoutes");
const mpesaRoutes = require("./routes/mpesaRoutes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use(apiRateLimiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/mpesa/logs", mpesaLogRoutes);
app.use("/api/mpesa", mpesaRoutes);

app.use(errorHandler);

const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";
const protocol = process.env.PROTOCOL || "http";

const startServer = () =>
  new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
      resolve(server);
    });
  });

const useNgrok = process.env.USE_NGROK === "true";

if (useNgrok) {
  const ngrok = require("@ngrok/ngrok");

  startServer()
    .then(() =>
      ngrok.connect({
        addr: port,
      })
    )
    .then((listener) => {
      const publicUrl = listener.url();
      process.env.MPESA_CALLBACK_URL = publicUrl;
      console.log(`Ngrok tunnel: ${publicUrl}`);
      console.log(`MPESA_CALLBACK_URL set to ${publicUrl}`);
    })
    .catch((error) => {
      console.error("Failed to start ngrok", error);
      process.exit(1);
    });
} else {
  const localUrl = `${protocol}://${host}:${port}`;
  process.env.MPESA_CALLBACK_URL = localUrl;
  startServer().then(() => {
    console.log(`MPESA_CALLBACK_URL set to ${localUrl}`);
  });
}
