import React from "react";
import CODE_IMAGE from "@/components/code.png";
import Image from "next/image";

export default function Navbar({ userName }) {
  return (
    <div>
      <nav
        className="bg-gray-700 "
        style={{
          height: "60px",
          position: "fixed",
          top: "0",
          width: "100%",
          zIndex: "1000",
        }}
      >
        <div className=" px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="flex flex-1 items-center justify-between">
              <div className="flex shrink-0 items-center">
                <Image
                  className="h-10 w-auto"
                  src={CODE_IMAGE}
                  alt="Your Company"
                />
                <span
                  className="text-[#f5f5f5] font-bold px-2"
                  style={{
                    fontSize: 20,
                    color: "whitesmoke",
                    fontFamily:
                      "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                  }}
                >
                  Codeshare
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:block">
                <div className="flex space-x-4">
                  <div className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white">
                    {userName}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile menu, show/hide based on menu state. */}
      </nav>
    </div>
  );
}
