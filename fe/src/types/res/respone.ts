export interface ResultRespone {
  battery?: string | null;
  brand?: string | null;
  camera?: string | null;
  combined_text_final?: string | null;
  content?: string | null;
  device_type?: string | null;
  display?: string | null;
  harga_num?: number | null;
  id?: number | null;
  image?: string | null;
  model?: string | null;
  os?: string | null;
  penulis?: string | null;
  processor?: string | null;
  ram?: string | null;
  similarity?: number | null;
  source_url?: string | null;
  storage?: string | null;
  tags?: string | null;
  tanggal_rilis?: string | null;
  title?: string | null;
  final_similarity?: number | null;
  tfidf_score?: number | null;
  jaccard_score?: number | null;
}

export interface hybridsRespone {
  category_filter: string;
  price_target: number | null;
  processed: string;
  query: string;
  results: ResultRespone[];
}

export interface jaccardRespon {
  category_filter: string;
  price_target: number | null;
  processed: string;
  processed_tokens: string;
  query: string;
  results: ResultRespone[];
}

export interface TFIDFRespon {
  category_filter: string;
  price_target: number | null;
  processed: string;
  processed_tokens: string;
  query: string;
  results: ResultRespone[];
}

export type SearchRespone = hybridsRespone | jaccardRespon | TFIDFRespon;

export interface ResponseProduct {
  battery: string | null;
  brand: string;
  camera: string;
  combined_text_final: string;
  content: string;
  device_type: string;
  display: string;
  harga: string;
  harga_num: number;
  id: number;
  image: string;
  model: string;
  os: string;
  penulis: string | null;
  processor: string;
  ram: string;
  source_url: string;
  storage: string;
  tags: string;
  tanggal_rilis: string | null;
  title: string;
}
