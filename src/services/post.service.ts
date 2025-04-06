import { v4 as uuidv4 } from 'uuid';
import { validate as isUUID } from 'uuid';
import { knexInstance } from '../config/db';
import { posts } from '../models/post.model';
import { Knex } from 'knex';
import { notifyUser } from '../utils/notifications';
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


export const createPost = async (post: {
    user_id: string; // Must be valid UUID
    content: string;
    visibility: string;
    company_id?: string; // Must be valid UUID if provided
}) => {
    try {
        const postId = uuidv4(); // Generates a valid UUID v4
                        
        const [createdPost] = await knexInstance('posts')
            .insert({
                id: postId, // Valid UUID
                ...post,
                like_count: 0,
                comment_count: 0,
                repost_count: 0
            })
            .returning('*');

        return createdPost;
    } catch (error) {
        console.error('Database Error:', error);
        throw error;
    }
};

export const getfeedposts = async (user_id: string): Promise<posts[]> => {
    try {
        if (!user_id) {
            throw new Error('User ID is required');
        }

        const userIds = await knexInstance
            .select('user_id')
            .from(function (this: Knex.QueryBuilder) {
                this.select('following.follower_id as user_id') // Get user_id from following
                    .from('following')
                    .where({ follower_id: user_id }) // Users the current user is following
                    .unionAll(function (this: Knex.QueryBuilder) {
                        this.select(
                            knexInstance.raw("CASE WHEN requester_id = ? THEN receiver_id ELSE requester_id END as user_id", [user_id]) // Get user_id from connections
                        )
                            .from('connections')
                            .where(function (this: Knex.QueryBuilder) {
                                this.where('requester_id', user_id)
                                    .orWhere('receiver_id', user_id);
                            })
                            .andWhere('status', 'accepted'); // Only accepted connections
                    })
                    .as('combined_users'); // Combine both queries
            });

        // Extract user IDs into an array
        const userIdList = userIds.map((row) => row.user_id);

        // Step 2: Fetch posts created by these users
        const posts = await knexInstance('posts')
            .whereIn('user_id', userIdList) // Get posts where user_id is in the list
            .orderBy('created_at', 'desc'); // Order posts by created_at in descending order

        return posts;
    } catch (error) {
        console.error(`Error fetching feed posts for user ${user_id}:`, error);
        throw new Error('Failed to fetch feed posts');
    }
};

export const like = async (like: { post_id?: string; comment_id?: string; user_id: string }): Promise<any> => {
    try {
        const { post_id, comment_id, user_id } = like;

        // Validate inputs
        if (!user_id || !isUUID(user_id)) {
            throw new Error('Invalid user_id');
        }
        if (post_id && !isUUID(post_id)) {
            throw new Error('Invalid post_id');
        }
        if (comment_id && !isUUID(comment_id)) {
            throw new Error('Invalid comment_id');
        }
        if (!post_id && !comment_id) {
            throw new Error('Either post_id or comment_id must be provided');
        }
        if (post_id && comment_id) {
            throw new Error('Cannot like both a post and a comment at the same time');
        }
        //check like if it exists
        if (post_id) {
            // Ensure the post exists
        const postExists = await knexInstance('posts')
        .where({ id: post_id })
        .first();
    if (!postExists) {
        throw new Error('Post not found');
    }
        const likeExists = await knexInstance('likes')
                .where({ user_id, post_id })
                .first();
            if (likeExists) {
                throw new Error('already liked this post');
            }
        } else if (comment_id) {
            // Ensure the comment exists
        const commentExists = await knexInstance('comments')
                .where({ id: comment_id })
                .first();
            if (!commentExists) {
             throw new Error('Post not found');
            }
            const likeExists = await knexInstance('likes')
                .where({ user_id, comment_id })
                .first();
            if (likeExists) {
                throw new Error('already liked this comment');
            }
        }
       
        // Add a new like to the likes table
        const likeId = uuidv4(); // Generate a unique ID for the like
        const [createdLike] = await knexInstance('likes')
            .insert({
                id: likeId,
                user_id,
                post_id: post_id || null,
                comment_id: comment_id || null,
                created_at: new Date(),
            })
            .returning('*');

        // Increment the like_count in the posts or comments table
        if (post_id) {
            await knexInstance('posts')
                .where({ id: post_id })
                .increment('like_count', 1);
        }
        else if (comment_id) {
            await knexInstance('comments')
                .where({ id: comment_id })
                .increment('like_count', 1);
        }
        // Fetch the post owner to notify them
        const postOwner = await knexInstance('posts')
            .where({ id: post_id })
            .select('user_id')
            .first();
        const postOwnername = await knexInstance('users')
            .where({ id: postOwner.user_id })
            .select('user_name')
            .first();
            if (postOwner) {
                // Emit a notification to the post owner
                notifyUser(postOwner.user_id, {
                    type: 'like',
                    content: `Your post was liked by user ${postOwnername.user_name}`,
                    post_id,
                });
            }
        return createdLike;
    } catch (error) {
        console.error('Error liking post or comment:', error);
        throw new Error('Failed to like post or comment');
    }
};


