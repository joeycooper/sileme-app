import type { GroupEncouragePost } from "../../../../services/api";

type GroupEncourageWallProps = {
  posts: GroupEncouragePost[];
  formatTime: (value: string) => string;
};

export default function GroupEncourageWall({ posts, formatTime }: GroupEncourageWallProps) {
  return (
    <div className="group-encourage-card">
      <h5>群内鼓励墙</h5>
      <div className="encourage-wall">
        {posts.map((post) => (
          <div key={post.id} className="encourage-post">
            <strong>{post.author}</strong>
            <span>{post.message}</span>
            <em>{formatTime(post.created_at)}</em>
          </div>
        ))}
      </div>
    </div>
  );
}
