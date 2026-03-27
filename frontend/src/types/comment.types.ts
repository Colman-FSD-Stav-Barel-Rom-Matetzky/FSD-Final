export type Comment = {
  _id: string;
  content: string;
  owner: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  post: string;
  createdAt: string;
};

export type CommentsResponse = {
  data: Comment[];
  nextCursor: string | null;
};
