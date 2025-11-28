from flask import request, jsonify
from app import app
from sklearn.metrics.pairwise import cosine_similarity
from config import df, tfidf_matrix, vectorizer
from utils.preprocessing import process_query_hybrid 
from sklearn.metrics import precision_score, recall_score, f1_score


@app.route("/", methods=["GET"])
def home():
    """Endpoint status API."""
    return {"status": "Search Engine API Running"}


@app.route("/predict", methods=["POST"])
def predict_tfidf():
    """
    Endpoint prediksi menggunakan TF-IDF Cosine Similarity murni.
    Menggunakan prosesor kueri yang sudah diperbaiki (process_query_hybrid) 
    untuk menghasilkan kueri yang bersih dan siap di-ranking.
    """
    try:
        data = request.get_json()
        query = data.get("query")

        if not query:
            return jsonify({"error": "Query is required"}), 400

        # --- PERBAIKAN: Menggunakan pipeline kueri yang sudah diperbaiki ---
        # category, price_target, ranked_query_stem, query_tokens
        _, _, processed_query, _ = process_query_hybrid(query)
        # ----------------------------------------------------

        if not processed_query:
            return jsonify({
                "query": query,
                "processed": processed_query,
                "results": [],
                "note": "Kueri hanya mengandung kata fungsional/stopword setelah diproses."
            })


        # Transformasi kueri ke vektor TF-IDF
        query_vec = vectorizer.transform([processed_query])

        # Hitung Cosine Similarity
        similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()

        # Ambil 10 hasil teratas
        top_idx = similarities.argsort()[::-1][:10]

        results = []
        for i in top_idx:
            row = df.iloc[i].to_dict()
            row["similarity"] = float(similarities[i])
            results.append(row)

        return jsonify({
            "query": query,
            "processed": processed_query,
            "results": results
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/evaluate", methods=["POST"])
def evaluate():
    try:
        data = request.json
        y_true = data.get("y_true")
        y_pred = data.get("y_pred")

        if not y_true or not y_pred:
             return jsonify({"error": "y_true and y_pred lists are required"}), 400

        return jsonify({
            "precision": precision_score(y_true, y_pred, average="macro"),
            "recall": recall_score(y_true, y_pred, average="macro"),
            "f1": f1_score(y_true, y_pred, average="macro")
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500