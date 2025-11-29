import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { SearchRespone } from "@/types/res/respone";

interface SearchState {
  payloadRespone: SearchRespone | null;
}

const initialState: SearchState = {
  payloadRespone: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setPayloadRespone(state, action: PayloadAction<SearchRespone | null>) {
      state.payloadRespone = action.payload;
    },
    clearPayloadRespone(state) {
      state.payloadRespone = null;
    },
  },
});

export const { setPayloadRespone, clearPayloadRespone } = searchSlice.actions;
export default searchSlice.reducer;
