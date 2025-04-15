import * as postController from '../controllers/post.controller';
import * as postService from '../services/post.service';
import { Request, Response } from 'express';
import cloudinary from 'cloudinary';

console.error = jest.fn();

interface CustomRequest extends Request {
    user?: { user_id: string };
    file?: Express.Multer.File;
}

jest.mock('cloudinary', () => ({
    v2: {
        uploader: {
            upload_stream: jest.fn(),
        },
    },
}));

jest.mock('../services/post.service', () => ({
    displayPosts: jest.fn(),
    createPost: jest.fn(),
    getfeedposts: jest.fn(),
    like: jest.fn(),
    commentpost: jest.fn(),
    deletelike: jest.fn(),
    savepost: jest.fn(),
    share: jest.fn(),
    viewpostengagement: jest.fn(),
    deletepost: jest.fn(),
    searchpost: jest.fn(),
    editpost: jest.fn(),
    addMediaToPost: jest.fn(),
    tagUser: jest.fn(),
}));

jest.mock('cloudinary', () => ({
    v2: {
        config: jest.fn(),
        uploader: {
            upload_stream: jest.fn(),
        },
    },
}));

describe('Post Controller', () => {
    let req: Partial<CustomRequest>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();

        res = {
            status: statusMock,
            json: jsonMock,
        } as Partial<Response>;
    });

    describe('getMyPosts', () => {
        it('should return 400 if user ID is missing', async () => {
            req = {
                user: undefined,
            } as Partial<CustomRequest>;

            await postController.getMyPosts(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'User ID is required' });
        });

        it('should return 200 with posts data if successful', async () => {
            const mockPosts = [
                { id: 'post1', content: 'Test post 1' },
                { id: 'post2', content: 'Test post 2' },
            ];

            (postService.displayPosts as jest.Mock).mockResolvedValue(mockPosts);

            req = {
                user: { user_id: 'user123' },
            } as Partial<CustomRequest>;

            await postController.getMyPosts(req as Request, res as Response);

            expect(postService.displayPosts).toHaveBeenCalledWith('user123');
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(mockPosts);
        });

        it('should return 500 if service throws an error', async () => {
            (postService.displayPosts as jest.Mock).mockRejectedValue(new Error('Database error'));

            req = {
                user: { user_id: 'user123' },
            } as Partial<CustomRequest>;

            await postController.getMyPosts(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Failed to fetch posts',
                error: 'Database error',
            });
        });
    });

    describe('createPost', () => {
        it('should return 400 if user ID is missing', async () => {
            req = {
                user: undefined,
                body: { content: 'Test post', visibility: 'public' },
            } as Partial<CustomRequest>;

            await postController.createPost(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'User ID is required' });
        });

        it('should return 400 if required fields are missing', async () => {
            req = {
                user: { user_id: 'user123' },
                body: { content: '', visibility: '' },
            } as Partial<CustomRequest>;

            await postController.createPost(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Content and visibility are required' });
        });

        it('should return 201 with post data if successful', async () => {
            const mockPost = {
                id: 'post123',
                content: 'Test post',
                visibility: 'public',
                user_id: 'user123',
            };

            (postService.createPost as jest.Mock).mockResolvedValue(mockPost);

            req = {
                user: { user_id: 'user123' },
                body: { content: 'Test post', visibility: 'public' },
            } as Partial<CustomRequest>;

            await postController.createPost(req as Request, res as Response);

            expect(postService.createPost).toHaveBeenCalledWith({
                user_id: 'user123',
                content: 'Test post',
                visibility: 'public',
                company_id: undefined,
            });
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(mockPost);
        });

        it('should return 500 if service throws an error', async () => {
            (postService.createPost as jest.Mock).mockRejectedValue(new Error('Database error'));

            req = {
                user: { user_id: 'user123' },
                body: { content: 'Test post', visibility: 'public' },
            } as Partial<CustomRequest>;

            await postController.createPost(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Failed to create post' });
        });
    });

    describe('getFeedPosts', () => {
        it('should return 400 if user ID is missing', async () => {
            req = {
                user: undefined,
            } as Partial<CustomRequest>;

            await postController.getFeedPosts(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'User ID is required' });
        });

        it('should return 200 with feed posts if successful', async () => {
            const mockFeedPosts = [
                { id: 'post1', content: 'Feed post 1', liked: true },
                { id: 'post2', content: 'Feed post 2', liked: false },
            ];

            (postService.getfeedposts as jest.Mock).mockResolvedValue(mockFeedPosts);

            req = {
                user: { user_id: 'user123' },
            } as Partial<CustomRequest>;

            await postController.getFeedPosts(req as Request, res as Response);

            expect(postService.getfeedposts).toHaveBeenCalledWith('user123');
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(mockFeedPosts);
        });

        it('should return 500 if service throws an error', async () => {
            (postService.getfeedposts as jest.Mock).mockRejectedValue(new Error('Database error'));

            req = {
                user: { user_id: 'user123' },
            } as Partial<CustomRequest>;

            await postController.getFeedPosts(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Failed to fetch posts',
                error: 'Database error',
            });
        });
    });

    describe('likePost', () => {
        it('should return 400 if user ID is missing', async () => {
            req = {
                user: undefined,
                body: { post_id: 'post123' },
            } as Partial<CustomRequest>;

            await postController.likePost(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'User ID is required' });
        });

        it('should return 400 if neither post_id nor comment_id is provided', async () => {
            req = {
                user: { user_id: 'user123' },
                body: {},
            } as Partial<CustomRequest>;

            await postController.likePost(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'postid or commentid is required' });
        });

        it('should return 400 if both post_id and comment_id are provided', async () => {
            req = {
                user: { user_id: 'user123' },
                body: { post_id: 'post123', comment_id: 'comment123' },
            } as Partial<CustomRequest>;

            await postController.likePost(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'you cant like both comment and post at same time' });
        });

        it('should return 201 with like data if successful', async () => {
            const mockLike = {
                id: 'like123',
                user_id: 'user123',
                post_id: 'post123',
            };

            (postService.like as jest.Mock).mockResolvedValue(mockLike);

            req = {
                user: { user_id: 'user123' },
                body: { post_id: 'post123' },
            } as Partial<CustomRequest>;

            await postController.likePost(req as Request, res as Response);

            expect(postService.like).toHaveBeenCalledWith({
                user_id: 'user123',
                post_id: 'post123',
                comment_id: undefined,
            });
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(mockLike);
        });

        it('should return 500 if service throws an error', async () => {
            (postService.like as jest.Mock).mockRejectedValue(new Error('Database error'));

            req = {
                user: { user_id: 'user123' },
                body: { post_id: 'post123' },
            } as Partial<CustomRequest>;

            await postController.likePost(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Failed to create like' });
        });
    });

    describe('deletelike', () => {
        it('should return 400 if user ID is missing', async () => {
            req = {
                user: undefined,
                body: { post_id: 'post123' },
            } as Partial<CustomRequest>;

            await postController.deletelike(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'User ID is required' });
        });

        it('should return 400 if post_id is not provided', async () => {
            req = {
                user: { user_id: 'user123' },
                body: {},
            } as Partial<CustomRequest>;

            await postController.deletelike(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'postid is required' });
        });

        it('should return 200 if like is deleted successfully', async () => {
            (postService.deletelike as jest.Mock).mockResolvedValue({});

            req = {
                user: { user_id: 'user123' },
                body: { post_id: 'post123' },
            } as Partial<CustomRequest>;

            await postController.deletelike(req as Request, res as Response);

            expect(postService.deletelike).toHaveBeenCalledWith({
                user_id: 'user123',
                post_id: 'post123',
            });
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith('deleted like successfully');
        });

        it('should return 500 if service throws an error', async () => {
            (postService.deletelike as jest.Mock).mockRejectedValue(new Error('Database error'));

            req = {
                user: { user_id: 'user123' },
                body: { post_id: 'post123' },
            } as Partial<CustomRequest>;

            await postController.deletelike(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Failed to delete like' });
        });
    });

    describe('commentPost', () => {
        it('should return 400 if user ID is missing', async () => {
            req = {
                user: undefined,
                body: { post_id: 'post123', content: 'Test comment' },
            } as Partial<CustomRequest>;

            await postController.commentPost(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'User ID is required' });
        });

        it('should return 400 if required fields are missing', async () => {
            req = {
                user: { user_id: 'user123' },
                body: { content: 'Test comment' },
            } as Partial<CustomRequest>;

            await postController.commentPost(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'postid and content is required' });
        });

        it('should return 201 with comment data if successful', async () => {
            const mockComment = {
                id: 'comment123',
                post_id: 'post123',
                user_id: 'user123',
                content: 'Test comment',
            };

            (postService.commentpost as jest.Mock).mockResolvedValue(mockComment);

            req = {
                user: { user_id: 'user123' },
                body: { post_id: 'post123', content: 'Test comment' },
            } as Partial<CustomRequest>;

            await postController.commentPost(req as Request, res as Response);

            expect(postService.commentpost).toHaveBeenCalledWith({
                user_id: 'user123',
                post_id: 'post123',
                content: 'Test comment',
                parent_comment_id: undefined,
            });
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(mockComment);
        });

        it('should return 500 if service throws an error', async () => {
            (postService.commentpost as jest.Mock).mockRejectedValue(new Error('Database error'));

            req = {
                user: { user_id: 'user123' },
                body: { post_id: 'post123', content: 'Test comment' },
            } as Partial<CustomRequest>;

            await postController.commentPost(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Failed to create comment' });
        });
    });

    describe('savePost', () => {
        it('should return 400 if user ID is missing', async () => {
            req = {
                user: undefined,
                body: { post_id: 'post123' },
            } as Partial<CustomRequest>;

            await postController.savePost(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'User ID is required' });
        });

        it('should return 400 if post_id is not provided', async () => {
            req = {
                user: { user_id: 'user123' },
                body: {},
            } as Partial<CustomRequest>;

            await postController.savePost(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'postid is required' });
        });

        it('should return 201 with saved post data if successful', async () => {
            const mockSavedPost = {
                id: 'saved123',
                user_id: 'user123',
                post_id: 'post123',
            };

            (postService.savepost as jest.Mock).mockResolvedValue(mockSavedPost);

            req = {
                user: { user_id: 'user123' },
                body: { post_id: 'post123' },
            } as Partial<CustomRequest>;

            await postController.savePost(req as Request, res as Response);

            expect(postService.savepost).toHaveBeenCalledWith({
                user_id: 'user123',
                post_id: 'post123',
            });
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(mockSavedPost);
        });

        it('should return 500 if service throws an error', async () => {
            (postService.savepost as jest.Mock).mockRejectedValue(new Error('Database error'));

            req = {
                user: { user_id: 'user123' },
                body: { post_id: 'post123' },
            } as Partial<CustomRequest>;

            await postController.savePost(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Failed to save post' });
        });
    });

    describe('addMediaToPost', () => {
        beforeEach(() => {
            (cloudinary.v2.uploader.upload_stream as jest.Mock).mockImplementation((options, callback) => {
                return {
                    end: () => {
                        callback(null, { secure_url: 'https://example.com/image.jpg' });
                    }
                };
            });
        });
        it('should return 400 if post_id is missing', async () => {
            req = {
                user: { user_id: 'user123' },
                params: {},
                file: { buffer: Buffer.from('test'), mimetype: 'image/jpeg' } as any,
                body: {},
            } as Partial<CustomRequest>;
    
            await postController.addMediaToPost(req as Request, res as Response);
    
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'post_id is required' });
        });
    
        it('should return 400 if neither file nor link_url is provided', async () => {
            req = {
                user: { user_id: 'user123' },
                params: { post_id: 'post123' },
                file: undefined,
                body: {},
            } as Partial<CustomRequest>;
    
            await postController.addMediaToPost(req as Request, res as Response);
    
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Either a file or a link must be provided' });
        });
    
        it('should return 200 with media data if successful (file upload)', async () => {
            const mockMedia = {
                id: 'media123',
                post_id: 'post123',
                url: 'https://example.com/image.jpg',
                type: 'image',
            };
        
            (postService.addMediaToPost as jest.Mock).mockResolvedValue(mockMedia);
        
            req = {
                user: { user_id: 'user123' },
                params: { post_id: 'post123' },
                file: { buffer: Buffer.from('test'), mimetype: 'image/jpeg' } as any,
                body: {},
            } as Partial<CustomRequest>;
        
            await postController.addMediaToPost(req as Request, res as Response);
        
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Media added to post successfully',
                mediaUrl: 'https://example.com/image.jpg'
            });
        });
    
        it('should return 200 with media data if successful (link)', async () => {
            const mocklink = {
                linkUrl: 'https://example.com/video.mp4',
            };
    
            (postService.addMediaToPost as jest.Mock).mockResolvedValue(mocklink);
    
            req = {
                user: { user_id: 'user123' },
                params: { post_id: 'post123' },
                file: undefined,
                body: { link_url: 'https://example.com/video.mp4' },
            } as Partial<CustomRequest>;
    
            await postController.addMediaToPost(req as Request, res as Response);
    
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                ...mocklink, 
                message: 'Link added to post successfully',
            }); 
        });
    
        it('should return 500 if service throws an error', async () => {
            const error = new Error('Database error');
            (postService.addMediaToPost as jest.Mock).mockRejectedValue(error);
    
            req = {
                user: { user_id: 'user123' },
                params: { post_id: 'post123' },
                body: { link_url: 'https://example.com' },
            } as Partial<CustomRequest>;
    
            await postController.addMediaToPost(req as Request, res as Response);
    
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                details: "Database error",
                error: "Internal server error",
            });
        });
    });

    describe('tagUser', () => {
        it('should return 400 if user ID is missing', async () => {
            req = {
                user: undefined,
                params: { tagged_user_id: 'user456' },
                body: { post_id: 'post123' },
            } as Partial<CustomRequest>;

            await postController.tagUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'User ID is required' });
        });

        it('should return 400 if neither post_id nor comment_id is provided', async () => {
            req = {
                user: { user_id: 'user123' },
                params: { tagged_user_id: 'user456' },
                body: {},
            } as Partial<CustomRequest>;

            await postController.tagUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'postid or commentid is required' });
        });

        it('should return 201 with tag data if successful', async () => {
            const mockTag = {
                post_id: 'post123',
                user_id: 'user456',
            };

            (postService.tagUser as jest.Mock).mockResolvedValue(mockTag);

            req = {
                user: { user_id: 'user123' },
                params: { tagged_user_id: 'user456' },
                body: { post_id: 'post123' },
            } as Partial<CustomRequest>;

            await postController.tagUser(req as Request, res as Response);

            expect(postService.tagUser).toHaveBeenCalledWith({
                user_id: 'user123',
                tagged_user_id: 'user456',
                post_id: 'post123',
                comment_id: undefined,
            });
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(mockTag);
        });

        it('should return 500 if service throws an error', async () => {
            (postService.tagUser as jest.Mock).mockRejectedValue(new Error('Database error'));

            req = {
                user: { user_id: 'user123' },
                params: { tagged_user_id: 'user456' },
                body: { post_id: 'post123' },
            } as Partial<CustomRequest>;

            await postController.tagUser(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Failed to create tag' });
        });
    });
});