import express from 'express';
import profileRoutes from '../routes/profile.route';
import followingRoutes from '../routes/following.route';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());
app.use('/api/profiles', profileRoutes);
app.use('/api/following', followingRoutes);

export default app;
