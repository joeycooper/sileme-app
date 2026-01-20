import type { ReactNode } from "react";
import { EmptyState, LoadingState } from "./index";

type NoticeListProps = {
  loading: boolean;
  isEmpty: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  children: ReactNode;
};

export default function NoticeList({
  loading,
  isEmpty,
  emptyTitle = "暂无通知",
  emptyDescription = "提醒会显示在这里",
  children
}: NoticeListProps) {
  if (loading) {
    return <LoadingState />;
  }

  if (isEmpty) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return <div className="notice-list">{children}</div>;
}
