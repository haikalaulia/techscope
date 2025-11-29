import AuhtApi from "@/services/auth/auth.service";

import SearchApi from "./searching/searching.service";
import SeacrhingHistoryApi from "./searchingHistory/searchingHistory.service";
class Api {
  static Auth = new AuhtApi();
  static Search = new SearchApi();
  static History = new SeacrhingHistoryApi();
}

export default Api;
