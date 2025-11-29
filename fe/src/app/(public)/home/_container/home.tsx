"use client";
import { useState } from "react";

import NavLayout from "@/core/layouts/nav.layout";
import DashboardHeroSection from "@/core/section/public/dashboard-hero-section";
import { useAppSelector } from "@/hooks/dispatch/dispatch";
import useServices from "@/hooks/mutation/props.mutation";
import { useAppNameSpase } from "@/hooks/useAppNameSpace";
import { setPayloadRespone } from "@/stores/resSlice/resSlice";
import { FormSearch } from "@/types/form/query.form";
import { selectModel } from "@/types/service";

export default function ContainerHome() {
  const service = useServices();
  const namespace = useAppNameSpase();
  const payloadRespone = useAppSelector((state) => state.res.payloadRespone);
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<selectModel>("hybrid");
  const hybridMutation = service.Search.mutation.useSearchingHybird();
  const vectorMutation = service.Search.mutation.useSearchingTFIDF();
  const jaccardMutation = service.Search.mutation.useSearchJaccard();

  const [formSearch, setFormSearch] = useState<FormSearch>({
    query: "",
  });
  const handleSearch = () => {
    if (selectedAlgorithm === "hybrid") {
      return hybridMutation.mutate(formSearch, {
        onSuccess: (res) => {
          namespace.dispatch(setPayloadRespone(res.data));
        },
      });
    } else if (selectedAlgorithm === "jaccard") {
      return vectorMutation.mutate(formSearch, {
        onSuccess: (res) => {
          namespace.dispatch(setPayloadRespone(res.data));
        },
      });
    } else if (selectedAlgorithm === "vector") {
      return jaccardMutation.mutate(formSearch, {
        onSuccess: (res) => {
          namespace.dispatch(setPayloadRespone(res.data));
        },
      });
    }
  };

  return (
    <NavLayout>
      <main className="w-full overflow-x-hidden">
        <DashboardHeroSection
          payloadRespone={payloadRespone!}
          router={namespace.router}
          dispatch={namespace.dispatch}
          formSearch={formSearch}
          setFormSearch={setFormSearch}
          onSearch={() => handleSearch()}
          selectModel={selectedAlgorithm}
          setSelectModel={setSelectedAlgorithm}
          isPending={
            hybridMutation.isPending ||
            vectorMutation.isPending ||
            jaccardMutation.isPending
          }
        />
      </main>
    </NavLayout>
  );
}
