import { S3Client } from "bun";

const gcs = new S3Client({
    endpoint: import.meta.env.VITE_GCS_ENDPOINT,
    accessKeyId: import.meta.env.VITE_GCS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_GCS_SECRET_ACCESS_KEY,
    bucket: import.meta.env.VITE_GCS_BUCKET,
})
