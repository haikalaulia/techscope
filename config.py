# config.py
SEEDS = [
    "https://www.bhinneka.com/jual-laptop-notebook/y81WyE6",
    "https://laptopmedia.com/all-laptop-series/"
]

# Configuration lainnya
MAX_URLS = 5
MAX_CONCURRENT_TASKS = 50
PER_DOMAIN_DELAY = 1.0
REQUEST_TIMEOUT = 30
MAX_RETRIES = 3

KEYWORD_FILTER = [
    "laptop", "notebook", "tablet", "smartphone", "handphone", "hp", "phone",
    "spesifikasi", "spec", "review", "harga", "price", "beli", "jual",
    "processor", "ram", "storage", "battery", "display", "layar",
    "android", "ios", "windows", "macbook", "iphone", "samsung",
    "xiaomi", "oppo", "vivo", "realme", "asus", "lenovo", "dell", "hp",
    "gaming", "flagship", "budget", "midrange"
]

ALLOWED_DOMAINS = [
    "laptopmedia.com","bhinneka.com"
]