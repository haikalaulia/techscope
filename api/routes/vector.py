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
    try:
        data = request.get_json()
        query = data.get("query")

        if not query:
            return jsonify({"error": "Query is required"}), 400

        # Ambil semua hasil dari processing
        category_filter, price_target, processed_query, processed_tokens = process_query_hybrid(query)

        if not processed_query:
            return jsonify({
                "query": query,
                "category_filter": category_filter,
                "price_target": price_target,
                "processed": processed_query,
                "results": [],
                "note": "Kueri hanya berisi stopword."
            })

        if category_filter:
            mask = df["device_type"].str.lower() == category_filter.lower()
            df_filtered = df[mask].reset_index(drop=True)

            # Filter TF-IDF matrix juga (baris sesuai mask)
            tfidf_filtered = tfidf_matrix[df[mask].index]
        else:
            df_filtered = df
            tfidf_filtered = tfidf_matrix

        query_vec = vectorizer.transform([processed_query])
        similarities = cosine_similarity(query_vec, tfidf_filtered).flatten()

        # Ambil top 10
        top_idx = similarities.argsort()[::-1][:10]

        results = []
        for i in top_idx:
            row = df_filtered.iloc[i].to_dict()
            row["similarity"] = float(similarities[i])
            results.append(row)

        return jsonify({
            "query": query,
            "category_filter": category_filter,
            "price_target": price_target,
            "processed": processed_query,
            "processed_tokens": processed_tokens,
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