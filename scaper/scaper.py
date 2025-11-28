from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import csv
import re

# =======================
# CONFIG CHROME DRIVER
# =======================
chrome_options = Options()
chrome_options.add_argument("--headless=new")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--start-maximized")
chrome_options.add_argument("--window-size=1920,3000")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--disable-blink-features=AutomationControlled")
chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
chrome_options.add_experimental_option('useAutomationExtension', False)

driver = webdriver.Chrome(options=chrome_options)
wait = WebDriverWait(driver, 15)

# =========================
# START URL LIST HP
# =========================
START_URL = "https://www.bhinneka.com/jual-phone/b1ZX2EL?page=1"

# =====================================================================
# ======================= SUPPORT FUNCTIONS ============================
# =====================================================================

def decode_image_url(img_src):
    if not img_src: return None
    return img_src

def extract_brand_model(title):
    if not title: return None, None
    parts = title.split()
    brand = parts[0]
    model = " ".join(parts[1:]) if len(parts) > 1 else ""
    return brand, model

def generate_tags(title, brand, processor=None):
    tags = ["handphone", "smartphone"]
    if brand: tags.append(brand.lower())
    if title:
        t = title.lower()
        for k in ["5g", "pro", "max", "plus"]:
            if k in t:
                tags.append(k)
    return ", ".join(dict.fromkeys(tags))

# =====================================================================
# ======================= PARSE DETAIL PRODUK ==========================
# =====================================================================

def parse_product_page(url):
    try:
        driver.get(url)
        time.sleep(2)
        data = {}

        # Title
        try:
            title = wait.until(EC.presence_of_element_located(
                (By.CSS_SELECTOR, "h1.product-name")
            )).text.strip()
        except:
            title = None

        data["title"] = title
        data["brand"], data["model"] = extract_brand_model(title)

        # Image
        try:
            img_tag = driver.find_element(By.CSS_SELECTOR, "img.product-main-image")
            data["image"] = decode_image_url(img_tag.get_attribute("src"))
        except:
            data["image"] = None

        # Harga
        try:
            price_elem = driver.find_element(By.CSS_SELECTOR, "span.price")
            data["harga"] = price_elem.text.strip()
        except:
            data["harga"] = None

        # Deskripsi
        try:
            desc_elem = driver.find_element(By.CSS_SELECTOR, "div.product-description")
            data["content"] = re.sub(r'\s+', ' ', desc_elem.text.strip())
        except:
            data["content"] = None

        # Spesifikasi
        specs = {}
        try:
            spec_rows = driver.find_elements(By.CSS_SELECTOR, "table.specification-table tr")
            for row in spec_rows:
                try:
                    key = row.find_element(By.TAG_NAME, "th").text.strip().lower()
                    value = row.find_element(By.TAG_NAME, "td").text.strip()
                    specs[key] = value
                except:
                    continue
        except:
            pass

        data["processor"] = specs.get("processor") or specs.get("prosesor")
        data["ram"] = specs.get("ram")
        data["storage"] = specs.get("internal memory") or specs.get("storage")
        data["display"] = specs.get("display") or specs.get("layar")
        data["camera"] = specs.get("camera") or specs.get("kamera")
        data["battery"] = specs.get("battery") or specs.get("baterai")
        data["os"] = specs.get("os") or specs.get("sistem operasi")

        data["device_type"] = "Handphone"
        data["tanggal_rilis"] = ""
        data["penulis"] = ""
        data["tags"] = generate_tags(title, data["brand"], data["processor"])
        data["source_url"] = url

        return data

    except Exception as e:
        print(f"  ✗ Error parsing product: {e}")
        return None

# =====================================================================
# ======================= MAIN SCRAPER LIST ============================
# =====================================================================

def main_bhinneka():
    print("🚀 Starting Bhinneka Scraper")
    csv_file = "bhinneka_phones.csv"

    fields = [
        "id", "title", "image", "content", "device_type", "brand", "model",
        "processor", "ram", "storage", "display", "camera", "battery", "os",
        "harga", "tanggal_rilis", "penulis", "tags", "source_url"
    ]

    with open(csv_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()

        product_id = 1
        page_number = 1

        while True:
            print(f"\n📌 PROCESSING LIST PAGE {page_number}")
            driver.get(f"https://www.bhinneka.com/jual-phone/b1ZX2EL?page={page_number}")
            time.sleep(3)

            try:
                products = driver.find_elements(By.CSS_SELECTOR, "div.product-item a.product-link")
                if not products:
                    print("⚠ No more products, stop.")
                    break

                links = [p.get_attribute("href") for p in products if p.get_attribute("href")]
            except:
                print("⚠ Error getting product links")
                break

            for idx, link in enumerate(links, 1):
                print(f"[{product_id}] Scraping: {link}")
                data = parse_product_page(link)
                if data:
                    data["id"] = f"01{product_id}"
                    writer.writerow(data)
                    print(f"  ✓ Saved: {data.get('title', 'N/A')}")
                    product_id += 1
                time.sleep(1)

            page_number += 1
            # Stop jika tombol next tidak ada / last page
            try:
                next_btn = driver.find_element(By.CSS_SELECTOR, "a.next")
                classes = next_btn.get_attribute("class")
                if "disabled" in classes:
                    break
            except:
                break

    driver.quit()
    print(f"\n✅ Bhinneka Scraping Completed! Output: {csv_file}")


if __name__ == "__main__":
    main_bhinneka()
