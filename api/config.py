import pandas as pd
import pickle
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_PATH = os.path.join(BASE_DIR, "./model/devices_df.csv")
VEC_PATH = os.path.join(BASE_DIR, "./model/tfidf_vectorizer.pkl")
TFIDF_MAT_PATH = os.path.join(BASE_DIR, "./model/tfidf_matrix.pkl")
JACCARD_TOKENS_PATH = os.path.join(BASE_DIR, "./model/jaccard_tokens.pkl")

df = pd.read_csv(DATA_PATH)
vectorizer = pickle.load(open(VEC_PATH, "rb"))
tfidf_matrix = pickle.load(open(TFIDF_MAT_PATH, "rb"))
jaccard_tokens = pickle.load(open(JACCARD_TOKENS_PATH, "rb"))