export interface WikipediaArticle {
  id: number;
  title: string;
  extract: string;
  articleUrl: string;
  thumbnailUrl: string | null;
  imageCreditUrl: string | null;
}

export interface WikipediaSearchResponse {
  articles: WikipediaArticle[];
}