export const commentpost = async (comment: { post_id: string; user_id: string; content: string;  parent_comment_id?:string }): Promise<any> => {
    try {
        const { post_id, user_id, content, parent_comment_id } = comment;

        // Validate inputs
        if (!user_id || !isUUID(user_id)) {
            throw new Error('Invalid user_id');
        }
        if (post_id && !isUUID(post_id)) {
            throw new Error('Invalid post_id');
        }
        if (parent_comment_id && !isUUID(parent_comment_id)) {
            throw new Error('Invalid comment_id');
        }
        if (!post_id) {
            throw new Error('post_id must be provided');
        }
        // Ensure the post exists
        const postExists = await knexInstance('posts')
            .where({ id: post_id })
            .first();
        if (!postExists) {
            throw new Error('Post not found');
        }

        // If parent_comment_id is provided, ensure it exists
        if (parent_comment_id) {
            const parentCommentExists = await knexInstance('comments')
                .where({ id: parent_comment_id })
                .first();
            if (!parentCommentExists) {
                throw new Error('Parent comment not found');
            }
        }

        const commentId = uuidv4(); // Generate a unique ID for the comment
        const [createdComment] = await knexInstance('comments')
            .insert({
                id: commentId,
                post_id: post_id,
                user_id: user_id,
                content: content,
                created_at: new Date(),
                edited_at: new Date(),
                parent_comment_id: parent_comment_id || null,
            })
            .returning('*');

        // Increment the comment_count in the posts table
        if (!parent_comment_id) {
            await knexInstance('posts')
                .where({ id: post_id })
                .increment('comment_count', 1);
        } //3lshan law howa reply han increment commen t count beta3 el comment
        else if (!parent_comment_id) {
            await knexInstance('comments')
                .where({ id: parent_comment_id })
                .increment('reply_count', 1);
        } 
        // Fetch the post owner to notify them
        const postOwner = await knexInstance('posts')
            .where({ id: post_id })
            .select('user_id')
            .first();
        const postOwnername = await knexInstance('users')
            .where({ id: postOwner.user_id })
            .select('user_name')
            .first();
            if (postOwner) {
                // Emit a notification to the post owner
                notifyUser(postOwner.user_id, {
                    type: 'like',
                    content: `Your post was commented on by user ${postOwnername.user_name}`,
                    post_id,
                    comment_id: parent_comment_id,
                });
            }
        return createdComment;
    } catch (error) {
        console.error('Error commenting:', error);
        throw new Error('Failed to comment');
    }
};

export const savepost = async (save: { post_id: string; user_id: string; }): Promise<any> => {
    try {
        const { user_id, post_id} = save;

        // Validate inputs
        if (!user_id || !isUUID(user_id)) {
            throw new Error('Invalid user_id');
        }
        if (post_id && !isUUID(post_id)) {
            throw new Error('Invalid post_id');
        }
        if (!post_id) {
            throw new Error('post_id must be provided');
        }
        // Ensure the post exists
        const postExists = await knexInstance('posts')
            .where({ id: post_id })
            .first();
        if (!postExists) {
            throw new Error('Post not found');
        }
        const savedId = uuidv4(); // Generate a unique ID for the comment
        const [savedpost] = await knexInstance('saved_posts')
            .insert({
                id: savedId,
                post_id: post_id,
                user_id: user_id,
            })
            .returning('*');
        return savedpost;
    } catch (error) {
        console.error('Error saving post:', error);
        throw new Error('Failed to save post');
    }
};
//viewpostengagement
export const viewpostengagement = async (engagement: { post_id: string; user_id: string; }): Promise<any> => {
    try {
        const { user_id, post_id } = engagement;

        // Validate inputs
        if (!user_id || !isUUID(user_id)) {
            throw new Error('Invalid user_id');
        }
        if (post_id && !isUUID(post_id)) {
            throw new Error('Invalid post_id');
        }
        if (!post_id) {
            throw new Error('post_id must be provided');
        }
        // Ensure the post exists
        const postExists = await knexInstance('posts')
            .where({ id: post_id })
            .first();
        if (!postExists) {
            throw new Error('Post not found');
        }
        const viewengagement = await knexInstance('posts')
            .where({ id: post_id })
            .select('like_count', 'comment_count', 'repost_count')
            .first();
        return viewengagement;
    } catch (error) {
        console.error('Error viewing post engagement:', error);
        throw new Error('Failed to view post engagement');
    }
};
//share
export const share = async (share: { post_id: string; user_id: string; }): Promise<any> => {
    try {
        const { user_id, post_id} = share;

        // Validate inputs
        if (!user_id || !isUUID(user_id)) {
            throw new Error('Invalid user_id');
        }
        if (post_id && !isUUID(post_id)) {
            throw new Error('Invalid post_id');
        }
        if (!post_id) {
            throw new Error('post_id must be provided');
        }
        // Ensure the post exists
        const postExists = await knexInstance('posts')
            .where({ id: post_id })
            .first();
        if (!postExists) {
            throw new Error('Post not found');
        }
        const savedId = uuidv4(); // Generate a unique ID for the repost
        const [shared] = await knexInstance('reposts')
            .insert({
                id: savedId,
                user_id: user_id,
                reposted_post_id: post_id,
                reposted_at: new Date(),
            })
            .returning('*');
        // Increment the repost_count in the posts table
        await knexInstance('posts')
            .where({ id: post_id })
            .increment('repost_count', 1);
        return shared;
    } catch (error) {
        console.error('Error sharing post:', error);
        throw new Error('Failed to share post');
    }
};

