import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { studentsRouter } from './routes/students';
import { notesRouter } from './routes/notes';
import { summaryRouter } from './routes/summary';
import { errorHandler } from './middleware/errorHandler';
import { openApiSpec } from './openapi';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use('/api/students', studentsRouter);
app.use('/api/notes', notesRouter);
app.use('/api/summary', summaryRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
