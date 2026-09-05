import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', message: 'FurniLedger API is running' });
});

app.listen(port, () => {
  console.log(`FurniLedger API listening on http://localhost:${port}`);
});
