import { Router } from 'express';
import knex from 'knex';
import knexConfig from '../../knexfile';

const router = Router();
const db = knex(knexConfig.development);

router.get('/health', async (req, res) => {
    try {
        // Test database connection
        await db.raw('SELECT 1+1 AS result');
        res.status(200).json({ 
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Health check failed:', error);
        res.status(500).json({ 
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

router.get('/', async (req, res) => {
    try {
        // Test database connection
        await db.raw('SELECT 1+1 AS result');
        res.status(200).json({ 
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Health check failed:', error);
        res.status(500).json({ 
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

export default router; 