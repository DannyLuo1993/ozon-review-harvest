
import { Review } from "../types/review";

// 模拟的抓取延迟
const FETCH_DELAY = 1500;

// 生成随机的评论数据
const generateMockReviews = (count: number): Review[] => {
  const reviews: Review[] = [];
  const authors = ["Александр", "Елена", "Иван", "Ольга", "Дмитрий", "Мария", "Сергей", "Анна"];
  const contents = [
    "Отличный товар! Всем рекомендую.",
    "Качество соответствует цене.",
    "Доставка быстрая, товар хороший.",
    "Не совсем то, что я ожидал, но в целом неплохо.",
    "Очень довольна покупкой!",
    "Хорошее соотношение цены и качества.",
    "Нормальный товар, но есть некоторые недостатки.",
    "Доставили быстро, качество отличное!"
  ];

  for (let i = 0; i < count; i++) {
    const randomAuthorIndex = Math.floor(Math.random() * authors.length);
    const randomContentIndex = Math.floor(Math.random() * contents.length);
    const randomRating = Math.floor(Math.random() * 5) + 1;
    const randomLikes = Math.floor(Math.random() * 50);
    const randomDislikes = Math.floor(Math.random() * 10);
    
    // 随机生成日期 (最近90天内)
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    
    // 随机决定是否有图片
    const hasImages = Math.random() > 0.7;
    const imageCount = hasImages ? Math.floor(Math.random() * 3) + 1 : 0;
    const images = hasImages 
      ? Array(imageCount).fill(0).map((_, idx) => 
          `https://picsum.photos/seed/${i}${idx}/200/200`) 
      : undefined;

    reviews.push({
      id: `review-${i}`,
      author: authors[randomAuthorIndex],
      date: date.toISOString().split('T')[0],
      rating: randomRating,
      content: contents[randomContentIndex],
      likes: randomLikes,
      dislikes: randomDislikes,
      images
    });
  }

  return reviews;
};

// 模拟从URL中提取产品ID
const extractProductId = (url: string): string => {
  const matches = url.match(/\/product\/([^/]+)/);
  return matches ? matches[1] : "unknown-product";
};

// 模拟抓取评论数据
export const fetchReviews = (url: string): Promise<{ reviews: Review[], productId: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const productId = extractProductId(url);
      const reviewCount = Math.floor(Math.random() * 30) + 10; // 10-40条评论
      const reviews = generateMockReviews(reviewCount);
      resolve({ reviews, productId });
    }, FETCH_DELAY);
  });
};

// 导出评论为CSV
export const exportToCSV = (reviews: Review[], productId: string): string => {
  const headers = ["ID", "Author", "Date", "Rating", "Content", "Likes", "Dislikes"];
  const csvRows = [headers.join(",")];
  
  for (const review of reviews) {
    const values = [
      review.id,
      `"${review.author.replace(/"/g, '""')}"`,
      review.date,
      review.rating,
      `"${review.content.replace(/"/g, '""')}"`,
      review.likes,
      review.dislikes
    ];
    csvRows.push(values.join(","));
  }
  
  return csvRows.join("\n");
};

// 导出评论为JSON
export const exportToJSON = (reviews: Review[], productId: string): string => {
  return JSON.stringify({ productId, reviews }, null, 2);
};
