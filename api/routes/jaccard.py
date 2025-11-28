from flask import request, jsonify
from app import app
# Import konfigurasi data
from config import df, jaccard_tokens
# Import fungsi preprocessing dan jaccard_similarity yang sudah diperbaiki
from utils.preprocessing import jaccard_similarity, process_query_hybrid
import re

# Catatan: Fungsi preprocessing dan stemmer yang terpusat (casefold, cleaning, dll.)
# sekarang diimpor via 'utils.preprocessing' agar konsisten dan mengatasi bug stemming.

@app.route("/predict_jaccard", methods=["POST"])
def predict_jaccard():
    try:
        data = request.get_json()
        query = data.get("query")

        if not query:
            return jsonify({"error": "Query is required"}), 400

        # --- PERBAIKAN: Menggunakan pipeline yang terpusat dan diperbaiki ---
        # Kita ambil saja query_tokens untuk perhitungan Jaccard.
        # Catatan: Endpoint ini tidak melakukan filtering harga/kategori secara ketat, 
        # berbeda dengan endpoint /search yang sudah hybrid.
        
        # category, price_target, ranked_query_stem, query_tokens
        _, _, _, processed_query_tokens = process_query_hybrid(query)
        # ------------------------------------------------------------------

        if not processed_query_tokens:
             return jsonify({
                "query": query,
                "processed_tokens": [],
                "results": [],
                "note": "Kueri hanya mengandung stopword atau kata fungsional."
            })

        scores = []
        # Mengasumsikan jaccard_tokens sudah selaras dengan index df
        for idx, tokens in enumerate(jaccard_tokens):
            sim = jaccard_similarity(processed_query_tokens, tokens)
            scores.append((idx, sim))

        # Urutkan berdasarkan skor Jaccard
        scores = sorted(scores, key=lambda x: x[1], reverse=True)[:10]

        results = []
        for idx, score in scores:
            row = df.iloc[idx].to_dict()
            row["similarity"] = float(score)
            results.append(row)

        return jsonify({
            "query": query,
            "processed_tokens": processed_query_tokens,
            "results": results
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500