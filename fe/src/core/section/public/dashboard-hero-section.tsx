import BallSvg from "@/components/svg/ball";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BackgroundMemo from "@/core/components/background-memo";
import { FormSearch } from "@/types/form/query.form";
import { selectModel } from "@/types/service";

interface DashboardProps {
  formSearch: FormSearch;
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
}) => {
  return (
    <view className="w-full h-full overflow-x-hidden ">
      <div className="w-full min-h-screen flex flex-col justify-center items-center relative">
        <div className="absolute w-full h-full z-[-1]">
          <BackgroundMemo />
        </div>
        <div>
          <BallSvg />
        </div>
        <h1 className="text-7xl font-bold w-full max-w-4xl  text-center">
          Hey Armando! Can I help you with anything?
        </h1>
        <p className="font-medium text-slate-500 text-2xl">
          Ready to assist you with anything you need.
        </p>

        <form
          className="w-full h-auto max-w-lg flex gap-4 mt-4 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            onSearch();
          }}
        >
          <div className="w-full flex gap-4 ">
            <Input
              placeholder="search"
              value={formSearch.query}
              onChange={(e) =>
                setFormSearch((prev) => ({
                  ...prev,
                  query: e.target.value,
                }))
              }
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? "wait" : "Search"}
            </Button>
          </div>
          <div className="flex justify-end items-center gap-4 ">
            <p>Select Model :</p>
            <Button
              type="button"
              onClick={() => setSelectModel("hybrid")}
              className={`${selectModel === "hybrid" ? "bg-amber-600" : "bg-amber-50"}`}
            >
              Hybrid
            </Button>
            <Button
              type="button"
              onClick={() => setSelectModel("jaccard")}
              className={``}
            >
              Jaccard
            </Button>
            <Button
              type="button"
              onClick={() => setSelectModel("vector")}
              className={``}
            >
              Vector
            </Button>
          </div>
        </form>
      </div>
    </view>
  );
};

export default DashboardHeroSection;
