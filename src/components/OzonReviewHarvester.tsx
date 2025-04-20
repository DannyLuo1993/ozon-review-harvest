
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReloadIcon, DownloadIcon } from '@radix-ui/react-icons';
import { fetchReviews, exportToCSV, exportToJSON, parseOzonPaginationParams } from '@/services/reviewService';
import { Review } from '@/types/review';
import ReviewList from '@/components/ReviewList';
import { useToast } from '@/hooks/use-toast';

const OzonReviewHarvester = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [productId, setProductId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [manualTotalPages, setManualTotalPages] = useState('');
  const { toast } = useToast();

  const isValidOzonUrl = (url: string) => {
    return url.includes('ozon.ru/product/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidOzonUrl(url)) {
      setError('请输入有效的Ozon商品URL');
      return;
    }

    // 重置状态
    setReviews([]);
    setAllReviews([]);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalReviews(0);
    
    // 获取第一页数据
    await fetchPageData(url, 1);
  };

  const fetchPageData = async (baseUrl: string, page: number) => {
    setLoading(true);
    try {
      // 从URL中解析分页参数
      const paginationParams = parseOzonPaginationParams(baseUrl);
      
      // 使用URL中的分页参数或使用指定的页码
      const effectivePage = paginationParams.page || page;
      
      const { 
        reviews: fetchedReviews, 
        totalPages: fetchedTotalPages,
        totalReviews: fetchedTotalReviews,
        productId: fetchedProductId 
      } = await fetchReviews(baseUrl, effectivePage);
      
      setReviews(fetchedReviews);
      setCurrentPage(effectivePage);
      
      // 如果手动设置了总页数，使用手动设置的值
      if (manualTotalPages && parseInt(manualTotalPages) > 0) {
        setTotalPages(parseInt(manualTotalPages));
      } else {
        setTotalPages(fetchedTotalPages);
      }
      
      setTotalReviews(fetchedTotalReviews);
      setProductId(fetchedProductId);
      
      // 添加到所有评论集合
      setAllReviews(prevReviews => {
        // 创建新的评论集合，防止重复
        const newAllReviews = [...prevReviews];
        
        // 将新评论添加到集合中（避免重复）
        fetchedReviews.forEach(review => {
          if (!newAllReviews.some(r => r.id === review.id)) {
            newAllReviews.push(review);
          }
        });
        
        return newAllReviews;
      });
      
      toast({
        title: "抓取成功",
        description: `已获取第 ${effectivePage} 页评论，共 ${manualTotalPages || fetchedTotalPages} 页`,
      });
      
      setLoading(false);
    } catch (err) {
      setError('抓取评论失败，请重试');
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page === currentPage || loading) return;
    fetchPageData(url, page);
  };

  const handleExportCSV = () => {
    if (reviews.length === 0) {
      toast({
        title: "导出失败",
        description: "没有可导出的评论数据",
        variant: "destructive",
      });
      return;
    }

    // 导出所有已获取的评论，而不仅仅是当前页面的评论
    const csvContent = exportToCSV(allReviews, productId);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `ozon-reviews-${productId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "导出成功",
      description: `已导出 ${allReviews.length} 条评论到CSV文件`,
    });
  };

  const handleExportJSON = () => {
    if (reviews.length === 0) {
      toast({
        title: "导出失败",
        description: "没有可导出的评论数据",
        variant: "destructive",
      });
      return;
    }

    // 导出所有已获取的评论，而不仅仅是当前页面的评论
    const jsonContent = exportToJSON(allReviews, productId);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `ozon-reviews-${productId}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "导出成功",
      description: `已导出 ${allReviews.length} 条评论到JSON文件`,
    });
  };

  const fetchAllPages = async () => {
    if (!productId || loading) return;
    
    setLoading(true);
    toast({
      title: "开始批量抓取",
      description: "正在抓取所有页面的评论，请稍等...",
    });
    
    try {
      // 保存已抓取的页面数
      let fetchedPages = 0;
      
      // 使用手动设置的总页数（如果有）
      const actualTotalPages = manualTotalPages && parseInt(manualTotalPages) > 0 
        ? parseInt(manualTotalPages) 
        : totalPages;
      
      // 清空所有评论集合，重新开始
      setAllReviews([]);
      
      // 批量抓取所有页面
      for (let page = 1; page <= actualTotalPages; page++) {
        const { reviews: pageReviews } = await fetchReviews(url, page);
        
        fetchedPages++;
        
        // 更新所有评论集合
        setAllReviews(prevReviews => {
          const newAllReviews = [...prevReviews];
          
          pageReviews.forEach(review => {
            if (!newAllReviews.some(r => r.id === review.id)) {
              newAllReviews.push(review);
            }
          });
          
          return newAllReviews;
        });
        
        // 如果是当前选中的页面，还需要更新显示的评论
        if (page === currentPage) {
          setReviews(pageReviews);
        }
        
        // 更新进度提示
        toast({
          title: "抓取进度",
          description: `已抓取 ${fetchedPages} / ${actualTotalPages} 页评论`,
        });
      }
      
      toast({
        title: "批量抓取完成",
        description: `已成功抓取所有 ${actualTotalPages} 页评论，共 ${allReviews.length} 条`,
      });
    } catch (err) {
      setError('批量抓取评论失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">
        Ozon 评论获取工具
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium">
            Ozon 商品 URL
          </label>
          <Input
            id="url"
            type="url"
            placeholder="https://www.ozon.ru/product/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="manualTotalPages" className="text-sm font-medium">
            手动设置总页数 (可选，不设置将使用自动检测到的页数)
          </label>
          <Input
            id="manualTotalPages"
            type="number"
            min="1"
            placeholder="例如：50"
            value={manualTotalPages}
            onChange={(e) => setManualTotalPages(e.target.value)}
            className="w-full"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              正在获取评论...
            </>
          ) : (
            '获取评论'
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </form>

      {reviews.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold">
                评论数据 ({currentPage}/{totalPages} 页，共 {totalReviews} 条)
              </h2>
              <p className="text-sm text-gray-500">
                当前显示: 第 {currentPage} 页 ({reviews.length} 条) | 已获取: {allReviews.length} 条
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={fetchAllPages} 
                variant="outline" 
                size="sm"
                disabled={loading || totalPages <= 1}
              >
                {loading ? (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                批量抓取所有页面
              </Button>
              <Button 
                onClick={handleExportCSV} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                导出 CSV ({allReviews.length} 条)
              </Button>
              <Button 
                onClick={handleExportJSON} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                导出 JSON ({allReviews.length} 条)
              </Button>
            </div>
          </div>
          
          <ReviewList 
            reviews={reviews} 
            loading={loading} 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {reviews.length === 0 && !loading && (
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>输入Ozon商品URL来下载所有评论。</p>
          <p>示例: https://www.ozon.ru/product/example/reviews/</p>
        </div>
      )}
    </div>
  );
};

export default OzonReviewHarvester;
