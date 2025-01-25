"use client";
import { setContent } from "@/redux/notesSlice";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function RoomName() {
  const router = useParams();
  const { roomName } = router;
  const [userName] = useState(
    `User-${Math.random().toString(36).substr(2, 5)}`
  );
  //   console.log("userName::: ", userName);
  const dispatch = useDispatch();
  const { content } = useSelector((state) => state.notes);
  const [typingUser, setTypingUser] = useState("");

  useEffect(() => {
    if (!roomName) return;

    socket.emit("join", { roomName, userName });
  }, []);

  useEffect(() => {
    socket.on("received-note", (data) => {
      dispatch(setContent(data));
    });

    socket.on("user-typing", (user) => {
      setTypingUser(user);
      setTimeout(() => setTypingUser(""), 1000);
    });
  }, [roomName]);

  const handleTyping = (e) => {
    const newContent = e.target.value;
    dispatch(setContent(newContent));
    socket.emit("note-update", { roomName, content: newContent });
    socket.emit("typing", { roomName, userName });
  };

  return (
    <div className="p-4">
      <p>
        Room: {roomName} - {userName}
      </p>
      <textarea value={content} className="border" onChange={handleTyping} />
      <div>
        {console.log("typingUser...", typingUser)}
        <h3>User typing: {typingUser}</h3>
      </div>
    </div>
  );
}
