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
        const posts = await postService.displayPosts(user_id);
        console.log('Fetched posts:', posts);

        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Failed to fetch posts', error: errorMessage });
    }
};

export const createPost = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.user_id; // Extract user_id from authenticated user
        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const { content, media_url, media_type, visibility, company_id } = req.body;
        // Validate required fields
        if (!content || !visibility) {
            return res.status(400).json({ message: 'Content and visibility are required' });
        }
        // Call the service to create the post
        const post = await postService.createPost({
            user_id,
            content,
            media_url,
            media_type,
            visibility,
            company_id,
        });
        res.status(201).json(post); // Return the created post
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Failed to create post' });
    }
};
export const getfeedposts = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.user_id;
        console.log('User ID in controller:', user_id);

        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        console.log('Fetching posts for user_id:', user_id);
        const posts = await postService.getfeedposts(user_id);
        console.log('Fetched posts:', posts);

        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Failed to fetch posts', error: errorMessage });
    }
};

export const like = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.user_id; // Extract user_id from authenticated user
        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const { post_id, comment_id } = req.body;
        // Validate required fields
        if (!post_id && !comment_id) {
            return res.status(400).json({ message: 'postid or commentid is required' });
        }
        // Validate required fields
        if (post_id && comment_id) {
            return res.status(400).json({ message: 'you cant like both comment and post at same time' });
        }
        // Call the service to create the post
        const like = await postService.likepost({
            user_id,
            post_id,
            comment_id,
        });
        res.status(201).json(like); // Return the created like
    } catch (error) {
        console.error('Error creating like:', error);
        res.status(500).json({ message: 'Failed to create like' });
    }
};
export const comment = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.user_id; // Extract user_id from authenticated user
        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const { post_id, content, parent_comment_id } = req.body;
        // Validate required fields
        if (!post_id || !content) {
            return res.status(400).json({ message: 'postid and content is required' });
        }
        // Call the service to create the post
        const comment = await postService.commentpost({
            user_id,
            post_id,
            content,
            parent_comment_id,
        });
        res.status(201).json(comment); // Return the created like
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Failed to create comment' });
    }
};

export const savepost = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.user_id; // Extract user_id from authenticated user
        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const { post_id } = req.body;
        // Validate required fields
        if (!post_id) {
            return res.status(400).json({ message: 'postid and content is required' });
        }
        // Call the service to create the post
        const saved = await postService.savepost({
            user_id,
            post_id,
        });
        res.status(201).json(saved); // Return the created like
    } catch (error) {
        console.error('Error saving post:', error);
        res.status(500).json({ message: 'Failed to save post' });
    }
};

//View post engagement (likes, comments, shares)
export const viewpostengagement = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.user_id; // Extract user_id from authenticated user
        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const { post_id } = req.body;
        // Validate required fields
        if (!post_id) {
            return res.status(400).json({ message: 'postid and content is required' });
        }
        // Call the service to create the post
        const engagement = await postService.viewpostengagement({
            user_id,
            post_id,
        });
        res.status(201).json(engagement);
    } catch (error) {
        console.error('Error viewing post engagement:', error);
        res.status(500).json({ message: 'Failed to view post engagement' });
    }
};