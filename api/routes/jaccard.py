from flask import request, jsonify
from app import app

from config import df, jaccard_tokens
from utils.preprocessing import jaccard_similarity, process_query_hybrid


@app.route("/predict_jaccard", methods=["POST"])
@app.route("/predict_jaccard", methods=["POST"])
def predict_jaccard():
    try:
        data = request.get_json()
        query = data.get("query")

        if not query:
            return jsonify({"error": "Query is required"}), 400

        # Ambil seluruh output
        category_filter, price_target, ranked_query_stem, processed_query_tokens = process_query_hybrid(query)

        # Jika token kosong
        if not processed_query_tokens:
            return jsonify({
                "query": query,
                "category_filter": category_filter,
                "price_target": price_target,
                "processed_tokens": [],
                "results": [],
                "note": "Kueri hanya mengandung stopword atau kata fungsional."
            })

        if category_filter:
            mask = df["device_type"].str.lower() == category_filter.lower()
            df_filtered = df[mask].reset_index(drop=True)
            jaccard_filtered = [jaccard_tokens[i] for i in df[mask].index]
        else:
            df_filtered = df
            jaccard_filtered = jaccard_tokens

        scores = []
        for idx, tokens in enumerate(jaccard_filtered):
            sim = jaccard_similarity(processed_query_tokens, tokens)
            scores.append((idx, sim))

        # Ranking top 10
        scores = sorted(scores, key=lambda x: x[1], reverse=True)[:10]

        # Susun hasil return
        results = []
        for idx, score in scores:
            row = df_filtered.iloc[idx].to_dict()
            row["similarity"] = float(score)
            results.append(row)

        return jsonify({
            "query": query,
            "category_filter": category_filter,
            "price_target": price_target,
            "processed": ranked_query_stem,
            "processed_tokens": processed_query_tokens,
            "results": results
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
