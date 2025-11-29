"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import BackgroundMemo from "@/core/components/background-memo";
import { ResponseProduct } from "@/types/res/respone";

interface DetailProductProps {
  data: ResponseProduct;
}

const DetailHeroSection: React.FC<DetailProductProps> = ({ data }) => {
  const router = useRouter();

  return (
    <view className="w-full h-full overflow-x-hidden">
      <div className="w-full min-h-screen flex justify-center items-center relative">
        <div className="absolute top-35 left-4 z-10">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
          >
            Back
          </button>
        </div>

        <div className="absolute z-[-1] w-full h-full">
          <BackgroundMemo />
        </div>

        <div className="md:w-1/2 flex justify-center items-center flex-col">
          <Image
            src={data.image ?? ""}
            alt={data.title ?? "product image"}
            className="rounded-2xl shadow-lg object-cover"
            width={500}
            height={500}
          />
          <h1 className="text-3xl font-bold">
            {data.title?.split(" ").slice(0, 8).join(" ")}
            {data.title?.split(" ").length > 8 ? "..." : ""}
          </h1>
        </div>

        <div className="md:w-1/2 flex flex-col gap-4">
          <p className="text-lg text-white/90 font-medium">
            {data.brand ?? ""}
          </p>
          <p className="text-2xl font-semibold text-indigo-600">
            {data.harga ?? ""}
          </p>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-gray-500 font-medium">RAM</p>
              <p className="text-white/90">{data.ram ?? ""}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Storage</p>
              <p className="text-white/90">{data.storage ?? ""}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Processor</p>
              <p className="text-white/90">{data.processor ?? ""}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Display</p>
              <p className="text-white/90">{data.display ?? ""}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">OS</p>
              <p className="text-white/90">{data.os ?? ""}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Camera</p>
              <p className="text-white/90">{data.camera ?? ""}</p>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Description
            </h2>
            <p className="text-white/90 font-medium whitespace-pre-line">
              {data.content?.split(" ").slice(0, 200).join(" ") ?? ""}
              {data.content?.split(" ").length > 200 ? "..." : ""}
            </p>
          </div>

          <div className="mt-4">
            <a
              href={data.source_url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 font-medium hover:underline"
            >
              View on Store
            </a>
          </div>
        </div>
      </div>
    </view>
  );
};

export default DetailHeroSection;
