from flask import request, jsonify
from app import app
from config import df, tfidf_matrix, vectorizer, jaccard_tokens
from utils.preprocessing import jaccard_similarity, process_query_hybrid
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

        # Proses query → category, price target, stemmed query, tokens
        category, price_target, ranked_query_stem, query_tokens = process_query_hybrid(query)

        df_filtered = df.copy()

        # Filter kategori
        if category:
            df_filtered = df_filtered[df_filtered["device_type"] == category]

        # Filter harga ± tolerance
        if price_target and "harga_num" in df_filtered.columns:
            min_price = price_target - PRICE_TOLERANCE_RP
            max_price = price_target + PRICE_TOLERANCE_RP
            df_filtered = df_filtered[
                (df_filtered["harga_num"] >= min_price)
                & (df_filtered["harga_num"] <= max_price)
            ]

        # Jika kosong setelah filter
        if df_filtered.empty:
            return jsonify({
                "query": query,
                "processed": ranked_query_stem,
                "results": [],
                "note": "Tidak ditemukan produk yang lolos filter Kategori dan/atau Harga."
            })

        filtered_indices = df_filtered.index

        # Hitung TF-IDF similarity
        if ranked_query_stem:
            filtered_tfidf = tfidf_matrix[filtered_indices]
            query_vec = vectorizer.transform([ranked_query_stem])
            tfidf_sim = cosine_similarity(query_vec, filtered_tfidf).flatten()
            df_filtered["tfidf_score"] = tfidf_sim
        else:
            df_filtered["tfidf_score"] = 0.0

        # Hitung Jaccard similarity
        filtered_jaccard_tokens = [jaccard_tokens[i] for i in filtered_indices]
        jaccard_scores = [
            jaccard_similarity(query_tokens, doc_tokens)
            for doc_tokens in filtered_jaccard_tokens
        ]
        df_filtered["jaccard_score"] = jaccard_scores

        # Hybrid score
        df_filtered["final_similarity"] = (
            df_filtered["tfidf_score"] * (1 - JACCARD_WEIGHT)
            + df_filtered["jaccard_score"] * JACCARD_WEIGHT
        )

        # Ambil top-N hasil
        results = df_filtered.sort_values(by="final_similarity", ascending=False).head(top_n)

        # Return semua field + skor similarity
        final_results = []
        for _, row in results.iterrows():
            row_data = row.to_dict()

            row_data["final_similarity"] = float(row["final_similarity"])
            row_data["tfidf_score"] = float(row["tfidf_score"])
            row_data["jaccard_score"] = float(row["jaccard_score"])

            final_results.append(row_data)

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
