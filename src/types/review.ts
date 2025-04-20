
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

export interface PaginatedReviews {
  reviews: Review[];
  totalPages: number;
  currentPage: number;
  totalReviews: number;
  pageKey?: string;
  productId: string;
}
