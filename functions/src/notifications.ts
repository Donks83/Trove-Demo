import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

const db = getFirestore();
const messaging = getMessaging();

/**
 * Send notification when hunt invitation is created
 */
export const onHuntInvitation = onDocumentCreated(
  'huntInvitations/{invitationId}',
  async (event) => {
    const invitation = event.data?.data();
    if (!invitation) return;
    
    const invitationId = event.params.invitationId;
    
    try {
      // Get invitee's notification tokens
      const userSnapshot = await db
        .collection('users')
        .where('email', '==', invitation.inviteeEmail)
        .limit(1)
        .get();
      
      if (userSnapshot.empty) {
        console.log('User not found for email:', invitation.inviteeEmail);
        return;
      }
      
      const userDoc = userSnapshot.docs[0];
      const user = userDoc.data();
      const tokens = user.notificationTokens;
      
      // Create in-app notification (always create this)
      await db.collection('notifications').add({
        userId: userDoc.id,
        type: 'hunt_invitation',
        title: 'Hunt Invitation',
        body: `${invitation.ownerName} invited you to join "${invitation.huntTitle}"`,
        data: {
          invitationId: invitationId,
          huntId: invitation.huntId,
        },
        read: false,
        createdAt: FieldValue.serverTimestamp(),
        actionUrl: '/hunt-invitations',
      });
      
      // Send push notification if tokens exist
      if (tokens?.fcm) {
        const message = {
          notification: {
            title: 'Hunt Invitation',
            body: `${invitation.ownerName} invited you to join "${invitation.huntTitle}"`,
          },
          data: {
            type: 'hunt_invitation',
            invitationId: invitationId,
            huntId: invitation.huntId,
            actionUrl: '/hunt-invitations',
          },
          token: tokens.fcm,
        };
        
        await messaging.send(message);
        console.log('Push notification sent for hunt invitation');
      }
    } catch (error) {
      console.error('Error sending hunt invitation notification:', error);
    }
  }
);

/**
 * Send notification when new drop is added to hunt
 */
export const onHuntDropAdded = onDocumentCreated(
  'drops/{dropId}',
  async (event) => {
    const drop = event.data?.data();
    if (!drop) return;
    
    const dropId = event.params.dropId;
    
    // Only process hunt drops
    if (drop.dropType !== 'hunt' || !drop.huntId) {
      return;
    }
    
    try {
      // Get all hunt participants
      const participantsSnapshot = await db
        .collection('huntParticipants')
        .where('huntId', '==', drop.huntId)
        .get();
      
      if (participantsSnapshot.empty) {
        console.log('No participants found for hunt:', drop.huntId);
        return;
      }
      
      // Send notification to each participant (except the creator)
      const promises = participantsSnapshot.docs.map(async (participantDoc) => {
        const participant = participantDoc.data();
        
        // Don't notify the drop creator
        if (participant.userId === drop.ownerId) {
          return;
        }
        
        try {
          // Get user's tokens
          const userDoc = await db
            .collection('users')
            .doc(participant.userId)
            .get();
          
          if (!userDoc.exists) {
            return;
          }
          
          const user = userDoc.data();
          const tokens = user?.notificationTokens;
          
          // Create in-app notification
          await db.collection('notifications').add({
            userId: participant.userId,
            type: 'hunt_new_drop',
            title: 'New Drop Added',
            body: `A new drop "${drop.title}" was added to your hunt!`,
            data: {
              dropId: dropId,
              huntId: drop.huntId,
            },
            read: false,
            createdAt: FieldValue.serverTimestamp(),
            actionUrl: `/drops/${dropId}`,
          });
          
          // Send push notification if tokens exist
          if (tokens?.fcm) {
            const message = {
              notification: {
                title: 'New Drop Added',
                body: `A new drop "${drop.title}" was added to your hunt!`,
              },
              data: {
                type: 'hunt_new_drop',
                dropId: dropId,
                huntId: drop.huntId,
                actionUrl: `/drops/${dropId}`,
              },
              token: tokens.fcm,
            };
            
            await messaging.send(message);
          }
        } catch (error) {
          console.error('Error notifying participant:', participant.userId, error);
        }
      });
      
      await Promise.all(promises);
      console.log('Notifications sent for new hunt drop');
    } catch (error) {
      console.error('Error sending hunt drop notifications:', error);
    }
  }
);

/**
 * Send notification when participant accepts hunt invitation
 */
