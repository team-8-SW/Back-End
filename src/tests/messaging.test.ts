const mockDb: any = jest.fn(() => mockDb);

// Sample mock data
const mockMessages = [
	{
		id: 'req-123',
		sender_id: '2',
		receiver_id: '1',
		content: 'Let’s connect',
		status: 'pending',
		media_url: null,
		media_type: null,
		sent_at: new Date(),
	},
];

const mockUsers = [{ id: '2', firstName: 'Jane', lastName: 'Smith' }];

// Define the deep chainable object for getAllRequests
const chainable = {
	where: jest.fn().mockReturnThis(),
	andWhere: jest.fn().mockReturnThis(),
	orWhere: jest.fn().mockReturnThis(),
	select: jest.fn().mockResolvedValue(mockMessages),
	insert: jest.fn().mockReturnThis(),
	update: jest.fn().mockReturnThis(),
	returning: jest.fn().mockReturnThis(),
	from: jest.fn().mockReturnThis(),
	join: jest.fn().mockReturnThis(),
	orderBy: jest.fn().mockReturnThis(),
	first: jest.fn().mockResolvedValue(true),
	whereIn: jest.fn().mockResolvedValue(mockUsers),
	count: jest.fn().mockReturnValue({
		first: jest.fn().mockResolvedValue({ count: '4' }),
	}),
};

// Assign all methods to mockDb
Object.assign(mockDb, chainable);

jest.mock('../config/db', () => ({
	knexInstance: mockDb,
	pool: { options: {} },
}));

jest.mock('knex', () => {
	return () => mockDb;
});

jest.mock('../utils/cloudinary', () => {
	return {
		__esModule: true,
		default: {
			uploader: {
				upload_stream: jest.fn().mockImplementation((_opts, cb) => {
					const stream: any = {
						end: () => {
							cb(null, { secure_url: 'https://mock.cloudinary.com/media.jpg' });
						},
					};
					return stream;
				}),
			},
		},
	};
});

import * as messagingService from '../services/messaging.service';
import { setUserTyping, isUserTypingTo } from '../utils/typingStatus';

const {
	createTextMessage,
	createMediaMessage,
	getConversationBetweenUsers,
	getConversationParticipants,
	getAllConversationsForUser,
	getUnreadMessageCount,
	markConversationAsRead,
	markConversationAsUnread,
	getLastMessageReadStatus,
} = messagingService;

