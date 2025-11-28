import csv

input_file = "merged_crawling.csv"
output_file = "clean_merge.csv"

seen_ids = set()  # untuk mendeteksi ID duplikat

with open(input_file, mode="r", newline="", encoding="utf-8") as infile, \
     open(output_file, mode="w", newline="", encoding="utf-8") as outfile:
    
    reader = csv.reader(infile)
    writer = csv.writer(outfile)

    header = next(reader)   # header: id,source_url,found_at,status
    writer.writerow(header)

    for row in reader:
        id_value = row[0]
        source_url = row[1].lower()  # lowercase biar mudah filter

        # 1. DROP jika ID duplikat
        if id_value in seen_ids:
            continue
        seen_ids.add(id_value)

        # 2. DROP jika mengandung "edu"
        if "edu" in source_url:
            continue

        # 3. DROP jika mengandung "github.com"
        if "github.com" in source_url:
            continue

        if "merdeka.com" in source_url:
            continue

        if "antaranews" in source_url:
            continue

        if "liputan6" in source_url:
            continue

        if "jakarta.viva" in source_url:
            continue

        if "forums" in source_url:
            continue

        # 4. Replace academia.edu jika masih ada (harusnya tidak karena sudah ter-drop)
        row[1] = row[1].replace("https://academia.edu/", "")

        writer.writerow(row)

print("Selesai! File telah dibersihkan dan disimpan sebagai:", output_file)
