"use client";
import { useParams } from "next/navigation";

import NavLayout from "@/core/layouts/nav.layout";
import DetailHeroSection from "@/core/section/public/detail-hero-section";
import useServices from "@/hooks/mutation/props.mutation";

const DetailProductContainer = () => {
  const params = useParams();
  const id = params.id as string;
  const service = useServices();
  const productsQuery = service.Search.query(id);

  return (
    <NavLayout>
      <main className="w-full min-h-screen  flex flex-col overflow-x-hidden">
        <DetailHeroSection data={productsQuery.detailQuery ?? ""} />
      </main>
    </NavLayout>
  );
};

export default DetailProductContainer;
