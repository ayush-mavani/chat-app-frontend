import { createSlice } from "@reduxjs/toolkit";

const noteSlice = createSlice({
  name: "note",
  initialState: {
    content: "",
    currentUser: "",
    currentRoom: "",
    userTyping: "",
  },
  reducers: {
    setContent(state, action) {
      state.content = action.payload;
    },
    setCurrentUser(state, action) {
      state.currentUser = action.payload.userName;
      state.currentRoom = action.payload.roomName;
    },
  },
});

export const { setContent, setCurrentUser } = noteSlice.actions;
export default noteSlice.reducer;
