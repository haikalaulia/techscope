import { TResponse } from "@/pkg/react-query/mutation-wrapper.type";
import Api from "@/services/props.service";
import { EvaluateType } from "@/types/form/evaluate.form";
import { FormSearch } from "@/types/form/query.form";
import { useMutation } from "@tanstack/react-query";
const useSearchingMutation = {
  useSearchingHybird() {
    return useMutation<TResponse<any>, Error, FormSearch>({
      mutationFn: (payload) => Api.Search.searchingHybrid(payload),
    });
  },
  useSearchingTFIDF() {
    return useMutation<TResponse<any>, Error, FormSearch>({
      mutationFn: (payload) => Api.Search.searchingTFIDF(payload),
    });
  },
  useSearchJaccard() {
    return useMutation<TResponse<any>, Error, FormSearch>({
      mutationFn: (payload) => Api.Search.searchingJaccard(payload),
    });
  },
  useEvaluate() {
    return useMutation<TResponse<any>, Error, EvaluateType>({
      mutationFn: (payload) => Api.Search.evaluate(payload),
    });
  },
};

export default useSearchingMutation;
