import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OtpState {
  email: string | null;
  source: 'register' | 'forgot-password' | null;
}

const initialState: OtpState = {
  email: null,
  source: null,
};

const otpSlice = createSlice({
  name: 'otp',
  initialState,
  reducers: {
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setSource: (state, action: PayloadAction<'register' | 'forgot-password'>) => {
      state.source = action.payload;
    },
    clearOtp: (state) => {
      state.email = null;
      state.source = null;
    },
  },
});

export const { setEmail, setSource, clearOtp } = otpSlice.actions;
export default otpSlice.reducer;
