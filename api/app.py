from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

from routes.jaccard import *
from routes.vector import *
from routes.search  import *
from routes.produtc import * 

if __name__ == "__main__":
    app.run(port=5001, debug=True)
