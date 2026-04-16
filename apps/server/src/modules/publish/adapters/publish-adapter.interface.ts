export interface PublishContent {
  title: string;
  content: string; // HTML
  coverImage?: string;
  tags?: string[];
}

export interface PublishResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  errorMessage?: string;
}

export interface PublishAdapter {
  platform: string;
  publish(accessToken: string, content: PublishContent): Promise<PublishResult>;
}
