import { UUID } from 'crypto';
import { knexInstance } from '../config/db';
import { posts } from '../models/post.model';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const displayPosts = async (user_id: string): Promise<posts[]> => {
    try {
        if (!user_id) {
            throw new Error('User ID is required');
        }

        const posts = await knexInstance('posts')
            .where({ user_id })
            .select('*')
            .orderBy('created_at', 'desc'); // Typically you want newest posts first
        //SELECT * FROM posts WHERE user_id = '<user_id>';
        return posts;
    } catch (error) {
        console.error(`Error fetching posts for user ${user_id}:`, error);
        throw new Error('Failed to fetch posts');
    }
};

export const createPost = async (post: Omit<posts, 'id' | 'created_at'>): Promise<posts> => {
    try {
        const [newPost] = await knexInstance('posts')
            .insert({ post })
            .returning('*');

        if (!newPost) {
            throw new Error('Failed to create post');
        }

        return newPost;
    } catch (error) {
        console.error('Error creating post:', error);
        throw new Error('Failed to create post');
    }
};