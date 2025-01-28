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
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

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

    const liveOutput = (data) => {
      if (
        data &&
        typeof data.message !== "undefined" &&
        typeof data.status !== "undefined"
      ) {
        console.log("message, status::: ", data.message, data.status);
        if (data.status) {
          setOutput(data.message);
          setError("");
        } else {
          setError(data.message);
          setOutput("");
        }
      }
    };

    socket.on("leave-room", leaveRoom);
    socket.on("user-joined", userJoinedListener);
    socket.on("output-code", liveOutput);
    return () => {
      socket.off("user-joined", userJoinedListener);
      socket.off("leave-room", leaveRoom);
      socket.off("output-code", liveOutput);
    };
  }, []);

  const handleTyping = (e) => {
    const newContent = e.target.value;
    dispatch(setContent(newContent));
    socket.emit("note-update", { roomName, content: newContent });
    socket.emit("typing", { roomName, userName });
  };

  const runCode = () => {
    setError("");
    setOutput("");

    try {
      const workerCode = `
      onmessage = function(e) {
        try {
          const logs = [];
          const originalConsoleLog = console.log;
          const originalConsoleError = console.error;

          // Override console.log and console.error
          console.log = (...args) => logs.push(args.join(" "));
          console.error = (...args) => logs.push("Error: " + args.join(" "));

          // Execute user code safely
          new Function(e.data)(); 

          // Restore console methods
          console.log = originalConsoleLog;
          console.error = originalConsoleError;

          postMessage({ logs, error: null });
        } catch (err) {
          postMessage({ logs: null, error: err.message + "\\n" + err.stack });
        }
      };
    `;

      const blob = new Blob([workerCode], { type: "application/javascript" });
      const worker = new Worker(URL.createObjectURL(blob));

      worker.postMessage(content);

      worker.onmessage = (event) => {
        const { logs, error } = event.data;

        if (error) {
          socket.emit("run-code", { roomName, message: error, status: false });
          setError(error);
        } else {
          let output = logs.join("\n");
          console.log("logs join output::: ", output);
          socket.emit("run-code", { roomName, message: output, status: true });
          setOutput(output);
        }
        worker.terminate();
      };

      worker.onerror = () => {
        socket.emit("run-code", {
          roomName,
          message: "An unexpected error occurred in the worker.",
          status: false,
        });
        setError("An unexpected error occurred in the worker.");
        worker.terminate();
      };

      setTimeout(() => {
        worker.terminate();
        // setError("Code execution timed out.");
      }, 5000);
    } catch (err) {
      let message = err.message;
      console.log("message::: ", message);
      socket.emit("run-code", { roomName, message, status: false });
      setError(message);
    }
  };

  return (
    <div className="relative">
      <Navbar userName={userName} />
      <div style={{ marginTop: "60px" }}>
        <span
          onClick={runCode}
          className="cursor-pointer w-8 h-8 bg-[#0190fe2c] border border-[#018FFE] backdrop-blur-md absolute z-[1] top-2 right-[51%]  px-2  rounded-full  flex items-center justify-center text-white font-medium"
        >
          <svg
            className="w-5 h-5 text-gray-800 dark:text-white ml-1"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m2.707 14.293 5.586-5.586a1 1 0 0 0 0-1.414L2.707 1.707A1 1 0 0 0 1 2.414v11.172a1 1 0 0 0 1.707.707Z"
            />
          </svg>
        </span>
        <div className="flex " style={{ height: "calc(100vh - 60px)" }}>
          <CodeEditor
            value={content}
            language="js"
            placeholder="Please enter JS code."
            onChange={handleTyping}
            className="caret-white border  border-[#f5f5f52b]"
            style={{
              fontSize: 20,
              color: "whitesmoke",
              backgroundColor: "#222",
              width: "50%",
              minHeight: "100%",
              fontFamily:
                "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
            }}
          />
          <div
            style={{
              fontSize: 20,
              color: "whitesmoke",
              backgroundColor: "#222",
              width: "50%",
              minHeight: "100%",
              fontFamily:
                "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
            }}
            className="border  border-[#f5f5f52b] p-2"
          >
            <span className="text-red-500">{error}</span>
            <pre>{output}</pre>
          </div>
        </div>
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
