export interface SearchHistory {
  id: string;
  userId: string;
  query: string;
  processedQuery: string;
  resultsJson: Record<string, any>;
  createdAt: Date;
}

export interface CreateSearchHistory {
  userId: string;
  query: string;
  processedQuery: string;
  resultsJson: Record<string, any>;
}

export interface SearchHistoryResponse {
  id: string;
  userId: string;
  query: string;
  processedQuery: string;
  resultsJson: Record<string, any>;
  createdAt: Date;
}

export interface GetSearchHistoryQuery {
  userId: string;
  limit?: number;
  offset?: number;
}
