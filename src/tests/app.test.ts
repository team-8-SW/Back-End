import express from 'express';
import profileRoutes from '../routes/profile.route';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());
app.use('/api/profiles', profileRoutes); // Load only required routes for testing

export default app;
