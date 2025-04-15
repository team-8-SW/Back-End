import * as notificationsController from '../controllers/notifications.controller';
import * as notificationService from '../services/notifications.service';
import { Request, Response } from 'express';

console.error = jest.fn();

interface CustomRequest extends Request {
  user?: { user_id: string };
}
jest.mock('../config/db', () => ({
  knexInstance: {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
  },
}));
jest.mock('../services/notifications.service', () => ({
  getAllNotifications: jest.fn(),
  getUnreadNotificationCount: jest.fn(),
  markNotificationAsRead: jest.fn()
}));

describe('Notifications Controller', () => {
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

  describe('getAllNotifications', () => {
    it('should return 400 if user_id is missing', async () => {
      req = {
        user: undefined,
    } as Partial<CustomRequest>;
      await notificationsController.getAllNotifications(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'User ID is required' });
    });

    it('should return 200 and notifications list', async () => {
      const mockNotifications = [{ id: 'notif1', user_id: 'user123', content: 'Welcome!' }];
      (notificationService.getAllNotifications as jest.Mock).mockResolvedValue(mockNotifications);

      req = { user: { user_id: 'user123' } };

      await notificationsController.getAllNotifications(req as Request, res as Response);

      expect(notificationService.getAllNotifications).toHaveBeenCalledWith('user123');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockNotifications);
    });

    it('should return 500 on error', async () => {
      (notificationService.getAllNotifications as jest.Mock).mockRejectedValue(new Error('Service error'));

      req = { user: { user_id: 'user123' } };

      await notificationsController.getAllNotifications(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Failed to fetch notifications',
        error: 'Service error',
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should return 200 with unread count', async () => {
      (notificationService.getUnreadNotificationCount as jest.Mock).mockResolvedValue(3);

      req = { user: { user_id: 'user123' } };

      await notificationsController.getUnreadCount(req as Request, res as Response);

      expect(notificationService.getUnreadNotificationCount).toHaveBeenCalledWith('user123');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ unreadCount: 3 });
    });

    it('should return 500 on service error', async () => {
      (notificationService.getUnreadNotificationCount as jest.Mock).mockRejectedValue(new Error('Database failure'));

      req = { user: { user_id: 'user123' } };

      await notificationsController.getUnreadCount(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Failed to fetch unread count',
        error: 'Database failure',
      });
    });
  });

  describe('markNotificationAsRead', () => {
    it('should return 200 when notification is marked as read', async () => {
      const mockNotification = { id: 'notif1', user_id: 'user123', is_read: true };
      (notificationService.markNotificationAsRead as jest.Mock).mockResolvedValue(mockNotification);

      req = {
        user: { user_id: 'user123' },
        params: { id: 'notif1' },
      };

      await notificationsController.markNotificationAsRead(req as Request, res as Response);

      expect(notificationService.markNotificationAsRead).toHaveBeenCalledWith('notif1', 'user123');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Notification marked as read',
        notification: mockNotification,
      });
    });

    it('should return 500 on service failure', async () => {
      (notificationService.markNotificationAsRead as jest.Mock).mockRejectedValue(new Error('Update error'));

      req = {
        user: { user_id: 'user123' },
        params: { id: 'notif1' },
      };

      await notificationsController.markNotificationAsRead(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Failed to mark notification as read',
        error: 'Update error',
      });
    });
  });
});
