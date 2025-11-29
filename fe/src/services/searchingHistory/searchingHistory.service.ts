import { TResponse } from "@/pkg/react-query/mutation-wrapper.type";
import AxiosClient from "@/utils/axios.client";

class SeacrhingHistoryApi {
  //Belum intergrate
  async HistoryAll(userId: string): Promise<TResponse<any>> {
    const res = await AxiosClient.get(`/api/search-history/${userId}`);
    return res.data;
  }
  async HistoryHybrid(userId: string): Promise<TResponse<any>> {
    const res = await AxiosClient.get(`/api/search-history/${userId}/hybrid`);
    return res.data;
  }
  async HistoryJaccard(userId: string): Promise<TResponse<any>> {
    const res = await AxiosClient.get(`/api/search-history/${userId}/jaccard`);
    return res.data;
  }
  async HistoryVector(userId: string): Promise<TResponse<any>> {
    const res = await AxiosClient.get(`/api/search-history/${userId}/vector`);
    return res.data;
  }
  async DeleteHistoryById(historyId: string): Promise<TResponse<any>> {
    const res = await AxiosClient.delete(`/api/search-history/${historyId}`);
    return res.data;
  }
  async DeleteHistoryAll(userId: string): Promise<TResponse<any>> {
    const res = await AxiosClient.delete(`/api/search-history/clear/${userId}`);
    return res.data;
  }
}

export default SeacrhingHistoryApi;
