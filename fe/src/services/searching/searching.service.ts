import { TResponse } from "@/pkg/react-query/mutation-wrapper.type";
import { EvaluateType } from "@/types/form/evaluate.form";
import { FormSearch } from "@/types/form/query.form";
import AxiosClient from "@/utils/axios.client";

class SearchApi {
  async searchingHybrid(payload: FormSearch): Promise<TResponse<any>> {
    const res = await AxiosClient.post("/api/search", payload);
    return res.data;
  }
  async searchingTFIDF(payload: FormSearch): Promise<TResponse<any>> {
    const res = await AxiosClient.post("/api/search/predict", payload);
    return res.data;
  }
  async searchingJaccard(payload: FormSearch): Promise<TResponse<any>> {
    const res = await AxiosClient.post("/api/search/predict/jaccard", payload);
    return res.data;
  }
  async evaluate(payload: EvaluateType): Promise<TResponse<any>> {
    const res = await AxiosClient.post("/api/search/evaluate", payload);
    return res.data;
  }
}

export default SearchApi;
