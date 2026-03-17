import mongoose from "mongoose";
import { startRabbitWorker } from "../utils.js";

const run = async () => {
    await mongoose.connect(Bun.env.MONGO_URI!)
    console.log("MongoDB connected")
    await startRabbitWorker()
};

run();