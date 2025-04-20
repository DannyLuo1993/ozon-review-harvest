
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReloadIcon, DownloadIcon } from '@radix-ui/react-icons';
import { fetchReviews, exportToCSV, exportToJSON } from '@/services/reviewService';
import { Review } from '@/types/review';
import ReviewList from '@/components/ReviewList';
import { useToast } from '@/hooks/use-toast';

const OzonReviewHarvester = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [productId, setProductId] = useState('');
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

    setLoading(true);
    try {
      const { reviews: fetchedReviews, productId: fetchedProductId } = await fetchReviews(url);
      setReviews(fetchedReviews);
      setProductId(fetchedProductId);
      toast({
        title: "抓取成功",
        description: `已成功获取 ${fetchedReviews.length} 条评论`,
      });
      setLoading(false);
    } catch (err) {
      setError('抓取评论失败，请重试');
      setLoading(false);
    }
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

    const csvContent = exportToCSV(reviews, productId);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ozon-reviews-${productId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "导出成功",
      description: "已导出CSV文件",
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

    const jsonContent = exportToJSON(reviews, productId);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ozon-reviews-${productId}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "导出成功",
      description: "已导出JSON文件",
    });
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
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              评论数据 ({reviews.length})
            </h2>
            <div className="flex space-x-3">
              <Button 
                onClick={handleExportCSV} 
                variant="outline" 
                size="sm"
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                导出 CSV
              </Button>
              <Button 
                onClick={handleExportJSON} 
                variant="outline" 
                size="sm"
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                导出 JSON
              </Button>
            </div>
          </div>
          <ReviewList reviews={reviews} loading={loading} />
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
