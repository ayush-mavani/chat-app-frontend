"use client";
import { setCurrentUser } from "@/redux/notesSlice";
import socket from "@/socket";
import { useRouter } from "next/navigation";
import react, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

export default function Home() {
  const dispatch = useDispatch();
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");
  const router = useRouter();

  const JoinRoom = () => {
    if (roomName && userName) {
      let hasError = false;
      socket.on("error", (data) => {
        console.log("ERROR data::: ", data);
        toast.error(data?.message);
        hasError = true;
      });

      socket.emit("join", { roomName, userName });

      setTimeout(() => {
        if (!hasError) {
          dispatch(setCurrentUser({ roomName, userName }));
          router.push(`/code`);
        }
      }, 100);
    } else {
      alert("Please enter room name and user name");
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-gray-100 text-gray-800 antialiased px-4 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl mx-auto text-center">
          <span className="text-2xl font-light">Join a Room</span>
          <div className="relative mt-4 bg-white shadow-md sm:rounded-lg text-left">
            <div className="h-2 bg-indigo-400 rounded-t-md" />
            <div className="py-6 px-8">
              <label className="block font-semibold">
                Username or Email
                <label>
                  <input
                    type="text"
                    placeholder="Email"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className=" border w-full h-5 px-3 py-5 mt-2 hover:outline-none focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded-md"
                  />
                  <label className="block mt-3 font-semibold">
                    Room Name
                    <label>
                      <input
                        type="text"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        placeholder="Room name"
                        className=" border w-full h-5 px-3 py-5 mt-2 hover:outline-none focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded-md"
                      />
                      <div className="flex justify-between items-baseline">
                        <button
                          onClick={JoinRoom}
                          className="mt-4 bg-indigo-500 text-white py-2 px-6 rounded-lg hover:bg-indigo-600"
                        >
                          Join
                        </button>
                      </div>
                    </label>
                  </label>
                </label>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
