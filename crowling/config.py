# config_gsmarena_focus.py
# Dibuat untuk memprioritaskan crawling pada GSM Arena dan perangkat Handphone/Tablet.

## Konfigurasi Utama
# Tingkatkan batas URL jika Anda ingin crawling dalam skala besar
MAX_URLS = 250_000
MAX_CONCURRENT_TASKS = 50
PER_DOMAIN_DELAY = 1.0
REQUEST_TIMEOUT = 20
MAX_RETRIES = 2

# Filter Domain
# Hanya izinkan domain yang sangat relevan dengan Handphone/Tablet/Review
ALLOWED_DOMAINS = [
    # Prioritas Utama (GSM Arena & Kompetitor Utama)
    "gsmarena.com", 
    "phonearena.com", 
    
    # Reviewer Handphone/Tablet
    "androidauthority.com", "cnet.com", "theverge.com", "pcmag.com",
    "trustedreviews.com", "tomsguide.com", "techradar.com", 
    
    # Produsen Utama (Smartphone/Tablet)
    "apple.com", "samsung.com", "xiaomi.com", "oppo.com", "vivo.com",
    "realme.com", "oneplus.com", "google.com", 
    
    # Forum Utama
    "forum.xda-developers.com", "reddit.com", "kaskus.co.id",
    
    # Berita Teknologi Umum Indonesia (dengan filter keyword yang kuat)
    "tekno.kompas.com", "inet.detik.com", "dailysocial.id",
]

## Seed URLs (Hanya URL Awal)
# Fokuskan SEEDS pada kategori Handphone dan Tablet, terutama GSM Arena.
SEEDS = [
    # PRIORITAS TERTINGGI: GSM Arena (Home & Kategori HP)
    "https://www.gsmarena.com/",
    "https://www.gsmarena.com/res.php3", # Review (res)
    "https://www.gsmarena.com/makers.php3", # Manufacturers (makers)
    "https://www.gsmarena.com/sitemap.php", # Sitemap
    "https://www.gsmarena.com/glossary.php3", # Glossary (untuk spesifikasi)
    
    # Kategori Smartphone dan Tablet Lainnya
    "https://www.phonearena.com/",
    "https://www.apple.com/iphone/",
    "https://www.apple.com/ipad/",
    "https://www.samsung.com/id/smartphones/",
    "https://www.samsung.com/id/tablets/",
    "https://www.xiaomi.com/id/",
    "https://www.oppo.com/id/",
    "https://www.vivo.com/id/",
    "https://www.realme.com/id/",
    
    # URL Review/Berita Smartphone/Tablet Global
    "https://www.techradar.com/news/phone-and-communications/mobile-phones",
    "https://www.tomsguide.com/topic/smartphones",
    "https://www.cnet.com/reviews/phones/",
    "https://www.theverge.com/phones",
]

## Filter Kata Kunci
# Fokuskan filter pada spesifikasi dan nama produk Handphone/Tablet.
KEYWORD_FILTER = [
    # Perangkat
    "smartphone", "handphone", "hp", "phone", "mobile", "cellphone", "tablet", "ipad", "galaxy tab",
    "surface pro", "xiaomi pad", "tab",
    
    # Brand/Model Utama
    "samsung galaxy", "iphone", "xiaomi", "oppo", "vivo", "realme", "oneplus",
    "snapdragon", "mediatek", "exynos", "apple a series", "processor", "chipset",
    
    # Spesifikasi
    "ram", "storage", "internal memory", "camera", "megapixel", "display", 
    "screen", "amoled", "oled", "ips lcd", "refresh rate", "battery", 
    "fast charging", "wireless charging", "5g", "4g", "fingerprint", 
    "spesifikasi", "spec", "specification", "review", "ulasan", "harga"
]