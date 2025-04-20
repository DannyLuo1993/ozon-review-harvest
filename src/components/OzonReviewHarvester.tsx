
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReloadIcon } from '@radix-ui/react-icons';

const OzonReviewHarvester = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidOzonUrl = (url: string) => {
    return url.includes('ozon.ru/product/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidOzonUrl(url)) {
      setError('Please enter a valid Ozon product URL');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement review fetching logic here
      // This will need to be implemented in a backend service
      // as it requires handling CORS and proper request handling
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch reviews. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">
        Ozon Review Harvester
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium">
            Ozon Product URL
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
              Fetching Reviews...
            </>
          ) : (
            'Fetch Reviews'
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </form>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Enter an Ozon product URL to download all reviews.</p>
        <p>Example: https://www.ozon.ru/product/example/reviews/</p>
      </div>
    </div>
  );
};

export default OzonReviewHarvester;
