
export interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  content: string;
  likes: number;
  dislikes: number;
  images?: string[];
}