describe('Messaging Service', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('createTextMessage', () => {
		it('should insert and return a text message', async () => {
			const mockMessage = {
				id: 'msg123',
				content: 'Hello!',
				sent_at: new Date(),
			};

			const insertMock = jest.fn().mockReturnValue({
				returning: jest.fn().mockResolvedValue([mockMessage]),
			});
			mockDb.insert = insertMock;

			const result = await createTextMessage('1', '2', 'Hello!');
			expect(result).toEqual(mockMessage);
		});
	});

	describe('createMediaMessage', () => {
		it('should upload media to cloudinary and insert message', async () => {
			const mockFile = {
				buffer: Buffer.from('mock-file'),
				mimetype: 'image/png',
			} as Express.Multer.File;

			const mockMessage = {
				id: 'media123',
				media_url: 'https://mock.cloudinary.com/media.jpg',
				media_type: 'image',
				sent_at: new Date(),
			};

			const insertMock = jest.fn().mockReturnValue({
				returning: jest.fn().mockResolvedValue([mockMessage]),
			});
			mockDb.insert = insertMock;

			const result = await createMediaMessage('1', '2', mockFile);
			expect(result.media_url).toBe('https://mock.cloudinary.com/media.jpg');
			expect(result.media_type).toBe('image');
		});
	});

	describe('getConversationBetweenUsers', () => {
		it('should return ordered conversation between users', async () => {
			const mockMessages = [{ id: '1', content: 'hi' }];
			const whereMock = jest.fn().mockReturnThis();
			const andWhereMock = jest.fn().mockReturnThis();
			const orderByMock = jest.fn().mockResolvedValue(mockMessages);

			mockDb.where = whereMock;
			mockDb.andWhere = andWhereMock;
			mockDb.orderBy = orderByMock;

			const result = await getConversationBetweenUsers('1', '2');
			expect(result).toEqual(mockMessages);
		});
	});

	describe('getConversationParticipants', () => {
		it('should return user info for given userIds', async () => {
			const users = [{ id: '1', firstName: 'John', lastName: 'Doe' }];
			mockDb.select = jest.fn().mockReturnValue({
				whereIn: jest.fn().mockResolvedValue(users),
			});

			const result = await getConversationParticipants(['1']);
			expect(result).toEqual(users);
		});
	});

	describe('getAllConversationsForUser', () => {
		it('should return latest conversations for a user', async () => {
			mockDb.where = jest.fn().mockReturnThis();
			mockDb.orWhere = jest.fn().mockReturnThis();
			mockDb.select = jest
				.fn()
				.mockResolvedValueOnce(mockMessages) // step 1: messages
				.mockReturnValueOnce({
					// step 2: users
					whereIn: jest.fn().mockResolvedValue(mockUsers),
				});

			const result = await getAllConversationsForUser('1');
			expect(result.length).toBeGreaterThanOrEqual(1);
			expect(result[0].participants).toBeDefined();
		});
	});

	describe('getUnreadMessageCount', () => {
		it('should return number of unread messages', async () => {
			const result = await getUnreadMessageCount('1');
			expect(result).toBe(4);
		});
	});

	describe('markConversationAsRead', () => {
		it('should update messages to is_read=true', async () => {
			mockDb.update = jest.fn().mockReturnValue(3);

			const result = await markConversationAsRead('1', '2');
			expect(result).toBe(3);
		});
	});

	describe('markConversationAsUnread', () => {
		it('should update messages to is_read=false', async () => {
			mockDb.update = jest.fn().mockReturnValue(2);

			const result = await markConversationAsUnread('1', '2');
			expect(result).toBe(2);
		});
	});

	describe('getLastMessageReadStatus', () => {
		it('should return read status of last message', async () => {
			const mockMessage = {
				id: '1',
				sender_id: '1',
				is_read: true,
				sent_at: new Date(),
			};

			mockDb.where = jest.fn().mockReturnValue({
				orderBy: jest.fn().mockReturnValue({
					first: jest.fn().mockResolvedValue(mockMessage),
				}),
			});

			const result = await getLastMessageReadStatus('1', '2');
			expect(result?.isRead).toBe(true);
		});
	});
});

describe('Typing Status Utils', () => {
	it('should set and expire typing status', (done) => {
		setUserTyping('1', '2', 100); // 100ms timeout
		expect(isUserTypingTo('1', '2')).toBe(true);

		setTimeout(() => {
			expect(isUserTypingTo('1', '2')).toBe(false);
			done();
		}, 150);
	});

	it('should clear previous timeout when resetting typing', () => {
		setUserTyping('3', '4', 1000);
		setUserTyping('3', '4', 1000); // resets previous
		expect(isUserTypingTo('3', '4')).toBe(true);
	});
});

describe('getAllRequests', () => {
	it('should return pending message requests for a user', async () => {
		const pendingMessages = [
			{
				id: 'req-123',
				sender_id: '2',
				receiver_id: '1',
				content: 'Let’s connect',
				status: 'pending',
				sent_at: new Date(),
			},
		];

		const chain = {
			where: jest.fn().mockReturnThis(),
			andWhere: jest.fn().mockReturnThis(),
			orderBy: jest.fn().mockResolvedValue(pendingMessages),
		};

		mockDb.select = jest.fn(() => chain); // return chain when select() is called

		// Now mock the second db.select().whereIn(...) for participants
		mockDb.select
			.mockImplementationOnce(() => chain) // first for messages
			.mockImplementationOnce(() => ({
				whereIn: jest.fn().mockResolvedValue(mockUsers),
			})); // second for users

		const { getAllRequests } = messagingService;
		const result = await getAllRequests('1');

		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBe(1);
		expect(result[0].participants[0].firstName).toBe('Jane');
		expect(result[0].lastMessage).toBe('Let’s connect');
	});
});
