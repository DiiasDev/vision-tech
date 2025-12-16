export type NotificationType =
  | "system"
  | "finance"
  | "service"
  | "stock";

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  read: boolean;
  date: string;
}
