from flask import request, jsonify
from app import app
from config import df, tfidf_matrix, vectorizer, jaccard_tokens
from utils.preprocessing import jaccard_similarity,process_query_hybrid
from sklearn.metrics.pairwise import cosine_similarity

JACCARD_WEIGHT = 0.3
PRICE_TOLERANCE_RP = 700000 


@app.route("/search", methods=["POST"])
def hybrid_search_endpoint():
    try:
        data = request.get_json()
        query = data.get("query")
        top_n = data.get("top_n", 5)

        if not query:
            return jsonify({"error": "Query is required"}), 400

        category, price_target, ranked_query_stem, query_tokens = process_query_hybrid(query)

        df_filtered = df.copy()
        
       
        if category:
            df_filtered = df_filtered[df_filtered['device_type'] == category]
            
      
        if price_target and 'harga_num' in df_filtered.columns:
            min_price = price_target - PRICE_TOLERANCE_RP
            max_price = price_target + PRICE_TOLERANCE_RP
            df_filtered = df_filtered[
                (df_filtered['harga_num'] >= min_price) & 
                (df_filtered['harga_num'] <= max_price)
            ]
        
        if df_filtered.empty:
            return jsonify({
                "query": query,
                "processed": ranked_query_stem,
                "results": [],
                "note": "Tidak ditemukan produk yang lolos filter Kategori dan/atau Harga."
            })

      
        filtered_indices = df_filtered.index 
        
     
        if ranked_query_stem:
            filtered_tfidf_matrix = tfidf_matrix[filtered_indices]
            query_vec = vectorizer.transform([ranked_query_stem])
            tfidf_sim = cosine_similarity(query_vec, filtered_tfidf_matrix).flatten()
            df_filtered['tfidf_score'] = tfidf_sim
        else:
            df_filtered['tfidf_score'] = 0.0

       
        filtered_jaccard_tokens = [jaccard_tokens[i] for i in filtered_indices]
        jaccard_scores = [jaccard_similarity(query_tokens, doc_tokens) for doc_tokens in filtered_jaccard_tokens]
        df_filtered['jaccard_score'] = jaccard_scores

       
        df_filtered['final_similarity'] = (df_filtered['tfidf_score'] * (1 - JACCARD_WEIGHT)) + \
                                          (df_filtered['jaccard_score'] * JACCARD_WEIGHT)
        
       
        results = df_filtered.sort_values(by='final_similarity', ascending=False).head(top_n)
        
        final_results = []
        for i, row in results.iterrows():
            row_dict = row.to_dict()
            
            final_results.append({
                "title": row_dict.get('title'),
                "brand": row_dict.get('brand'),
                "device_type": row_dict.get('device_type'),
                "harga": row_dict.get('harga'),
                "processor": row_dict.get('processor'),
                "ram": row_dict.get('ram'),
                "storage": row_dict.get('storage'),
                "final_similarity": float(row_dict['final_similarity']),
                "tfidf_score": float(row_dict['tfidf_score']),
                "jaccard_score": float(row_dict['jaccard_score']),
            })


        return jsonify({
            "query": query,
            "processed": ranked_query_stem,
            "category_filter": category,
            "price_target": price_target,
            "results": final_results
        })

    except Exception as e:
      
        print(f"Error in hybrid_search_endpoint: {e}")
        return jsonify({"error": "Internal Server Error", "detail": str(e)}), 500