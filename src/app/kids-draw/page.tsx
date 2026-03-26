"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

type Tool = "select" | "pencil" | "brush" | "eraser" | "fill" | "text" | "rectangle" | "circle" | "line" | "star";

const COLORS = [
  "#000000", // Black
  "#FFFFFF", // White
  "#FF0000", // Red
  "#FF6B6B", // Light Red
  "#FF9500", // Orange
  "#FFD93D", // Yellow
  "#6BCB77", // Green
  "#4D96FF", // Blue
  "#9B59B6", // Purple
  "#FF69B4", // Pink
  "#8B4513", // Brown
  "#87CEEB", // Sky Blue
];

const BRUSH_SIZES = [4, 8, 12, 20, 32];

export default function KidsDrawPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>("pencil");
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(8);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Selection state for move/resize
  const [selection, setSelection] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    imageData: ImageData | null;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Text tool state
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [fontSize, setFontSize] = useState(24);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Clear selection when switching tools
  const handleToolChange = (newTool: Tool) => {
    if (newTool !== "select" && selection) {
      setSelection(null);
    }
    if (newTool !== "text") {
      setTextPosition(null);
      setTextInput("");
    }
    setTool(newTool);
  };

  // Add text to canvas
  const addTextToCanvas = () => {
    if (!textInput || !textPosition) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.font = `${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = color;
    ctx.fillText(textInput, textPosition.x, textPosition.y);

    setTextInput("");
    setTextPosition(null);
    saveToHistory();
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        // Fill with white background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Save initial state
        saveToHistory();
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      return newHistory.slice(-20); // Keep last 20 states
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 19));
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newIndex = historyIndex - 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newIndex = historyIndex + 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "my-artwork.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoordinates(e);
    setIsDrawing(true);
    setLastPos(coords);
    setStartPos(coords);

    if (tool === "fill") {
      floodFill(coords.x, coords.y);
    }

    // Handle text tool
    if (tool === "text") {
      setTextPosition({ x: coords.x, y: coords.y });
      setTimeout(() => textInputRef.current?.focus(), 100);
      setIsDrawing(false);
      return;
    }

    // Handle select tool
    if (tool === "select") {
      // Check if clicking inside existing selection
      if (selection) {
        const padding = 8;

        // Check all four corners for resize
        const corners = {
          "nw": { x: selection.x, y: selection.y },
          "ne": { x: selection.x + selection.width, y: selection.y },
          "sw": { x: selection.x, y: selection.y + selection.height },
          "se": { x: selection.x + selection.width, y: selection.y + selection.height },
        };

        for (const [corner, pos] of Object.entries(corners)) {
          if (
            coords.x >= pos.x - padding &&
            coords.x <= pos.x + padding &&
            coords.y >= pos.y - padding &&
            coords.y <= pos.y + padding
          ) {
            setIsResizing(true);
            setResizeCorner(corner);
            return;
          }
        }

        const inSelection =
          coords.x >= selection.x &&
          coords.x <= selection.x + selection.width &&
          coords.y >= selection.y &&
          coords.y <= selection.y + selection.height;

        if (inSelection) {
          setIsDragging(true);
          setDragOffset({
            x: coords.x - selection.x,
            y: coords.y - selection.y,
          });
          return;
        }
      }
      // Start new selection
      setSelection(null);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const coords = getCoordinates(e);

    // Handle selection dragging
    if (tool === "select" && isDragging && selection && selection.imageData) {
      // Restore background
      if (historyIndex >= 0 && history[historyIndex]) {
        ctx.putImageData(history[historyIndex], 0, 0);
      }
      // Draw selection at new position
      const newX = coords.x - dragOffset.x;
      const newY = coords.y - dragOffset.y;
      ctx.putImageData(selection.imageData, newX, newY);
      setSelection({ ...selection, x: newX, y: newY });
      return;
    }

    // Handle selection resizing from all corners
    if (tool === "select" && isResizing && selection && selection.imageData) {
      let newX = selection.x;
      let newY = selection.y;
      let newWidth = selection.width;
      let newHeight = selection.height;

      // Calculate new dimensions based on which corner is being dragged
      if (resizeCorner === "se") {
        newWidth = Math.max(20, coords.x - selection.x);
        newHeight = Math.max(20, coords.y - selection.y);
      } else if (resizeCorner === "sw") {
        newWidth = Math.max(20, selection.x + selection.width - coords.x);
        newHeight = Math.max(20, coords.y - selection.y);
        newX = coords.x;
      } else if (resizeCorner === "ne") {
        newWidth = Math.max(20, coords.x - selection.x);
        newHeight = Math.max(20, selection.y + selection.height - coords.y);
        newY = coords.y;
      } else if (resizeCorner === "nw") {
        newWidth = Math.max(20, selection.x + selection.width - coords.x);
        newHeight = Math.max(20, selection.y + selection.height - coords.y);
        newX = coords.x;
        newY = coords.y;
      }

      // Restore background
      if (historyIndex >= 0 && history[historyIndex]) {
        ctx.putImageData(history[historyIndex], 0, 0);
      }

      // Create temporary canvas for scaling
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = selection.imageData.width;
      tempCanvas.height = selection.imageData.height;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCtx.putImageData(selection.imageData, 0, 0);
        ctx.drawImage(tempCanvas, newX, newY, newWidth, newHeight);
      }

      setSelection({ ...selection, x: newX, y: newY, width: newWidth, height: newHeight });
      return;
    }

    if (!isDrawing) return;

    if (tool === "pencil" || tool === "brush") {
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = tool === "brush" ? brushSize * 2 : brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      setLastPos(coords);
    } else if (tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = brushSize * 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      setLastPos(coords);
    }
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getCoordinates(e);

    // Handle select tool
    if (tool === "select") {
      if (isDragging || isResizing) {
        setIsDragging(false);
        setIsResizing(false);
        setResizeCorner(null);
        saveToHistory();
        return;
      }

      if (isDrawing) {
        // Create new selection
        const x = Math.min(startPos.x, coords.x);
        const y = Math.min(startPos.y, coords.y);
        const width = Math.abs(coords.x - startPos.x);
        const height = Math.abs(coords.y - startPos.y);

        if (width > 10 && height > 10) {
          const imageData = ctx.getImageData(x, y, width, height);
          setSelection({ x, y, width, height, imageData });
          // Clear the selected area
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(x, y, width, height);
          // Redraw the selection on top
          ctx.putImageData(imageData, x, y);
        }
        setIsDrawing(false);
        return;
      }
    }

    if (!isDrawing) return;

    // Draw shapes on mouse up
    if (tool === "rectangle") {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.strokeRect(
        startPos.x,
        startPos.y,
        coords.x - startPos.x,
        coords.y - startPos.y
      );
    } else if (tool === "circle") {
      const radius = Math.sqrt(
        Math.pow(coords.x - startPos.x, 2) + Math.pow(coords.y - startPos.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.stroke();
    } else if (tool === "line") {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.stroke();
    } else if (tool === "star") {
      drawStar(ctx, startPos.x, startPos.y, 5,
        Math.abs(coords.x - startPos.x) || 30,
        (Math.abs(coords.x - startPos.x) || 30) / 2
      );
    }

    setIsDrawing(false);
    saveToHistory();
  };

  const drawStar = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ) => {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.stroke();
  };

  const floodFill = (startX: number, startY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const startIdx = (Math.floor(startY) * canvas.width + Math.floor(startX)) * 4;
    const startR = data[startIdx];
    const startG = data[startIdx + 1];
    const startB = data[startIdx + 2];

    // Parse fill color
    const fillColor = {
      r: parseInt(color.slice(1, 3), 16),
      g: parseInt(color.slice(3, 5), 16),
      b: parseInt(color.slice(5, 7), 16),
    };

    // Don't fill if same color
    if (startR === fillColor.r && startG === fillColor.g && startB === fillColor.b) return;

    const stack: [number, number][] = [[Math.floor(startX), Math.floor(startY)]];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;

      const idx = (y * canvas.width + x) * 4;
      if (
        Math.abs(data[idx] - startR) > 10 ||
        Math.abs(data[idx + 1] - startG) > 10 ||
        Math.abs(data[idx + 2] - startB) > 10
      ) continue;

      visited.add(key);
      data[idx] = fillColor.r;
      data[idx + 1] = fillColor.g;
      data[idx + 2] = fillColor.b;
      data[idx + 3] = 255;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
    saveToHistory();
  };

  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    {
      id: "select",
      label: "Select & Move",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 3l14 9-7 2-4 7-3-18z"/>
        </svg>
      ),
    },
    {
      id: "pencil",
      label: "Pencil",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
        </svg>
      ),
    },
    {
      id: "brush",
      label: "Brush",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/>
          <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>
        </svg>
      ),
    },
    {
      id: "eraser",
      label: "Eraser",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/>
          <path d="M22 21H7"/>
          <path d="m5 11 9 9"/>
        </svg>
      ),
    },
    {
      id: "fill",
      label: "Fill",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/>
          <path d="m5 2 5 5"/>
          <path d="M2 13h15"/>
          <path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"/>
        </svg>
      ),
    },
    {
      id: "text",
      label: "Text",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 7 4 4 20 4 20 7"/>
          <line x1="9" y1="20" x2="15" y2="20"/>
          <line x1="12" y1="4" x2="12" y2="20"/>
        </svg>
      ),
    },
    {
      id: "line",
      label: "Line",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 19L19 5"/>
        </svg>
      ),
    },
    {
      id: "rectangle",
      label: "Rectangle",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
        </svg>
      ),
    },
    {
      id: "circle",
      label: "Circle",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      ),
    },
    {
      id: "star",
      label: "Star",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-emerald-50 to-teal-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-400 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/>
                  <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Kids Draw</h1>
                <p className="text-xs text-gray-500">Create amazing art!</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Undo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7v6h6"/>
                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
              </svg>
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Redo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 7v6h-6"/>
                <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>
              </svg>
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-500 transition-colors"
              title="Clear All"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </button>
            <button
              onClick={downloadImage}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-400 text-white rounded-lg hover:from-cyan-600 hover:to-emerald-500 transition-colors text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" x2="12" y1="15" y2="3"/>
              </svg>
              Save
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Toolbar */}
        <div className="w-12 md:w-14 bg-white/80 backdrop-blur-sm border-r border-gray-200 p-1.5 flex flex-col gap-0.5">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => handleToolChange(t.id)}
              className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${
                tool === t.id
                  ? "bg-gradient-to-br from-cyan-500 to-emerald-400 text-white shadow-md scale-105"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
              title={t.label}
            >
              {t.icon}
            </button>
          ))}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-4">
          <div className="relative w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className={`w-full h-full touch-none ${
                tool === "select" ? "cursor-crosshair" :
                tool === "eraser" ? "cursor-cell" : "cursor-crosshair"
              }`}
            />
            {/* Selection overlay */}
            {selection && tool === "select" && (
              <div
                className="absolute border-2 border-dashed border-cyan-500 bg-cyan-500/10 pointer-events-none"
                style={{
                  left: selection.x,
                  top: selection.y,
                  width: selection.width,
                  height: selection.height,
                }}
              >
                {/* Corner resize handles */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-cyan-500 rounded-full cursor-nw-resize pointer-events-auto" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-500 rounded-full cursor-ne-resize pointer-events-auto" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-cyan-500 rounded-full cursor-sw-resize pointer-events-auto" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-cyan-500 rounded-full cursor-se-resize pointer-events-auto" />
                {/* Move indicator */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-600 pointer-events-auto cursor-move">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="5 9 2 12 5 15"/>
                    <polyline points="9 5 12 2 15 5"/>
                    <polyline points="15 19 12 22 9 19"/>
                    <polyline points="19 9 22 12 19 15"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <line x1="12" y1="2" x2="12" y2="22"/>
                  </svg>
                </div>
                {/* Size indicator */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                  {Math.round(selection.width)} x {Math.round(selection.height)}
                </div>
              </div>
            )}

            {/* Text input overlay */}
            {textPosition && tool === "text" && (
              <div
                className="absolute"
                style={{
                  left: textPosition.x,
                  top: textPosition.y - fontSize,
                }}
              >
                <input
                  ref={textInputRef}
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addTextToCanvas();
                    } else if (e.key === "Escape") {
                      setTextPosition(null);
                      setTextInput("");
                    }
                  }}
                  onBlur={() => {
                    if (textInput) addTextToCanvas();
                  }}
                  placeholder="Type here..."
                  className="bg-transparent border-b-2 border-cyan-500 outline-none min-w-[100px]"
                  style={{
                    fontSize: `${fontSize}px`,
                    color: color,
                    fontFamily: "Arial, sans-serif",
                  }}
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Colors & Size */}
        <div className="w-20 md:w-24 bg-white/80 backdrop-blur-sm border-l border-gray-200 p-2 flex flex-col gap-4">
          {/* Colors */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider text-center mb-2">Colors</p>
            <div className="grid grid-cols-2 gap-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`aspect-square rounded-lg transition-all ${
                    color === c ? "ring-2 ring-cyan-500 ring-offset-2 scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c, border: c === "#FFFFFF" ? "1px solid #e5e7eb" : "none" }}
                />
              ))}
            </div>
          </div>

          {/* Brush Size */}
          {tool !== "text" && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider text-center mb-2">Size</p>
              <div className="flex flex-col gap-1 items-center">
                {BRUSH_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setBrushSize(size)}
                    className={`w-full py-2 rounded-lg flex items-center justify-center transition-all ${
                      brushSize === size
                        ? "bg-gradient-to-r from-cyan-500 to-emerald-400"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div
                      className={`rounded-full ${brushSize === size ? "bg-white" : "bg-gray-400"}`}
                      style={{ width: size, height: size }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Font Size for Text Tool */}
          {tool === "text" && (
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider text-center mb-2">Font</p>
              <div className="flex flex-col gap-1 items-center">
                {[16, 24, 32, 48, 64].map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`w-full py-1.5 rounded-lg flex items-center justify-center transition-all text-xs ${
                      fontSize === size
                        ? "bg-gradient-to-r from-cyan-500 to-emerald-400 text-white"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
