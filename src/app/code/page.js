"use client";
import dynamic from "next/dynamic";

import { setContent } from "@/redux/notesSlice";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "@uiw/react-textarea-code-editor/dist.css";
import Navbar from "@/components/Navbar";
import socket from "@/socket";
import toast from "react-hot-toast";
import DataService from "@/services/requestApi";

const CodeEditor = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
  { ssr: false }
);

export default function RoomName() {
  const router = useRouter();

  const dispatch = useDispatch();
  const {
    content,
    currentRoom: roomName,
    currentUser: userName,
  } = useSelector((state) => state.notes);
  const [typingUser, setTypingUser] = useState("");
  const [user, setUser] = useState([]);

  useEffect(() => {
    if (!roomName && !userName) {
      router.push("/");
      return;
    }
    allUsers();
  }, []);

  const allUsers = async () => {
    try {
      const { data, message, status } = await DataService.AllUser(roomName);
      console.log("data,message,status::: ", data, message, status);
      if (status == 200) {
        setUser(data?.data?.filter((item) => item.userName !== userName));
      }
    } catch (error) {
      console.log("error::: ", error);
    }
  };

  useEffect(() => {
    socket.on("received-note", (data) => {
      dispatch(setContent(data));
    });

    socket.on("user-typing", (user) => {
      console.log("user::: ", user);
      setTypingUser(user);
      setTimeout(() => setTypingUser(""), 2000);
    });
  }, []);

  useEffect(() => {
    const userJoinedListener = (data) => {
      allUsers();
      toast(data, {
        icon: "🙍🏻‍♂️",
      });
    };

    const leaveRoom = (data) => {
      allUsers();
      toast(data, {
        icon: "🙍🏻‍♂️",
      });
    };

    socket.on("leave-room", leaveRoom);
    socket.on("user-joined", userJoinedListener);

    return () => {
      socket.off("user-joined", userJoinedListener);
      socket.off("leave-room", leaveRoom);
    };
  }, []);

  const handleTyping = (e) => {
    const newContent = e.target.value;
    dispatch(setContent(newContent));
    socket.emit("note-update", { roomName, content: newContent });
    socket.emit("typing", { roomName, userName });
  };

  return (
    <div className="relative">
      <Navbar userName={userName} />
      <div style={{ height: "calc(100vh - 60px)", marginTop: "60px" }}>
        <CodeEditor
          value={content}
          language="jsx"
          placeholder="Please enter JS code."
          onChange={handleTyping}
          className="caret-white"
          style={{
            fontSize: 20,
            color: "whitesmoke",
            backgroundColor: "#222",
            minHeight: "100%",
            fontFamily:
              "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
          }}
        />
      </div>

      {typingUser && (
        <div className="flex items-center space-x-2 border border-gray-700 p-4 rounded-lg fixed z-[10] bottom-[30px] left-[20px] bg-gray-800/30 backdrop-blur-md">
          <span className="h-8 px-2  rounded-full  flex items-center justify-center text-white font-medium">
            {typingUser} is typing
          </span>
          <span className="h-2 w-2 bg-gray-400 rounded-full animate-typing"></span>
          <span className="h-2 w-2 bg-gray-400 rounded-full animate-typing [animation-delay:200ms]"></span>
          <span className="h-2 w-2 bg-gray-400 rounded-full animate-typing [animation-delay:400ms]"></span>
        </div>
      )}

      {user.length > 0 && (
        <div className=" overflow-y-auto border border-gray-700 p-4 rounded-lg fixed z-[10] bottom-[30px] right-[20px] bg-gray-800/30 backdrop-blur-sm flex flex-col space-y-2">
          {user.map((item, idx) => (
            <span key={idx}>
              <span className="h-8 w-auto px-4 py-2 rounded-lg bg-gray-600 flex items-center justify-center text-white font-medium">
                {item.userName}
                {typingUser == item.userName && (
                  <span className="flex items-center px-2">
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-typing"></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-typing [animation-delay:200ms]"></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-typing [animation-delay:400ms]"></span>
                  </span>
                )}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
