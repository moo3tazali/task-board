import { BoardPermission, BoardRole } from '@prisma/client';

export const ROLE_PERMISSIONS: Record<BoardRole, BoardPermission[]> =
  {
    OWNER: Object.values(BoardPermission),
    MANAGER: [
      BoardPermission.BOARD_MEMBERS_PERMISSION_UPDATE,
      BoardPermission.BOARD_MEMBERS_CREATE,
      BoardPermission.BOARD_MEMBERS_UPDATE,
      BoardPermission.BOARD_MEMBERS_DELETE,
      BoardPermission.LIST_CREATE,
      BoardPermission.LIST_UPDATE,
      BoardPermission.LIST_DELETE,
      BoardPermission.LISTS_ORDER_UPDATE,
      BoardPermission.TASK_CREATE,
      BoardPermission.TASK_UPDATE,
      BoardPermission.TASK_DELETE,
      BoardPermission.TASKS_ORDER_UPDATE,
      BoardPermission.TASK_LABEL_CREATE,
      BoardPermission.TASK_LABEL_UPDATE,
      BoardPermission.TASK_LABEL_DELETE,
      BoardPermission.TASK_ASSIGN,
      BoardPermission.TASK_UNASSIGN,
      BoardPermission.TASK_DUE_DATE_UPDATE,
    ],
    MEMBER: [
      BoardPermission.TASK_MOVE,
      BoardPermission.TASK_STATUS_UPDATE,
      BoardPermission.TASK_COMMENT_CREATE,
      BoardPermission.TASK_COMMENT_UPDATE,
      BoardPermission.TASK_COMMENT_DELETE,
      BoardPermission.TASK_ATTACHMENT_CREATE,
      BoardPermission.TASK_ATTACHMENT_DELETE,
      BoardPermission.TASK_ATTACHMENT_VIEW,
    ],
    VIEWER: [],
  };
