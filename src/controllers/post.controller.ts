import { Request, Response } from 'express';
import * as postService from '../services/post.service';

export const getmyposts = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.user_id;
        console.log('User ID in controller:', user_id);

        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        console.log('Fetching posts for user_id:', user_id);
        const notifications = await postService.displayPosts(user_id);
        console.log('Fetched posts:', notifications);

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching posts:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Failed to fetch posts', error: errorMessage });
    }
};
