"use client";
import { useRouter } from "next/navigation";
import react, { useState } from "react";

export default function Home() {
  const [roomName, setRoomName] = useState("");
  const router = useRouter();

  const JoinRoom = () => {
    if (roomName) {
      router.push(`/room/${roomName}`);
    }
  };

  return (
    <div>
      <h1>Join a Room</h1>
      <input
        type="text"
        className="border p-2 rounded"
        placeholder="Enter a Room Name..."
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
      />
      <br />
      <button
        className="mt-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        onClick={JoinRoom}
      >
        Join
      </button>
    </div>
  );
}
