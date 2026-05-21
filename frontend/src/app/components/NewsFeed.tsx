import { Newspaper, ExternalLink } from 'lucide-react';

interface NewsItem {
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: number;
}

export default function NewsFeed({ data }: { data: NewsItem[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <Newspaper className="w-5 h-5 text-indigo-400" />
        <h3 className="text-xl font-bold text-white">Recent News</h3>
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => (
          <a 
            key={index} 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block group bg-neutral-950/30 border border-neutral-800/50 rounded-xl p-4 hover:border-indigo-500/30 hover:bg-neutral-800/50 transition-all"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h4 className="text-neutral-200 font-medium leading-snug group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                  <span className="font-semibold">{item.publisher}</span>
                  <span>•</span>
                  <span>{new Date(item.providerPublishTime * 1000).toLocaleDateString()}</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-neutral-600 group-hover:text-indigo-400 flex-shrink-0" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
