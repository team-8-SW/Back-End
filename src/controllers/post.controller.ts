import { Request, Response } from 'express';
import * as postService from '../services/post.service';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getMyPosts = async (req: Request, res: Response) => {
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
        const { content, visibility, company_id } = req.body;
        // Validate required fields
        if (!content || !visibility) {
            return res.status(400).json({ message: 'Content and visibility are required' });
        }
        // Call the service to create the post
        const post = await postService.createPost({
            user_id,
            content,
            visibility,
            company_id,
        });
        res.status(201).json(post); // Return the created post
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Failed to create post' });
    }
};
export const getFeedPosts = async (req: Request, res: Response) => {
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

export const likePost = async (req: Request, res: Response) => {
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
        const like = await postService.like({
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
export const commentPost = async (req: Request, res: Response) => {
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
        const comment = await postService.commentpost({
            user_id,
            post_id,
            content,
            parent_comment_id,
        });
        res.status(201).json(comment); 
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ message: 'Failed to create comment' });
    }
};

export const savePost = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.user_id; // Extract user_id from authenticated user
        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const { post_id } = req.body;
        // Validate required fields
        if (!post_id) {
            return res.status(400).json({ message: 'postid is required' });
        }
        // Call the service to create the row
        const saved = await postService.savepost({
            user_id,
            post_id,
        });
        res.status(201).json(saved); 
    } catch (error) {
        console.error('Error saving post:', error);
        res.status(500).json({ message: 'Failed to save post' });
    }
};

//View post engagement (likes, comments, shares)
export const viewPostEngagement = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.user_id; // Extract user_id from authenticated user
        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const { post_id } = req.body;
        // Validate required fields
        if (!post_id) {
            return res.status(400).json({ message: 'postid is required' });
        }
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

export const sharePost = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.user_id; // Extract user_id from authenticated user
        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const { post_id } = req.body;
        // Validate required fields
        if (!post_id) {
            return res.status(400).json({ message: 'postid is required' });
        }
        const shared = await postService.share({
            user_id,
            post_id,
        });
        res.status(201).json(shared); // Return the created like
    } catch (error) {
        console.error('Error sharing post:', error);
        res.status(500).json({ message: 'Failed to share post' });
    }
};

//deletepost
export const deletePost = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.user_id;
        console.log('User ID in controller:', user_id);
        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const { post_id } = req.body;
        // Validate required fields
        if (!post_id) {
            return res.status(400).json({ message: 'postid is required' });
        }
        
        // Call the service to create the post
        const deleted = await postService.deletepost({
            user_id,
            post_id,
        });
        console.log('deleted post:', deleted);

        res.status(200).json(deleted);
    } catch (error) {
        console.error('Error deleting post:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Failed to delete post', error: errorMessage });
    }
};
//searchpost
export const searchPost = async (req: Request, res: Response) => {
    try {
        const { keyword } = req.body;
        // Validate required fields
        if ( !keyword) {
            return res.status(400).json({ message: 'keyword is required' });
        }
        const result = await postService.searchpost({
            keyword,
        });
        res.status(201).json(result); // Return the created like
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({ message: 'Failed to search posts' });
    }
};
//editpost
//zabaty this function
export const editPost = async (req: Request, res: Response) => {
    try {
        const { post_id, content, media_url, media_type, visibility, company_id } = req.body;
        const user_id = (req as any).user?.user_id; // Extract user_id from authenticated user
        if (!user_id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
    
        if (!post_id) {
            return res.status(400).json({ message: 'postid is required' });
        }
        
        // Call the service to create the post
        const post = await postService.editpost({
            post_id,
            user_id,
            content,
            media_url,
            media_type,
            visibility,
            company_id,
        });
        res.status(201).json(post); // Return the created post
    } catch (error) {
        console.error('Error editing post:', error);
        res.status(500).json({ message: 'Failed to edit post' });
    }
};

export const addMediaToPost = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.user_id; // Extract user_id from authenticated user
        const { post_id } = req.params; // Extract post_id from URL parameters
        const link_url = req.body.link_url; // Extract link_url from the request body (if provided)
        const file = req.file; // Access the uploaded file from req.file

        // Validate required fields
        if (!post_id) {
            return res.status(400).json({ message: 'post_id is required' });
        }

        if (!file && !link_url) {
            return res.status(400).json({ message: 'Either a file or a link must be provided' });
        }

        // Handle file uploads
        if (file) {
            const allowedMimeTypes = ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, MP4, and PDF are allowed.' });
            }

            try {
                // Upload the file to Cloudinary
                const uploadToCloudinary = (): Promise<any> => {
                    return new Promise((resolve, reject) => {
                        const stream = cloudinary.uploader.upload_stream(
                            {
                                folder: 'linkedin-clone/postsmedia', // Folder in Cloudinary
                                resource_type: file.mimetype.startsWith('video') ? 'video' : 'auto', // Handle videos and other types
                                type: 'upload',
                            },
                            (error, result) => {
                                if (error) return reject(error);
                                resolve(result);
                            },
                        );
                        stream.end(file.buffer);
                    });
                };

                const result = await uploadToCloudinary();

                // Save the media URL in the database
                const updatedPost = await postService.addMediaToPost(post_id, user_id, result.secure_url, file.mimetype);

                if (!updatedPost) {
                    return res.status(404).json({ error: 'Post not found or you do not have permission to edit it' });
                }

                return res.status(200).json({
                    message: 'Media added to post successfully',
                    mediaUrl: result.secure_url,
                });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
                return res.status(500).json({ error: 'Internal server error', details: errorMessage });
            }
        }

        // Handle links
        if (link_url) {
            try {
                // Save the link URL in the database
                const updatedPost = await postService.addMediaToPost(post_id, user_id, link_url, 'link');

                if (!updatedPost) {
                    return res.status(404).json({ error: 'Post not found or you do not have permission to edit it' });
                }

                return res.status(200).json({
                    message: 'Link added to post successfully',
                    linkUrl: link_url,
                });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
                return res.status(500).json({ error: 'Internal server error', details: errorMessage });
            }
        }
    } catch (error) {
        console.error('Error adding media to post:', error);
        res.status(500).json({ message: 'Failed to add media to post' });
    }
};