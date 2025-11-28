import re
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory

STEMMER = StemmerFactory().create_stemmer()

# --- FUNGSI JACCARD ---
def jaccard_similarity(tokens1, tokens2):
    """Menghitung skor Jaccard antara dua set token."""
    set1 = set(tokens1)
    set2 = set(tokens2)
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    return intersection / union if union != 0 else 0

# --- FUNGSI EKSTRAKSI KUERI YANG SUDAH DIPERBAIKI ---
def process_query_hybrid(query):
    """
    Ekstraksi kategori, harga, dan stemming kueri. 
    Mengandung perbaikan untuk menghindari stemming yang salah ('berikan' -> 'ikan').
    """
    processed_query = str(query).lower()
    
    # Kategori Kritis
    category_map = {"laptop": "Laptop", "tablet": "Tablet", "hp": "Handphone", "smartphone": "Handphone"}
    critical_category = None
    for keyword, category in category_map.items():
        if keyword in processed_query:
            critical_category = category
            # Hapus kata kunci kategori agar tidak merusak stemming sisa kueri
            processed_query = processed_query.replace(keyword, "")
            break
            
    # Ekstraksi Harga Numerik
    price_target = None
    match = re.search(r'(\d+)\s*(?:jt|juta)', processed_query)
    if match:
        price_target = int(match.group(1)) * 1000000
        # Hapus kata kunci harga dari kueri yang diranking
        processed_query = re.sub(r'(\d+)\s*(?:jt|juta)', '', processed_query).strip()
    
    # DAFTAR PENGECUALIAN TAMBAHAN KRITIS (SOLUSI UNTUK MENGHINDARI 'IKAN')
    stop_words_tambahan = set([
        "yang", "dong", "di", "pake", "buat", "saran", "dengan", "dan", 
        "untuk", "berikan", "kasih", "adalah", "punya", "cari" 
    ])

    # Tokenisasi dan Stemming Kueri Sisa
    words = processed_query.split()
    
    query_tokens = []
    for word in words:
        if word not in stop_words_tambahan:
            # Lakukan stemming hanya pada kata yang tidak termasuk pengecualian
            stemmed_word = STEMMER.stem(word)
            query_tokens.append(stemmed_word)
            
    # Kueri yang sudah di-stem dan dibersihkan, siap untuk TF-IDF
    ranked_query_stem = " ".join(query_tokens).strip()

    return critical_category, price_target, ranked_query_stem, query_tokens