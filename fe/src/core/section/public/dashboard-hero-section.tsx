import { useState } from "react";

import ResultCard from "@/components/partial/ResultCard";
import BallSvg from "@/components/svg/ball";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BackgroundMemo from "@/core/components/background-memo";
import { clearPayloadRespone } from "@/stores/resSlice/resSlice";
import { FormSearch } from "@/types/form/query.form";
import { SearchRespone } from "@/types/res/respone";
import { selectModel } from "@/types/service";

interface DashboardProps {
  formSearch: FormSearch;
  router: any;
  dispatch: any;
  payloadRespone: SearchRespone;
  setFormSearch: React.Dispatch<React.SetStateAction<FormSearch>>;
  isPending: boolean;
  onSearch: () => void;
  selectModel: selectModel;
  setSelectModel: React.Dispatch<React.SetStateAction<selectModel>>;
}

const DashboardHeroSection: React.FC<DashboardProps> = ({
  formSearch,
  isPending,
  onSearch,
  selectModel,
  setFormSearch,
  setSelectModel,
  payloadRespone,
  dispatch,
  router,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = payloadRespone?.results.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(payloadRespone?.results.length / itemsPerPage);
  return (
    <view className="w-full h-full overflow-x-hidden">
      <div className="absolute w-full h-full z-[-1]">
        <BackgroundMemo />
      </div>
      <div className="w-full min-h-screen flex flex-col justify-center items-center relative">
        {payloadRespone ? (
          <div className="w-full min-h-screen  md:p-12">
            <div className="absolute top-35 left-4 z-10">
              <button
                onClick={() => {
                  router.push("/home");
                  dispatch(clearPayloadRespone());
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
              >
                Back
              </button>
            </div>
            <div className="text-center mt-22">
              <div className="inline-block mb-4">
                <span className="px-4 py-2 bg-linear-to-r from-blue-500/10 to-purple-500/10 text-blue-600 text-sm font-semibold rounded-full border border-blue-200">
                  Search Results
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                {payloadRespone.category_filter}
              </h1>
              <p className="text-gray-600 text-lg">
                Temukan perangkat yang sempurna untuk kebutuhan Anda
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-8xl mx-auto mt-4">
              {currentItems.map((item) => (
                <ResultCard key={item.id} item={item} />
              ))}
            </div>

            <div className="flex justify-center mt-10 gap-2">
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-4 py-2"
                variant={"outline"}
              >
                Prev
              </Button>

              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-white border text-gray-700"
                  }`}
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                disabled={currentPage === totalPages}
                variant={"outline"}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-2"
              >
                Next
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full min-h-screen flex flex-col justify-center items-center px-6">
            <div className="mb-2">
              <BallSvg />
            </div>

            <h1 className="text-6xl md:text-7xl font-black w-full max-w-3xl text-center bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Wellcome to Tecsope
            </h1>

            <p className="font-medium text-slate-300 text-xl md:text-2xl text-center mb-8 max-w-2xl">
              Siap membantu Anda menemukan perangkat teknologi terbaik dengan
              mudah
            </p>

            <form
              className="w-full max-w-lg flex gap-4 flex-col"
              onSubmit={(e) => {
                e.preventDefault();
                onSearch();
              }}
            >
              <div className="w-full flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Cari perangkat, brand, atau spesifikasi..."
                    value={formSearch.query}
                    onChange={(e) =>
                      setFormSearch((prev) => ({
                        ...prev,
                        query: e.target.value,
                      }))
                    }
                    className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="py-3 px-6 bg-linear-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg active:scale-95"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block animate-spin">⏳</span>{" "}
                      Mencari...
                    </span>
                  ) : (
                    <span>Search</span>
                  )}
                </Button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-2">
                  <label className="text-sm font-semibold text-slate-300">
                    Pilih Algoritma Pencarian:
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectModel("hybrid")}
                    className={`
      group relative py-3 font-semibold rounded-xl transition-all duration-300
      border backdrop-blur-xl bg-white/5 text-white
      hover:bg-white/10 hover:shadow-xl
      ${selectModel === "hybrid" ? "border-blue-400 shadow-lg scale-105" : "border-gray-600"}
    `}
                  >
                    <span className="relative z-10">Hybrid</span>

                    {selectModel === "hybrid" && (
                      <span className="absolute inset-0 z-0 bg-linear-to-r from-amber-500/20 to-amber-600/20 blur-xl" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectModel("jaccard")}
                    className={`
      group relative py-3 font-semibold rounded-xl transition-all duration-300
      border backdrop-blur-xl bg-white/5 text-white
      hover:bg-white/10 hover:shadow-xl
      ${selectModel === "jaccard" ? "border-purple-400 shadow-lg scale-105" : "border-gray-600"}
    `}
                  >
                    <span className="relative z-10">Jaccard</span>

                    {selectModel === "jaccard" && (
                      <span className="absolute inset-0 z-0 bg-linear-to-r from-purple-500/20 to-purple-600/20 blur-xl" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectModel("vector")}
                    className={`
      group relative py-3 font-semibold rounded-xl transition-all duration-300
      border backdrop-blur-xl bg-white/5 text-white
      hover:bg-white/10 hover:shadow-xl
      ${selectModel === "vector" ? "border-pink-400 shadow-lg scale-105" : "border-gray-600"}
    `}
                  >
                    <span className="relative z-10">Vector</span>

                    {selectModel === "vector" && (
                      <span className="absolute inset-0 z-0 bg-linear-to-r from-pink-500/20 to-pink-600/20 blur-xl" />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </view>
  );
};

export default DashboardHeroSection;
