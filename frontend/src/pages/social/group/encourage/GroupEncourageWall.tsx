import type { GroupEncouragePost } from "../../../../services/api";

type GroupEncourageWallProps = {
  posts: GroupEncouragePost[];
  formatTime: (value: string) => string;
};

export default function GroupEncourageWall({ posts, formatTime }: GroupEncourageWallProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-white/90 p-5 shadow-sm">
      <h5 className="text-sm font-semibold text-ink">群内鼓励墙</h5>
      <div className="space-y-3">
        {posts.length === 0 ? (
          <p className="text-xs text-muted-foreground">还没有鼓励内容</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="space-y-1 rounded-xl border border-border/60 bg-white/90 p-3 text-sm">
              <strong className="text-ink">{post.author}</strong>
              <span className="block text-sm text-ink">{post.message}</span>
              <em className="text-xs text-muted-foreground">{formatTime(post.created_at)}</em>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
