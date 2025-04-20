
import React from 'react';
import { Review } from '@/types/review';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface ReviewListProps {
  reviews: Review[];
  loading: boolean;
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews, loading }) => {
  if (loading) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">加载评论中...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md">
        <p className="text-gray-500">暂无评论数据</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>作者</TableHead>
            <TableHead>日期</TableHead>
            <TableHead>评分</TableHead>
            <TableHead className="hidden md:table-cell">内容</TableHead>
            <TableHead className="hidden sm:table-cell">点赞/踩</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell className="font-medium">{review.author}</TableCell>
              <TableCell>{review.date}</TableCell>
              <TableCell>
                <div className="flex">
                  {Array(5).fill(0).map((_, i) => (
                    <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                  ))}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell max-w-md truncate">
                {review.content}
                {review.images && review.images.length > 0 && (
                  <span className="ml-2 text-blue-500 text-xs">[有图片]</span>
                )}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {review.likes} / {review.dislikes}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReviewList;