//delete
export const deletepost = async (share: { post_id: string; user_id: string; }): Promise<any> => {
    try {
        const { user_id, post_id} = share;

        // Validate inputs
        if (!user_id || !isUUID(user_id)) {
            throw new Error('Invalid user_id');
        }
        if (post_id && !isUUID(post_id)) {
            throw new Error('Invalid post_id');
        }
        if (!post_id) {
            throw new Error('post_id must be provided');
        }
        // Ensure the post exists
        //DELETE FROM posts
        // WHERE post_id = '<post_id>' AND user_id = '<user_id>';
        const postExists = await knexInstance('posts')
            .where({ id: post_id })
            .first();
        if (!postExists) {
            throw new Error('Post not found');
        }
        const mypost = await knexInstance('posts')
            .where({ id: post_id, user_id: user_id })
            .first();
        if (!mypost) {
            throw new Error('cant delete this post, you are not the author of it');
        }
        await knexInstance('posts')
            .where({ id: post_id, user_id: user_id }) // Match post_id and user_id
            .del(); // Delete the matching row(s)
            
        console.log(`Post with ID ${post_id} deleted successfully.`);
    } catch (error) {
        console.error('Error deleeting post:', error);
        throw new Error('Failed to delete post');
    }
};
//searchpost
export const searchpost = async (share: { keyword: string; }): Promise<any> => {
    try {
        const { keyword } = share;

        if (!keyword) {
            throw new Error('keyword must be provided');
        }
        const results = await knexInstance('posts')
            .where('content', 'like', `%${keyword}%`); // Search for the keyword in the 'content' column
        return results;
    } catch (error) {
        console.error('Error searching:', error);
        throw new Error('Failed to search in posts');
    }
};

export const editpost = async (post: { post_id: string; user_id: string; content?: string; media_url?: string; media_type?: string; visibility?: string; company_id?: string }): Promise<any> => {
    try {
        const { post_id, user_id, ...fieldsToUpdate } = post;

        if (!user_id || !isUUID(user_id)) {
            throw new Error('Invalid user_id');
        }
        if (!post_id || !isUUID(post_id)) {
            throw new Error('Invalid post_id');
        }

        const postExists = await knexInstance('posts')
            .where({ id: post_id, user_id })
            .first();
        if (!postExists) {
            throw new Error('Post not found or you cannot edit it');
        }

        // Remove undefined fields from the update object
        const updateFields = Object.fromEntries(
            Object.entries(fieldsToUpdate).filter(([_, value]) => value !== undefined)
        );

        if (Object.keys(updateFields).length === 0) {
            throw new Error('Nothing provided to update');
        }

        // Update the post with the provided fields
        const [updatedPost] = await knexInstance('posts')
            .where({ id: post_id, user_id })
            .update(updateFields)
            .returning('*'); // Return the updated post

        return updatedPost;
    } catch (error) {
        console.error('Error editing post:', error);
        throw new Error('Failed to edit post');
    }
};
export const addMediaToPost = async (post_id: string, user_id: string, media_url: string, media_type: string): Promise<any> => {
    // Ensure the post exists and belongs to the user
    const postExists = await knexInstance('posts')
        .where({ id: post_id, user_id })
        .first();
    if (!postExists) {
        throw new Error('Post not found or you do not have permission to edit it');
    }

    // Update the post with the media URL and type
    const [updatedPost] = await knexInstance('posts')
        .where({ id: post_id, user_id })
        .update({
            media_url,
            media_type,
        })
        .returning('*'); // Return the updated post

    return updatedPost;
};