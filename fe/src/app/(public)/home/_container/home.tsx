"use client";
import { useState } from "react";

import NavLayout from "@/core/layouts/nav.layout";
import DashboardHeroSection from "@/core/section/public/dashboard-hero-section";
import useServices from "@/hooks/mutation/props.mutation";
import { useAppNameSpase } from "@/hooks/useAppNameSpace";
import { FormSearch } from "@/types/form/query.form";
import { selectModel } from "@/types/service";

export default function ContainerHome() {
  const namespace = useAppNameSpase();
  const service = useServices();
  const [selectModel, setSelectModel] = useState<selectModel>("hybrid");
  const [formSearch, setFormSearch] = useState<FormSearch>({
    query: "",
  });
  const SearchHybridMutation = service.Search.mutation.useSearchingHybird();
  const SearchVectorMutation = service.Search.mutation.useSearchingTFIDF();
  const SearchJaccardMutation = service.Search.mutation.useSearchJaccard();

  const handleSearch = () => {
    if (selectModel === "hybrid") {
      return SearchHybridMutation.mutate(formSearch, {
        onSuccess: () => {
          // setup
        },
      });
    } else if (selectModel === "jaccard") {
      return SearchJaccardMutation.mutate(formSearch, {
        onSuccess: () => {
          //setup
        },
      });
    } else if (selectModel === "vector") {
      return SearchVectorMutation.mutate(formSearch, {
        onSuccess: () => {
          // setup
        },
      });
    }
  };
  return (
    <NavLayout>
      <main className="w-full  overflow-x-hidden">
        <DashboardHeroSection
          formSearch={formSearch}
          isPending={
            SearchHybridMutation.isPending ||
            SearchJaccardMutation.isPending ||
            SearchVectorMutation.isPending
          }
          selectModel={selectModel}
          setSelectModel={setSelectModel}
          setFormSearch={setFormSearch}
          onSearch={handleSearch}
        />
      </main>
    </NavLayout>
  );
}
