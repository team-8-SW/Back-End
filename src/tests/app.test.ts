import express from 'express';
import profileRoutes from '../routes/profile.route';
import followingRoutes from '../routes/following.route';
import connectionRoutes from '../routes/connection.route';
import userRoutes from '../routes/users.routes';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());
app.use('/api/profiles', profileRoutes);
app.use('/api/following', followingRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/users', userRoutes);

export default app;
