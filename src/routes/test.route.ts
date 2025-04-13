import { Router } from 'express';
import knex from '../database/knex';

const router = Router();

router.get('/test-db', async (req, res) => {
    try {
        // Try to connect to the database
        await knex.raw('SELECT 1+1 AS result');
        res.status(200).json({ 
            status: 'success',
            message: 'Database connection successful',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Database connection error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Database connection failed',
            error: error.message
        });
    }
});

export default router; 