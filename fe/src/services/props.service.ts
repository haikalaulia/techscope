import AuhtApi from "@/services/auth/auth.service";
import SearchApi from "./searching/searching.service";
class Api {
  static Auth = new AuhtApi();
  static Search = new SearchApi();
}

export default Api;