export const onHuntInvitationAccepted = onDocumentUpdated(
  'huntInvitations/{invitationId}',
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    
    if (!before || !after) return;
    
    // Only process when status changes to accepted
    if (before.status !== 'accepted' && after.status === 'accepted') {
      try {
        // Get hunt owner
        const huntDoc = await db
          .collection('treasureHunts')
          .doc(after.huntId)
          .get();
        
        if (!huntDoc.exists) {
          return;
        }
        
        const hunt = huntDoc.data();
        const ownerId = hunt?.ownerId;
        
        if (!ownerId) {
          return;
        }
        
        // Get owner's tokens
        const ownerDoc = await db
          .collection('users')
          .doc(ownerId)
          .get();
        
        if (!ownerDoc.exists) {
          return;
        }
        
        const owner = ownerDoc.data();
        const tokens = owner?.notificationTokens;
        
        // Create in-app notification
        await db.collection('notifications').add({
          userId: ownerId,
          type: 'hunt_accepted',
          title: 'Hunt Invitation Accepted',
          body: `${after.inviteeEmail} accepted your invitation to "${after.huntTitle}"`,
          data: {
            huntId: after.huntId,
            inviteeEmail: after.inviteeEmail,
          },
          read: false,
          createdAt: FieldValue.serverTimestamp(),
          actionUrl: `/hunts/${after.huntId}`,
        });
        
        // Send push notification if tokens exist
        if (tokens?.fcm) {
          const message = {
            notification: {
              title: 'Hunt Invitation Accepted',
              body: `${after.inviteeEmail} accepted your invitation to "${after.huntTitle}"`,
            },
            data: {
              type: 'hunt_accepted',
              huntId: after.huntId,
              actionUrl: `/hunts/${after.huntId}`,
            },
            token: tokens.fcm,
          };
          
          await messaging.send(message);
        }
        
        console.log('Notification sent for accepted invitation');
      } catch (error) {
        console.error('Error sending accepted invitation notification:', error);
      }
    }
  }
);

/**
 * Send notification when new participant joins hunt
 */
export const onHuntParticipantJoined = onDocumentCreated(
  'huntParticipants/{participantId}',
  async (event) => {
    const participant = event.data?.data();
    if (!participant) return;
    
    const participantId = event.params.participantId;
    
    try {
      // Get hunt details
      const huntDoc = await db
        .collection('treasureHunts')
        .doc(participant.huntId)
        .get();
      
      if (!huntDoc.exists) {
        return;
      }
      
      const hunt = huntDoc.data();
      const ownerId = hunt?.ownerId;
      
      // Don't notify if the participant is the owner
      if (participant.userId === ownerId) {
        return;
      }
      
      if (!ownerId) {
        return;
      }
      
      // Get owner's tokens
      const ownerDoc = await db
        .collection('users')
        .doc(ownerId)
        .get();
      
      if (!ownerDoc.exists) {
        return;
      }
      
      const owner = ownerDoc.data();
      const tokens = owner?.notificationTokens;
      
      // Create in-app notification
      await db.collection('notifications').add({
        userId: ownerId,
        type: 'hunt_participant_joined',
        title: 'New Participant',
        body: `${participant.displayName} joined your hunt "${hunt?.title}"`,
        data: {
          huntId: participant.huntId,
          participantId: participantId,
          participantName: participant.displayName,
        },
        read: false,
        createdAt: FieldValue.serverTimestamp(),
        actionUrl: `/hunts/${participant.huntId}`,
      });
      
      // Send push notification if tokens exist
      if (tokens?.fcm) {
        const message = {
          notification: {
            title: 'New Participant',
            body: `${participant.displayName} joined your hunt "${hunt?.title}"`,
          },
          data: {
            type: 'hunt_participant_joined',
            huntId: participant.huntId,
            actionUrl: `/hunts/${participant.huntId}`,
          },
          token: tokens.fcm,
        };
        
        await messaging.send(message);
      }
      
      console.log('Notification sent for new participant');
    } catch (error) {
      console.error('Error sending participant joined notification:', error);
    }
  }
);

/**
 * Send notification when hunt is completed
 */
export const onHuntCompleted = onDocumentUpdated(
  'treasureHunts/{huntId}',
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    
    if (!before || !after) return;
    
    const huntId = event.params.huntId;
    
    // Only process when status changes to completed
    if (before.status !== 'completed' && after.status === 'completed') {
      try {
        // Get all participants
        const participantsSnapshot = await db
          .collection('huntParticipants')
          .where('huntId', '==', huntId)
          .get();
        
        if (participantsSnapshot.empty) {
          return;
        }
        
        // Notify each participant
        const promises = participantsSnapshot.docs.map(async (participantDoc) => {
          const participant = participantDoc.data();
          
          try {
            const userDoc = await db
              .collection('users')
              .doc(participant.userId)
              .get();
            
            if (!userDoc.exists) {
              return;
            }
            
            const user = userDoc.data();
            const tokens = user?.notificationTokens;
            
            // Create in-app notification
            await db.collection('notifications').add({
              userId: participant.userId,
              type: 'hunt_completed',
              title: 'Hunt Completed!',
              body: `The hunt "${after.title}" has been completed! 🎉`,
              data: {
                huntId: huntId,
              },
              read: false,
              createdAt: FieldValue.serverTimestamp(),
              actionUrl: `/hunts/${huntId}`,
            });
            
            // Send push notification if tokens exist
            if (tokens?.fcm) {
              const message = {
                notification: {
                  title: 'Hunt Completed! 🎉',
                  body: `The hunt "${after.title}" has been completed!`,
                },
                data: {
                  type: 'hunt_completed',
                  huntId: huntId,
                  actionUrl: `/hunts/${huntId}`,
                },
                token: tokens.fcm,
              };
              
              await messaging.send(message);
            }
          } catch (error) {
            console.error('Error notifying participant:', participant.userId, error);
          }
        });
        
        await Promise.all(promises);
        console.log('Notifications sent for completed hunt');
      } catch (error) {
        console.error('Error sending hunt completed notifications:', error);
      }
    }
  }
);
