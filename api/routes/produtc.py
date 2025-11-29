from flask import jsonify
from app import app
from config import df  

@app.route("/detail/<string:item_id>", methods=["GET"])
def get_detail(item_id):
    try:
       
        item = df[df["id"].astype(str) == str(item_id)]

        if item.empty:
            return jsonify({
                "success": False,
                "message": "Item not found"
            }), 404

        result = item.iloc[0].to_dict()

        return jsonify({
            "success": True,
            "data": result
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500