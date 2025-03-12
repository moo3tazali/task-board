import { NotificationType } from '@prisma/client';

export const NotificationMessages: Record<NotificationType, string> =
  {
    [NotificationType.TASK_ASSIGNED]:
      'A new task has been assigned to you.',
    [NotificationType.TASK_UNASSIGNED]:
      'You have been unassigned from a task.',
    [NotificationType.TASK_COMPLETED]:
      'A task you were working on has been completed.',
    [NotificationType.TASK_OVERDUE]:
      'A task is overdue. Please check it.',
    [NotificationType.TASK_MOVED]:
      'A task has been moved to another list.',
    [NotificationType.TASK_STATUS_UPDATED]:
      'A task status has been updated.',
    [NotificationType.TASK_DUE_DATE_UPDATED]:
      'A task due date has been updated.',

    [NotificationType.COMMENT_ADDED]:
      'A new comment has been added to a task.',
    [NotificationType.COMMENT_MENTION]:
      'You have been mentioned in a comment.',

    [NotificationType.ATTACHMENT_ADDED]:
      'A new attachment has been added to a task.',
    [NotificationType.ATTACHMENT_DELETED]:
      'An attachment has been removed from a task.',

    [NotificationType.LIST_CREATED]: 'A new list has been created.',
    [NotificationType.LIST_UPDATED]: 'A list has been updated.',
    [NotificationType.LIST_DELETED]: 'A list has been deleted.',

    [NotificationType.BOARD_INVITE]:
      'You have been invited to a board.',
    [NotificationType.BOARD_ROLE_UPDATED]:
      'Your role in the board has been updated.',
    [NotificationType.BOARD_PERMISIONS_UPDATED]:
      'Your permissions in the board have been updated.',
    [NotificationType.BOARD_DELETED]: 'A board has been deleted.',
    [NotificationType.BOARD_MEMBER_REMOVED]:
      'You have been removed from a board',

    [NotificationType.MEMBER_ADDED]: 'A new member has been added.',
    [NotificationType.MEMBER_REMOVED]: 'A member has been removed.',
    [NotificationType.MEMBER_ROLE_UPDATED]:
      "A member's role has been updated.",
    [NotificationType.MEMBER_PERMISSION_UPDATED]:
      "A member's permissions have been updated.",

    [NotificationType.GENERAL]: 'You have a new notification.',
  };

export default NotificationMessages;
