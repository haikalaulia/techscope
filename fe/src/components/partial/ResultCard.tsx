import Image from "next/image";
import Link from "next/link";

import { ResultRespone } from "@/types/res/respone";

import { Card } from "../ui/card";

export interface ResultCardPros {
  item: ResultRespone;
}

const ResultCard: React.FC<ResultCardPros> = ({ item }) => {
  return (
    <Card
      className="
        group relative bg-white/5 backdrop-blur-xl rounded-xl shadow-md
        hover:shadow-xl  transition-all duration-300
        border border-gray-500 overflow-hidden cursor-pointer
        flex flex-col h-full max-w-sm mx-auto
      "
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none">
        <div className="absolute -inset-1 bg-linear-to-r from-blue-500/10 to-purple-500/10 blur-xl"></div>
      </div>
      <div className="relative w-full h-36  overflow-hidden flex items-center justify-center">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title || "image"}
            width={140}
            height={140}
            className="object-contain transition-all duration-300 rounded-lg "
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <div className="text-4xl mb-1">📱</div>
            <p className="text-xs">No Image</p>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {item.brand && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full">
              {item.brand}
            </span>
          )}

          {item.similarity !== undefined && (
            <span className="px-2 py-1 bg-purple-50 text-purple-700 text-sm font-semibold rounded-full">
              {Math.max(item.similarity! * 100, 0.1).toFixed(1)}%
            </span>
          )}

          {item.final_similarity !== undefined && (
            <span className="px-2 py-1 bg-purple-50 text-purple-700 text-sm font-semibold rounded-full">
              Final: {Math.max(item.final_similarity! * 100, 0.1).toFixed(1)}%
            </span>
          )}

          {item.tfidf_score !== undefined && (
            <span className="px-2 py-1 bg-green-50 text-green-700 text-sm font-semibold rounded-full">
              TF-IDF: {Math.max(item.tfidf_score! * 100, 0.1).toFixed(1)}%
            </span>
          )}

          {item.jaccard_score !== undefined && (
            <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-sm font-semibold rounded-full">
              Jaccard: {Math.max(item.jaccard_score! * 100, 0.1).toFixed(1)}%
            </span>
          )}
        </div>

        <h2 className="font-bold text-base line-clamp-2 text-white mb-1 group-hover:text-blue-600">
          {item.title}
        </h2>

        <p className="text-xs text-white/80 mb-2">{item.model || "-"}</p>

        <div className="text-xs text-white space-y-1 mb-3">
          {item.processor && <div>⚡ Processor: {item.processor}</div>}
          {item.ram && <div>💾 RAM: {item.ram}</div>}
          {item.storage && <div>📦 Storage: {item.storage}</div>}
          {item.camera && <div>📸 Kamera: {item.camera}</div>}
          {item.battery && <div>🔋 Baterai: {item.battery}</div>}
        </div>

        {item.harga_num && (
          <p className="font-extrabold text-xl text-green-600 mb-4">
            Rp {item.harga_num.toLocaleString("id-ID")}
          </p>
        )}

        <Link
          href={`/home/products/${item.id}`}
          rel="noopener noreferrer"
          className="
      mt-auto w-full py-2 text-center rounded-lg
      bg-blue-600 text-white text-sm font-semibold
      hover:bg-blue-700 transition-all
    "
        >
          Lihat Produk
        </Link>
      </div>
    </Card>
  );
};

export default ResultCard;
