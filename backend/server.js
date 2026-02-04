import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import availabilityRouter from "./routes/availability.routes.js";
import Booking from "./models/booking.model.js";
import Room from "./models/rooms.model.js";
import Property from "./models/property.model.js";
import bookingsRouter from "./routes/bookings.routes.js";
import adminBookingsRouter from "./routes/adminBookings.routes.js";
import adminAuthRouter from "./routes/admin.routes.js";
import publicRouter from "./routes/public.routes.js";
import roomsRouter from "./routes/rooms.routes.js";
import adminMediaRouter from "./routes/adminMedia.routes.js";
import adminRoomsRouter from "./routes/adminRooms.routes.js";
import adminGalleryRouter from "./routes/adminGallery.routes.js";
import publicGalleryRouter from "./routes/publicGallery.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5555;

app.set("trust proxy", 1);
const ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",");
app.use(cors({ origin: ORIGINS, credentials: true }));
app.use(cookieParser());
app.use(express.json());


app.get("/health", (_req, res) => res.status(200).json({ ok: true }));


app.use("/api/admin", adminAuthRouter);
app.use("/api/availability", availabilityRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/admin/bookings", adminBookingsRouter);
app.use("/api/public", publicRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/admin/media", adminMediaRouter);
app.use("/api/admin/rooms", adminRoomsRouter)
app.use("/api/admin/gallery", adminGalleryRouter);
app.use("/api/public/gallery", publicGalleryRouter);
app.use("/api/reviews", reviewsRoutes);

app.set("etag", false);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

async function bootstrap() {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");


    if (process.env.NODE_ENV !== "production") {
      await Promise.all([
        Booking.syncIndexes(),
        Room.syncIndexes(),
        Property.syncIndexes(),
      ]);
      console.log("✅ Indexek szinkronizálva (dev)");
    } else {
      await Promise.all([
        Booking.createIndexes(),
        Room.createIndexes(),
        Property.createIndexes(),
      ]);
      console.log("✅ Indexek ellenőrizve/létrehozva (prod)");
    }


    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

    const shutdown = async (sig) => {
      console.log(`\n${sig} received, shutting down...`);
      process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

bootstrap();
