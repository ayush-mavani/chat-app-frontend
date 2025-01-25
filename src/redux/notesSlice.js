import { createSlice } from "@reduxjs/toolkit";

const noteSlice = createSlice({
  name: "note",
  initialState: {
    content: "",
    userTyping: "",
  },
  reducers: {
    setContent(state, action) {
      state.content = action.payload;
    },
  },
});

export const { setContent } = noteSlice.actions;
export default noteSlice.reducer;
