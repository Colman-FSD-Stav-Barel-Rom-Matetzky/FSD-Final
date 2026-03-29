export type PostOwner = {
  _id: string;
  username: string;
  profileImage?: string;
};

export type Post = {
  _id: string;
  content: string;
  image?: string;
  owner: PostOwner;
  likes: string[];
  commentCount: number;
  createdAt: string;
};

export type FeedResponse = {
  data: Post[];
  nextCursor: string | null;
};
