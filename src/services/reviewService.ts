
import { Review, PaginatedReviews } from "../types/review";

// 模拟的抓取延迟
const FETCH_DELAY = 1500;

// 每页评论数量
const REVIEWS_PER_PAGE = 10;

// 模拟的总评论数量 (实际情况会根据API返回的数据确定)
const TOTAL_REVIEWS = 500; // 增加到500条，支持更多页数

// 模拟的总页数
const TOTAL_PAGES = Math.ceil(TOTAL_REVIEWS / REVIEWS_PER_PAGE);

// 存储所有生成的评论
let allReviews: Review[] = [];

// 生成随机的评论数据 - 只在第一次调用时生成所有评论
const generateAllMockReviews = (total: number): Review[] => {
  if (allReviews.length > 0) {
    return allReviews;
  }

  const reviews: Review[] = [];
  const authors = ["Александр", "Елена", "Иван", "Ольга", "Дмитрий", "Мария", "Сергей", "Анна", "Николай", "Татьяна", "Виктор", "Наталья"];
  const contents = [
    "Отличный товар! Всем рекомендую.",
    "Качество соответствует цене.",
    "Доставка быстрая, товар хороший.",
    "Не совсем то, что я ожидал, но в целом неплохо.",
    "Очень довольна покупкой!",
    "Хорошее соотношение цены и качества.",
    "Нормальный товар, но есть некоторые недостатки.",
    "Доставили быстро, качество отличное!",
    "Покупаю не первый раз, всегда доволен качеством.",
    "Товар пришел с повреждениями, но это, скорее всего, вина доставки.",
    "Работает как часы, очень хорошая модель.",
    "Очень понравился дизайн и качество исполнения.",
    "Хорошая вещь за свои деньги, рекомендую.",
    "Цена немного завышена для такого качества.",
    "Удобно пользоваться, интуитивно понятно."
  ];

  for (let i = 0; i < total; i++) {
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

  // 按日期排序，最新的在前面
  reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  allReviews = reviews;
  return reviews;
};

// 模拟从URL中提取产品ID
const extractProductId = (url: string): string => {
  const matches = url.match(/\/product\/([^/]+)/);
  return matches ? matches[1] : "unknown-product";
};

// 解析URL中的page参数
const extractPageParam = (url: string): number => {
  const matches = url.match(/[?&]page=(\d+)/);
  return matches ? parseInt(matches[1], 10) : 1;
};

// 解析URL中的page_key参数
const extractPageKeyParam = (url: string): string | undefined => {
  const matches = url.match(/[?&]page_key=([^&]+)/);
  return matches ? matches[1] : undefined;
};

// 模拟抓取评论数据 (支持分页)
export const fetchReviews = (url: string, page: number = 1): Promise<PaginatedReviews> => {
  // 确保总评论已生成
  if (allReviews.length === 0) {
    generateAllMockReviews(TOTAL_REVIEWS);
  }
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const productId = extractProductId(url);
      
      // 计算当前页面应显示的评论
      const startIndex = (page - 1) * REVIEWS_PER_PAGE;
      const endIndex = startIndex + REVIEWS_PER_PAGE;
      const pageReviews = allReviews.slice(startIndex, endIndex);
      
      // 计算总页数
      const totalPages = Math.ceil(allReviews.length / REVIEWS_PER_PAGE);
      
      // 如果我们提取到了page_key，可以用它作为分页标记
      const pageKey = extractPageKeyParam(url);
      
      resolve({
        reviews: pageReviews,
        totalPages: totalPages,
        currentPage: page,
        totalReviews: allReviews.length,
        pageKey: pageKey,
        productId
      });
    }, FETCH_DELAY);
  });
};

// 解析真实Ozon URL中的分页参数
export const parseOzonPaginationParams = (url: string) => {
  return {
    page: extractPageParam(url),
    pageKey: extractPageKeyParam(url)
  };
};

// 构建用于下一页的Ozon URL
export const buildNextPageUrl = (baseUrl: string, nextPage: number, pageKey?: string): string => {
  // 移除现有的分页参数
  let cleanUrl = baseUrl.replace(/[?&]page=\d+/, '').replace(/[?&]page_key=[^&]+/, '');
  
  // 添加新的分页参数
  const separator = cleanUrl.includes('?') ? '&' : '?';
  let nextUrl = `${cleanUrl}${separator}page=${nextPage}`;
  
  // 添加page_key (如果有)
  if (pageKey) {
    nextUrl += `&page_key=${pageKey}`;
  }
  
  return nextUrl;
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
