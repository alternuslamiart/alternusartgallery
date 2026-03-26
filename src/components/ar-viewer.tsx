"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { Painting } from "@/lib/paintings";

interface ARViewerProps {
  painting: Painting;
}

type ArtworkSize = "small" | "medium" | "large";
type FrameType = "none" | "black" | "white";

export function ARViewer({ painting }: ARViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<"living" | "bedroom" | "office">("living");
  const [artworkSize, setArtworkSize] = useState<ArtworkSize>("medium");
  const [frameType, setFrameType] = useState<FrameType>("none");

  const sizeStyles: Record<ArtworkSize, string> = {
    small: "20%",
    medium: "30%",
    large: "40%",
  };

  const rooms = [
    {
      id: "living" as const,
      name: "Living Room",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
    },
    {
      id: "bedroom" as const,
      name: "Bedroom",
      image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80",
    },
    {
      id: "office" as const,
      name: "Office",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
    },
  ];

  const selectedRoomData = rooms.find((r) => r.id === selectedRoom);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" size="lg" className="w-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="mr-2"
        >
          <path d="M2 8h20" />
          <path d="m2 8 7.3 14.6a1 1 0 0 0 1.7 0L20 8" />
          <path d="m10 8 1.9-4.7a1 1 0 0 1 1.9 0L16 8" />
        </svg>
        View in Your Room
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">View in Your Room</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Room Selection */}
            <div>
              <p className="text-sm font-semibold mb-3 text-muted-foreground">
                Select a room style:
              </p>
              <div className="grid grid-cols-3 gap-3">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                      selectedRoom === room.id
                        ? "border-primary ring-2 ring-primary"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Image src={room.image} alt={room.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                      <span className="text-white text-sm font-semibold">{room.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AR Preview */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
              {selectedRoomData && (
                <>
                  <Image
                    src={selectedRoomData.image}
                    alt={selectedRoomData.name}
                    fill
                    className="object-cover"
                  />
                  {/* Artwork overlay positioned on the wall */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`relative shadow-2xl transition-all duration-300 ${
                        frameType === "black" ? "p-2 bg-gray-800" :
                        frameType === "white" ? "p-2 bg-white" : ""
                      }`}
                      style={{
                        width: sizeStyles[artworkSize],
                        transform: "perspective(800px) rotateY(-2deg)",
                      }}
                    >
                      <div className="relative" style={{ aspectRatio: "4/5" }}>
                        <Image
                          src={painting.image}
                          alt={painting.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Controls */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Artwork Size</span>
                <div className="flex gap-2">
                  <Button
                    variant={artworkSize === "small" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setArtworkSize("small")}
                  >
                    Small
                  </Button>
                  <Button
                    variant={artworkSize === "medium" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setArtworkSize("medium")}
                  >
                    Medium
                  </Button>
                  <Button
                    variant={artworkSize === "large" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setArtworkSize("large")}
                  >
                    Large
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Frame</span>
                <div className="flex gap-2">
                  <Button
                    variant={frameType === "none" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFrameType("none")}
                  >
                    None
                  </Button>
                  <Button
                    variant={frameType === "black" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFrameType("black")}
                  >
                    Black
                  </Button>
                  <Button
                    variant={frameType === "white" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFrameType("white")}
                  >
                    White
                  </Button>
                </div>
              </div>

              <div className="pt-3 border-t text-center">
                <p className="text-xs text-muted-foreground mb-3">
                  This is a visualization preview. For the best AR experience, use our mobile app.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" variant="outline">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="mr-2"
                    >
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                    App Store
                  </Button>
                  <Button size="sm" variant="outline">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="mr-2"
                    >
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" />
                    </svg>
                    Google Play
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
