import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import csrf from "csurf";
import cookieParser from "cookie-parser";
import fs from "fs";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

dotenv.config();

const app = express();

app.set('trust proxy', 1);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

const corsOptions = {
  origin: ["https://agbonifo.github.io", "https://agbonifo-github-io.vercel.app"],
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/assets", express.static(join(__dirname, "assets")));

app.use(cookieParser());

const csrfProtection = csrf({
  cookie: { httpOnly: true, secure: true, sameSite: "none" },
});
app.use(csrfProtection);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "https://unpkg.com",
        "https://vercel.live",
        "'unsafe-inline'",
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "https://fontawesome.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "https://fontawesome.com", "data:"],
      connectSrc: ["'self'", "https://fontawesome.com"],
      imgSrc: ["'self'", "data:"],
    },
  },
  hsts: { maxAge: 31536000 },
};
app.use(helmet(helmetConfig));

const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

mongoose
  .connect(uri)
  .then(() => {
    console.log("Database connected!");
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
    process.exit(1);
  });

const contactFormSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const Contact = mongoose.model("contact", contactFormSchema);

app.get("/csrf-token", (req, res) => {
  console.log("Generated CSRF Token:", req.csrfToken());
  res.json({ csrfToken: req.csrfToken() });
});

app.get("/", (req, res) => {
  console.log("Get Request Header:", req.headers.origin)
  const csrfToken = req.csrfToken();

  fs.readFile(join(__dirname, "index.html"), "utf8", (err, data) => {
    if (err) {
      console.error("Error reading index.html:", err);
      return res.status(500).send("Internal Server Error");
    }

    const htmlWithCsrf = data.replace(
      '<input type="hidden" name="_csrf" id="_csrf">',
      `<input type="hidden" name="_csrf" id="_csrf" value="${csrfToken}">`
    );

    res.send(htmlWithCsrf);
  });
});

app.post("/", async (req, res) => {
  console.log("Post Request Header:", req.headers.origin)
  try {
    const { name, email, subject, message } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send("Invalid email address.");
    }

    const sanitizedName = DOMPurify.sanitize(name);
    const sanitizedEmail = DOMPurify.sanitize(email);
    const sanitizedSubject = DOMPurify.sanitize(subject);
    const sanitizedMessage = DOMPurify.sanitize(message);

    const contact = new Contact({
      name: sanitizedName,
      email: sanitizedEmail,
      subject: sanitizedSubject,
      message: sanitizedMessage,
    });

    const contactReceived = await contact.save();
    if (contactReceived) {
      console.log("New contact message saved:", contactReceived);
      res.clearCookie("_csrf");
      return res.sendFile(join(__dirname, "success.html"));
    } else {
      console.log("No contact saved");
      return res.sendFile(join(__dirname, "failure.html"));
    }
  } catch (err) {
    console.error("Error saving contact:", err);
    return res.sendFile(join(__dirname, "failure.html"));
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong. Please try again later.");
});

app.listen(port, () => {
  console.log(`Server running on ${port}, http://localhost:${port}`);
});
