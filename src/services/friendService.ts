import { FriendRequest, Friendship, User, Notification } from '../types';
import { dataService } from './dataService';
import { v4 as uuidv4 } from 'uuid';

class FriendService {
  private static instance: FriendService;

  private constructor() {}

  public static getInstance(): FriendService {
    if (!FriendService.instance) {
      FriendService.instance = new FriendService();
    }
    return FriendService.instance;
  }

  // Send friend request
  public async sendFriendRequest(senderId: string, receiverId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Prevent self-friending
      if (senderId === receiverId) {
        return { success: false, error: 'Cannot send friend request to yourself' };
      }

      // Check if already friends
      const existingFriendship = await this.areFriends(senderId, receiverId);
      if (existingFriendship) {
        return { success: false, error: 'Already friends with this user' };
      }

      // Check for existing pending request
      const existingRequest = await this.getPendingRequest(senderId, receiverId);
      if (existingRequest) {
        return { success: false, error: 'Friend request already sent' };
      }

      // Create friend request
      const friendRequest: FriendRequest = {
        id: uuidv4(),
        senderId,
        receiverId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await dataService.saveFriendRequest(friendRequest);

      // Create notification for receiver
      const sender = await dataService.getUserById(senderId);
      if (sender) {
        const notification: Notification = {
          id: uuidv4(),
          userId: receiverId,
          title: 'New Friend Request',
          message: `${sender.username} wants to be your friend!`,
          type: 'friend_request',
          read: false,
          timestamp: new Date().toISOString(),
          actionUrl: '/friends'
        };
        await dataService.saveNotification(notification);
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending friend request:', error);
      return { success: false, error: 'Failed to send friend request' };
    }
  }

  // Accept friend request
  public async acceptFriendRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const request = await dataService.getFriendRequestById(requestId);
      if (!request || request.status !== 'pending') {
        return { success: false, error: 'Friend request not found or already processed' };
      }

      // Create friendship
      const friendship: Friendship = {
        id: uuidv4(),
        userId1: request.senderId,
        userId2: request.receiverId,
        createdAt: new Date().toISOString()
      };

      await dataService.saveFriendship(friendship);

      // Update request status
      await dataService.updateFriendRequest(requestId, {
        status: 'accepted',
        updatedAt: new Date().toISOString()
      });

      // Create notifications for both users
      const [sender, receiver] = await Promise.all([
        dataService.getUserById(request.senderId),
        dataService.getUserById(request.receiverId)
      ]);

      if (sender && receiver) {
        // Notify sender
        const senderNotification: Notification = {
          id: uuidv4(),
          userId: request.senderId,
          title: 'Friend Request Accepted',
          message: `${receiver.username} accepted your friend request!`,
          type: 'friend_accepted',
          read: false,
          timestamp: new Date().toISOString(),
          actionUrl: '/friends'
        };

        await dataService.saveNotification(senderNotification);

        // Add to activity logs
        await dataService.addActivityEntry(request.senderId, {
          id: uuidv4(),
          description: `Became friends with ${receiver.username}`,
          timestamp: new Date().toISOString(),
          xpGained: 10,
          type: 'friend'
        });

        await dataService.addActivityEntry(request.receiverId, {
          id: uuidv4(),
          description: `Became friends with ${sender.username}`,
          timestamp: new Date().toISOString(),
          xpGained: 10,
          type: 'friend'
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return { success: false, error: 'Failed to accept friend request' };
    }
  }

  // Reject friend request
  public async rejectFriendRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const request = await dataService.getFriendRequestById(requestId);
      if (!request || request.status !== 'pending') {
        return { success: false, error: 'Friend request not found or already processed' };
      }

      await dataService.updateFriendRequest(requestId, {
        status: 'rejected',
        updatedAt: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      return { success: false, error: 'Failed to reject friend request' };
    }
  }

  // Remove friendship
  public async removeFriend(userId: string, friendId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const friendship = await this.getFriendship(userId, friendId);
      if (!friendship) {
        return { success: false, error: 'Friendship not found' };
      }

      await dataService.deleteFriendship(friendship.id);
      return { success: true };
    } catch (error) {
      console.error('Error removing friend:', error);
      return { success: false, error: 'Failed to remove friend' };
    }
  }

  // Get user's friends
  public async getUserFriends(userId: string): Promise<User[]> {
    try {
      const friendships = await dataService.getFriendships();
      const userFriendships = friendships.filter(f => 
        f.userId1 === userId || f.userId2 === userId
      );

      const friendIds = userFriendships.map(f => 
        f.userId1 === userId ? f.userId2 : f.userId1
      );

      const friends = await Promise.all(
        friendIds.map(id => dataService.getUserById(id))
      );

      return friends.filter(Boolean) as User[];
    } catch (error) {
      console.error('Error getting user friends:', error);
      return [];
    }
  }

  // Get friend requests for user
  public async getFriendRequests(userId: string): Promise<{
    incoming: (FriendRequest & { sender: User })[];
    outgoing: (FriendRequest & { receiver: User })[];
  }> {
    try {
      const requests = await dataService.getFriendRequests();
      
      const incoming = await Promise.all(
        requests
          .filter(r => r.receiverId === userId && r.status === 'pending')
          .map(async (request) => {
            const sender = await dataService.getUserById(request.senderId);
            return { ...request, sender: sender! };
          })
      );

      const outgoing = await Promise.all(
        requests
          .filter(r => r.senderId === userId && r.status === 'pending')
          .map(async (request) => {
            const receiver = await dataService.getUserById(request.receiverId);
            return { ...request, receiver: receiver! };
          })
      );

      return { incoming, outgoing };
    } catch (error) {
      console.error('Error getting friend requests:', error);
      return { incoming: [], outgoing: [] };
    }
  }

  // Check friendship status between two users
  public async getFriendshipStatus(userId: string, targetUserId: string): Promise<'friends' | 'pending_sent' | 'pending_received' | 'none'> {
    try {
      // Check if already friends
      const areFriends = await this.areFriends(userId, targetUserId);
      if (areFriends) return 'friends';

      // Check for pending requests
      const requests = await dataService.getFriendRequests();
      const sentRequest = requests.find(r => 
        r.senderId === userId && r.receiverId === targetUserId && r.status === 'pending'
      );
      if (sentRequest) return 'pending_sent';

      const receivedRequest = requests.find(r => 
        r.senderId === targetUserId && r.receiverId === userId && r.status === 'pending'
      );
      if (receivedRequest) return 'pending_received';

      return 'none';
    } catch (error) {
      console.error('Error checking friendship status:', error);
      return 'none';
    }
  }

  // Helper methods
  private async areFriends(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await this.getFriendship(userId1, userId2);
    return !!friendship;
  }

  private async getFriendship(userId1: string, userId2: string): Promise<Friendship | null> {
    const friendships = await dataService.getFriendships();
    return friendships.find(f => 
      (f.userId1 === userId1 && f.userId2 === userId2) ||
      (f.userId1 === userId2 && f.userId2 === userId1)
    ) || null;
  }

  private async getPendingRequest(senderId: string, receiverId: string): Promise<FriendRequest | null> {
    const requests = await dataService.getFriendRequests();
    return requests.find(r => 
      r.senderId === senderId && r.receiverId === receiverId && r.status === 'pending'
    ) || null;
  }
}

export const friendService = FriendService.getInstance();