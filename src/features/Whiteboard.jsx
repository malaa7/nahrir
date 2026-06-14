import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Image as KonvaImage, Rect, Circle, Arrow, Text, Transformer, Path, Group } from 'react-konva';
import Konva from 'konva';
import * as pdfjsLib from 'pdfjs-dist';
// Use local worker
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import {
    Pencil, Eraser, Download, Printer, Upload, Trash2, RotateCcw, RotateCw,
    Image as ImageIcon, FileText, ZoomIn, ZoomOut, Move, ChevronLeft, ChevronRight,
    Zap, Type, Square, Circle as CircleIcon, ArrowRight, Minus, MousePointer2, Plus, Highlighter,
    Bold, Italic, Underline, StickyNote, Camera, Grid, MoreHorizontal, AlignJustify, MoveDiagonal, Check, X, Files,
    Play, Pause
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import useWhiteboardStore from './whiteboardStore';
import './Whiteboard.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const Whiteboard = () => {
    const { t, language } = useLanguage();

    // Core Refs
    const stageRef = useRef(null);
    const transformerRef = useRef(null);
    const isDrawing = useRef(false);

    // Recording Refs removed

    // State
    const [tool, setTool] = useState('pen');
    const [strokeColor, setStrokeColor] = useState('#667eea');
    const [strokeWidth, setStrokeWidth] = useState(3);
    const [eraserWidth, setEraserWidth] = useState(20);
    const [showSidebar, setShowSidebar] = useState(true);
    const [stageDimensions, setStageDimensions] = useState({ width: 1100, height: 850 });
    const isResizingStage = useRef(false);

    // Pages System from Store
    const {
    pages,
    currentPageIndex,
    setPages,
    setCurrentPageIndex,
    updateCurrentPage,
    addPage,
    removePage
    } = useWhiteboardStore();

    // Derived State with safe bounds check
    const currentPageIndexSafe = Math.min(currentPageIndex, pages.length - 1);
    const currentPage = pages[currentPageIndexSafe] || pages[0] || {
      elements: [],
      undoStack: [],
      redoStack: [],
      backgroundColor: '#ffffff',
      backgroundPattern: 'solid',
      pdfDoc: null,
      currentPdfPage: 1,
      pdfScale: 1,
      pdfPosition: { x: 0, y: 0 }
    };
    const elements = currentPage.elements || [];

    // Emojis & stickers state
    const emojis = ['👏', '⭐', '❤️', '👍', '😊', '🔥', '🎈', '🎉', '🙌'];
    const [selectedEmoji, setSelectedEmoji] = useState('👏');

    // Whiteboard Timer state
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [timerMinutesInput, setTimerMinutesInput] = useState(5);
    const [timerInitialDuration, setTimerInitialDuration] = useState(0);

    // Selection
    const [selectedId, setSelectedId] = useState(null);

    // PDF Loading
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [pdfImage, setPdfImage] = useState(null);

    // Cursor Tracking
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

    // Context Menu & Clipboard
    const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    targetId: null
    });
    const [clipboard, setClipboard] = useState(null);

    // Text Input
    const [textInput, setTextInput] = useState({
    visible: false,
    x: 0,
    y: 0,
    value: '',
    fontSize: 24,
    fontStyle: 'normal',
    textDecoration: '',
    toolType: 'text' // 'text' or 'sticky'
    });

    // --- PDF Handling ---
    const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
    alert('Please upload a PDF file');
    return;
    }

    setIsPdfLoading(true);
    try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Render first page immediately
    updateCurrentPage({
    pdfDoc: pdf,
    currentPdfPage: 1,
    // Assign existing elements to page 1 to prevent them showing on all pages
    elements: elements.map(el => ({ ...el, pdfPage: 1 }))
    });
    await renderPdfToImage(pdf, 1);
    } catch (error) {
    console.error("Error loading PDF:", error);
    alert("Failed to load PDF");
    } finally {
    setIsPdfLoading(false);
    }
    };

    const renderPdfToImage = async (pdfDoc, pageNum) => {
    if (!pdfDoc) return;
    try {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 }); // High res render
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;

    const img = new window.Image();
    img.src = canvas.toDataURL();
    img.onload = () => {
    setPdfImage(img);
    };
    } catch (err) {
    console.error("Render error", err);
    }
    };

    // Effect to re-render PDF when page changes
    useEffect(() => {
    if (currentPage.pdfDoc) {
    renderPdfToImage(currentPage.pdfDoc, currentPage.currentPdfPage);
    } else {
    setPdfImage(null);
    }
    }, [currentPage.currentPdfPage, currentPage.pdfDoc]);

    // Whiteboard timer countdown logic
    useEffect(() => {
    let interval = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((s) => s - 1);
      }, 1000);
    } else if (timerActive && timerSeconds === 0) {
      setTimerActive(false);
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav');
        audio.volume = 0.5;
        audio.play();
      } catch (err) {
        console.log("Timer sound failed to play", err);
      }
      alert(language === 'ar' ? 'انتهى وقت النشاط!' : 'Whiteboard timer finished!');
    }
    return () => clearInterval(interval);
    }, [timerActive, timerSeconds, language]);

    // --- Image Upload ---
    const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (res) => {
    const img = new window.Image();
    img.src = res.target.result;
    img.onload = () => {
    const newImage = {
    id: Date.now().toString(),
    tool: 'image',
    image: img,
    x: 100,
    y: 100,
    width: 300,
    height: 300 * (img.height / img.width),
    rotation: 0
    };
    addElement(newImage);
    };
    };
    reader.readAsDataURL(file);
    };

    // --- State Helpers ---
    const addElement = (element) => {
    // Tag with current PDF page if applicable
    const elementWithPage = {
    ...element,
    pdfPage: currentPage.pdfDoc ? currentPage.currentPdfPage : undefined
    };
    const newElements = [...elements, elementWithPage];
    updateCurrentPage({
    elements: newElements,
    undoStack: [...currentPage.undoStack, elements], // Save previous state
    redoStack: []
    });
    };

    const undo = () => {
    if (currentPage.undoStack.length === 0) return;
    const previousElements = currentPage.undoStack[currentPage.undoStack.length - 1];
    const newUndoStack = currentPage.undoStack.slice(0, -1);
    updateCurrentPage({
    elements: previousElements,
    undoStack: newUndoStack,
    redoStack: [...currentPage.redoStack, elements]
    });
    };

    const redo = () => {
    if (currentPage.redoStack.length === 0) return;
    const nextElements = currentPage.redoStack[currentPage.redoStack.length - 1];
    const newRedoStack = currentPage.redoStack.slice(0, -1);
    updateCurrentPage({
    elements: nextElements,
    undoStack: [...currentPage.undoStack, elements],
    redoStack: newRedoStack
    });
    };

    const addNewPage = () => {
    addPage();
    setSelectedId(null);
    };

    const handleElementClick = (elId) => {
    if (tool === 'move') {
      setSelectedId(elId);
    } else if (tool === 'eraser') {
      const newElements = elements.filter(item => item.id !== elId);
      updateCurrentPage({
        elements: newElements,
        undoStack: [...currentPage.undoStack, elements],
        redoStack: []
      });
      setSelectedId(null);
    }
    };

    const updateSelectedElement = (updates) => {
    if (!selectedId) return;
    const newElements = elements.map(el => {
    if (el.id === selectedId) {
    return { ...el, ...updates };
    }
    return el;
    });
    updateCurrentPage({ elements: newElements });
    };

    // --- Interaction Handlers ---
    const handleMouseDown = (e) => {
    // If text input is open, let the blur event handle saving/closing. 
    if (textInput.visible) return;

    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
    setSelectedId(null);
    }

    if (tool === 'move' || tool === 'laser') {
    // Laser logic handled in MouseMove
    return;
    }

    // CRITICAL FIX: Do NOT enable drawing mode for Text, Sticky, or Emoji tools. 
    if (tool !== 'text' && tool !== 'sticky' && tool !== 'emoji') {
    isDrawing.current = true;
    }

    const pos = e.target.getStage().getPointerPosition();

    if (tool === 'pen' || tool === 'eraser' || tool === 'highlighter') {
    const id = Date.now().toString();
    // Start a new line with a tiny offset to allow instant dot rendering on single-clicks
    const newLine = {
    id,
    tool, // 'highlighter' is now a valid tool
    points: [pos.x, pos.y, pos.x + 0.1, pos.y + 0.1],
    // Highlighter is typically Yellow and Transparent-ish
    color: tool === 'eraser' ? '#000000' : (tool === 'highlighter' ? '#ffff00' : strokeColor),
    width: tool === 'eraser' ? eraserWidth : (tool === 'highlighter' ? 30 : strokeWidth),
    opacity: tool === 'highlighter' ? 0.4 : 1, // Semi-transparent
    isFreehand: true
    };
    addElement(newLine); // Use helper
    } else if (['rectangle', 'circle', 'arrow', 'line'].includes(tool)) {
    const id = Date.now().toString();
    const newShape = {
    id,
    tool,
    x: pos.x,
    y: pos.y,
    width: 0,
    height: 0,
    points: [pos.x, pos.y, pos.x, pos.y],
    color: strokeColor,
    strokeWidth: strokeWidth,
    filled: false
    };
    addElement(newShape);
    } else if (tool === 'mark-check' || tool === 'mark-cross') {
    const id = Date.now().toString();
    addElement({
    id,
    tool,
    x: pos.x - 20, // Center it roughly
    y: pos.y - 20,
    color: tool === 'mark-check' ? 'green' : 'red'
    });
    setTool('move'); // Switch back to move after placing? Or keep placing? Keep placing is better for grading.
    } else if (tool === 'emoji') {
    const id = Date.now().toString();
    addElement({
    id,
    tool: 'emoji',
    text: selectedEmoji,
    x: pos.x - 24, // Center roughly
    y: pos.y - 24,
    fontSize: 48
    });
    } else if (tool === 'text' || tool === 'sticky') {
    // Slight timeout to ensure no race conditions with previous blur
    setTimeout(() => {
    setTextInput({
    visible: true,
    x: pos.x,
    y: pos.y,
    value: '',
    fontSize: 24,
    toolType: tool // Pass 'text' or 'sticky'
    });
    }, 10);
    }
    };

    const handleMouseMove = (e) => {
    // Update Cursor Position relative to Stage
    if (stageRef.current) {
    const point = stageRef.current.getPointerPosition();
    if (point) setCursorPos(point);
    }

    if (tool === 'move' || !isDrawing.current) return;
    if (textInput.visible) return; // Don't draw if typing

    const stage = stageRef.current;
    if (!stage) return;
    const point = stage.getPointerPosition();
    if (!point) return;

    const lastElement = { ...elements[elements.length - 1] };

    if (!elements.length) return;

    if (lastElement.tool === 'pen' || lastElement.tool === 'eraser' || lastElement.tool === 'highlighter') {
    lastElement.points = lastElement.points.concat([point.x, point.y]);
    const newElements = elements.slice(0, -1);
    newElements.push(lastElement);
    updateCurrentPage({ elements: newElements });
    } else if (['rectangle', 'circle'].includes(lastElement.tool)) {
    const newWidth = point.x - lastElement.x;
    const newHeight = point.y - lastElement.y;
    lastElement.width = newWidth;
    lastElement.height = newHeight;
    const newElements = elements.slice(0, -1);
    newElements.push(lastElement);
    updateCurrentPage({ elements: newElements });
    } else if (['arrow', 'line'].includes(lastElement.tool)) {
    const newPoints = [lastElement.points[0], lastElement.points[1], point.x, point.y];
    lastElement.points = newPoints;
    const newElements = elements.slice(0, -1);
    newElements.push(lastElement);
    updateCurrentPage({ elements: newElements });
    }
    };

    const handleMouseUp = () => {
    isDrawing.current = false;
    isResizingStage.current = false;
    };

    // Global Event Listener for MouseUp/Move (outside canvas)
    useEffect(() => {
    const handleGlobalMouseUp = () => {
    isDrawing.current = false;
    isResizingStage.current = false;
    };
    const handleGlobalMouseMove = (e) => {
    if (isResizingStage.current) {
    // Calculate new dimensions
    // We need the bounding rect of the container to know offset
    const wrapper = document.querySelector('.canvas-wrapper');
    if (wrapper) {
    const rect = wrapper.getBoundingClientRect();
    // Just use mouse page coordinates? Not ideal if scrolled.
    // Simplified: Since the resize handle is on the stage, we want to set size based on mouse diff?
    // Better: Mouse position relative to wrapper top-left.
    // But wrapper is centering content.
    // Let's assume we want to size it.
    // Actually, if we resize the stage, we just update state.
    // We need to know where the stage starts.
    // For simplicity, let's just use movementX/Y if supported or track absolute.

    // Actually, let's skip complex offset logic for now and just check implementation below.
    }
    }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    // window.addEventListener('mousemove', handleGlobalMouseMove); // We'll handle resize in the wrapper's onMouseMove

    return () => {
    window.removeEventListener('mouseup', handleGlobalMouseUp);
    // window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
    }, []);

    // --- Rendering Helpers ---

    const renderBackground = () => {
    const { backgroundColor, backgroundPattern } = currentPage;
    const { width, height } = stageDimensions;
    const patternColor = '#e5e7eb'; // Light gray for patterns
    const items = [];

    // Base background
    items.push(<Rect key="bg-solid" x={0} y={0} width={width} height={height} fill={backgroundColor} listening={false} />);

    if (backgroundPattern === 'grid') {
    const gridSize = 40;
    for (let x = 0; x <= width; x += gridSize) {
    items.push(<Line key={`v-${x}`} points={[x, 0, x, height]} stroke={patternColor} strokeWidth={1} listening={false} />);
    }
    for (let y = 0; y <= height; y += gridSize) {
    items.push(<Line key={`h-${y}`} points={[0, y, width, y]} stroke={patternColor} strokeWidth={1} listening={false} />);
    }
    } else if (backgroundPattern === 'dots') {
    const gridSize = 40;
    for (let x = gridSize / 2; x < width; x += gridSize) {
    for (let y = gridSize / 2; y < height; y += gridSize) {
    items.push(<Circle key={`d-${x}-${y}`} x={x} y={y} radius={2} fill={patternColor} listening={false} />);
    }
    }
    } else if (backgroundPattern === 'lines') {
    const lineHeight = 40;
    for (let y = lineHeight; y < height; y += lineHeight) {
    items.push(<Line key={`l-${y}`} points={[0, y, width, y]} stroke={patternColor} strokeWidth={1} listening={false} />);
    }
    }
    return items;
    };

    // Renders Ink (Pen/Eraser/Highlighter)
    const renderInkElement = (el, i) => {
    const isEraser = el.tool === 'eraser';
    const isHighlighter = el.tool === 'highlighter';

    // Handle single clicks to render a visible dot
    let linePoints = el.points;
    if (linePoints && linePoints.length === 2) {
      linePoints = [linePoints[0], linePoints[1], linePoints[0] + 0.1, linePoints[1] + 0.1];
    }

    return (
    <Line
    key={el.id}
    points={linePoints}
    stroke={isEraser ? '#000000' : el.color}
    strokeWidth={el.width}
    opacity={el.opacity || 1}
    tension={0.4}
    lineCap="round"
    lineJoin="round"
    // GlobalCompositeOperation:
    // Eraser -> destination-out (cut)
    // Highlighter -> multiply (blend) or source-over with opacity
    globalCompositeOperation={isEraser ? 'destination-out' : (isHighlighter ? 'multiply' : 'source-over')}
    listening={false}
    />
    );
    };

    // Renders Objects (Shapes, Text, Images)
    const renderObjectElement = (el, i) => {
    const shapeProps = {
    key: el.id,
    id: el.id,
    stroke: el.color,
    strokeWidth: el.strokeWidth,
    onClick: () => handleElementClick(el.id),
    onTap: () => handleElementClick(el.id),
    draggable: tool === 'move',
    onDragEnd: (e) => {
    const newElements = [...elements];
    newElements[i] = { ...el, x: e.target.x(), y: e.target.y() };
    updateCurrentPage({ elements: newElements });
    }
    };

    if (el.tool === 'rectangle') return <Rect {...shapeProps} x={el.x} y={el.y} width={el.width} height={el.height} />;
    if (el.tool === 'circle') {
    return (
    <Group key={el.id} x={el.x} y={el.y} draggable={tool === 'move'}
    onClick={() => handleElementClick(el.id)}
    onTap={() => handleElementClick(el.id)}
    onDragEnd={(e) => {
    const newElements = [...elements];
    newElements[i] = { ...el, x: e.target.x(), y: e.target.y() };
    updateCurrentPage({ elements: newElements });
    }}
    >
    <Circle
    x={el.width / 2} y={el.height / 2} radius={Math.abs(el.width / 2)}
    stroke={el.color} strokeWidth={el.strokeWidth}
    scaleX={1} scaleY={Math.abs(el.height / el.width)}
    />
    </Group>
    )
    }
    if (el.tool === 'line') return <Line {...shapeProps} points={el.points} />;
    if (el.tool === 'arrow') return <Arrow {...shapeProps} points={el.points} pointerLength={10} pointerWidth={10} />;
    if (el.tool === 'image') {
    return (
    <KonvaImage
    key={el.id}
    id={el.id}
    image={el.image}
    x={el.x} y={el.y} width={el.width} height={el.height}
    draggable={tool === 'move'}
    rotation={el.rotation}
    onClick={() => handleElementClick(el.id)}
    onTap={() => handleElementClick(el.id)}
    onDragEnd={(e) => {
    const newElements = [...elements];
    newElements[i] = { ...el, x: e.target.x(), y: e.target.y() };
    updateCurrentPage({ elements: newElements });
    }}
    onTransformEnd={(e) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    const newElements = [...elements];
    newElements[i] = {
    ...el,
    x: node.x(),
    y: node.y(),
    width: Math.max(5, node.width() * scaleX),
    height: Math.max(5, node.height() * scaleY),
    rotation: node.rotation()
    };
    updateCurrentPage({ elements: newElements });
    }}
    />
    );
    }
    if (el.tool === 'mark-check') {
    // Path for check mark
    return (
    <Path
    key={el.id} id={el.id}
    x={el.x} y={el.y}
    data="M20 6L9 17l-5-5"
    stroke="green"
    strokeWidth={5}
    lineCap="round"
    lineJoin="round"
    scale={{ x: 2, y: 2 }} // Make it big
    draggable={tool === 'move'}
    onClick={() => handleElementClick(el.id)}
    onTap={() => handleElementClick(el.id)}
    onDragEnd={(e) => {
    const newElements = [...elements];
    newElements[i] = { ...el, x: e.target.x(), y: e.target.y() };
    updateCurrentPage({ elements: newElements });
    }}
    />
    );
    }
    if (el.tool === 'mark-cross') {
    // Path for cross
    return (
    <Path
    key={el.id} id={el.id}
    x={el.x} y={el.y}
    data="M18 6L6 18M6 6l12 12"
    stroke="red"
    strokeWidth={5}
    lineCap="round"
    lineJoin="round"
    scale={{ x: 2, y: 2 }}
    draggable={tool === 'move'}
    onClick={() => handleElementClick(el.id)}
    onTap={() => handleElementClick(el.id)}
    onDragEnd={(e) => {
    const newElements = [...elements];
    newElements[i] = { ...el, x: e.target.x(), y: e.target.y() };
    updateCurrentPage({ elements: newElements });
    }}
    />
    );
    }

    if (el.tool === 'sticky') {
    return (
    <Group key={el.id} x={el.x} y={el.y} draggable={tool === 'move'}
    onClick={() => handleElementClick(el.id)}
    onTap={() => handleElementClick(el.id)}
    onDragEnd={(e) => {
    const newElements = [...elements];
    newElements[i] = { ...el, x: e.target.x(), y: e.target.y() };
    updateCurrentPage({ elements: newElements });
    }}
    onDblClick={() => {
    if (tool === 'move' || tool === 'sticky' || tool === 'text') {
    setTextInput({
    visible: true,
    x: el.x, // Edit in place
    y: el.y,
    value: el.text,
    fontSize: el.fontSize || 14,
    fontStyle: el.fontStyle || 'normal',
    textDecoration: el.textDecoration || '',
    toolType: 'sticky'
    });
    // Remove old element
    const newElements = elements.filter(item => item.id !== el.id);
    updateCurrentPage({ elements: newElements });
    setTool('sticky');
    }
    }}
    >
    <Rect width={200} height={150} fill="#FFE98D" shadowColor="black" shadowBlur={5} shadowOpacity={0.3} shadowOffset={{ x: 2, y: 2 }} cornerRadius={5} />
    <Text
    x={10} y={10}
    text={el.text}
    fontSize={el.fontSize || 14}
    fontFamily="Arial"
    fill="black"
    fontStyle={el.fontStyle || 'normal'}
    textDecoration={el.textDecoration || ''}
    width={180}
    height={130}
    align="left"
    verticalAlign="top"
    listening={false} // Let the group handle clicks
    />
    </Group>
    );
    }
    if (el.tool === 'text') {
    return (
    <Text
    key={el.id} id={el.id} x={el.x} y={el.y}
    text={el.text}
    fontSize={el.fontSize}
    fill={el.color}
    fontStyle={el.fontStyle || 'normal'}
    textDecoration={el.textDecoration || ''}
    draggable={tool === 'move'}
    onClick={() => handleElementClick(el.id)}
    onTap={() => handleElementClick(el.id)}
    // Enable editing on double click
    onDblClick={() => {
    if (tool === 'move' || tool === 'text') {
    setTextInput({
    visible: true,
    x: el.x,
    y: el.y,
    value: el.text,
    fontSize: el.fontSize,
    fontStyle: el.fontStyle || 'normal',
    textDecoration: el.textDecoration || ''
    });
    // Remove old element to avoid duplication upon save
    const newElements = elements.filter(item => item.id !== el.id);
    updateCurrentPage({ elements: newElements });
    setTool('text'); // Ensure we are in text mode
    }
    }}
    onDragEnd={(e) => {
    const newElements = [...elements];
    newElements[i] = { ...el, x: e.target.x(), y: e.target.y() };
    updateCurrentPage({ elements: newElements });
    }}
    />
    );
    }
    if (el.tool === 'emoji') {
    return (
    <Text
    key={el.id} id={el.id} x={el.x} y={el.y}
    text={el.text}
    fontSize={el.fontSize || 48}
    draggable={tool === 'move'}
    onClick={() => handleElementClick(el.id)}
    onTap={() => handleElementClick(el.id)}
    onDragEnd={(e) => {
    const newElements = [...elements];
    newElements[i] = { ...el, x: e.target.x(), y: e.target.y() };
    updateCurrentPage({ elements: newElements });
    }}
    />
    );
    }
    return null;
    };;

    // --- Transformer Update ---
    useEffect(() => {
    if (selectedId && transformerRef.current && stageRef.current) {
    const node = stageRef.current.findOne('#' + selectedId);
    if (node) {
    transformerRef.current.nodes([node]);
    transformerRef.current.getLayer().batchDraw();
    }
    } else if (transformerRef.current) {
    transformerRef.current.nodes([]);
    transformerRef.current.getLayer().batchDraw();
    }
    }, [selectedId, elements]);

    // --- Context Menu Logic ---
    const handleContextMenu = (e) => {
    e.evt.preventDefault(); // Stop default browser menu

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();

    let targetId = null;
    // Check if target is a shape (has ID) and is not the Stage/Background
    if (e.target !== stage && e.target.attrs.id) {
    targetId = e.target.attrs.id;
    setSelectedId(targetId);
    } else {
    setSelectedId(null);
    }

    setContextMenu({
    visible: true,
    x: pointer.x + 20, // Offset
    y: pointer.y + 20,
    targetId: targetId
    });
    };

    const handleContextAction = (action) => {
    if (action === 'copy') {
    if (contextMenu.targetId) {
    const element = elements.find(el => el.id === contextMenu.targetId);
    if (element) {
    setClipboard({ ...element });
    }
    }
    } else if (action === 'paste') {
    if (clipboard) {
    const newId = Date.now().toString() + Math.random().toString().slice(2);
    const offset = 20;
    let newElement = { ...clipboard, id: newId };

    if (newElement.points) { // Ink
    newElement.points = newElement.points.map((p, i) => p + offset);
    } else { // Shape/Text
    newElement.x = (contextMenu.targetId ? clipboard.x : contextMenu.x) + offset;
    newElement.y = (clipboard.y) + offset;
    // Fallback to clipboard pos + offset for simplicity
    newElement.x = clipboard.x + offset;
    newElement.y = clipboard.y + offset;
    }
    addElement(newElement);
    }
    } else if (action === 'delete') {
    if (contextMenu.targetId) {
    const newElements = elements.filter(el => el.id !== contextMenu.targetId);
    updateCurrentPage({ elements: newElements });
    setSelectedId(null);
    }
    }
    setContextMenu({ ...contextMenu, visible: false });
    };

    // --- Snapshot & Recording ---
    const handleSnapshot = () => {
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    };

    const commitTextInput = (e) => {
    // Prevent race conditions / double submits
    if (!textInput.visible) return;

    const finalValue = e.target.value;
    const toolType = textInput.toolType || 'text';
    const newId = Date.now().toString() + Math.random().toString().slice(2);

    setTextInput({ ...textInput, visible: false, value: '' });

    if (finalValue.trim()) {
    if (toolType === 'sticky') {
    addElement({
    id: newId,
    tool: 'sticky',
    text: finalValue,
    x: textInput.x,
    y: textInput.y,
    width: 200,
    height: 150,
    color: '#FFE98D',
    fontSize: textInput.fontSize || 14,
    fontStyle: textInput.fontStyle || 'normal',
    textDecoration: textInput.textDecoration || ''
    });
    } else {
    addElement({
    id: newId,
    tool: 'text',
    text: finalValue,
    x: textInput.x,
    y: textInput.y,
    color: strokeColor,
    fontSize: textInput.fontSize,
    // Use state values, fallback to normal if undefined
    fontStyle: textInput.fontStyle || 'normal',
    textDecoration: textInput.textDecoration || ''
    });
    }
    setSelectedId(newId);
    }
    setTool('move');
    };

    return (
    <div className="whiteboard-container" onClick={() => { if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false }) }}>
    {/* Toolbar Area */}
    <div className={`whiteboard-toolbar ${showSidebar ? '' : 'collapsed'}`}>
    {/* Board Pages Management */}
    <div className="toolbar-section">
    <h4 className="toolbar-label">Board Pages</h4>
    <div className="flex items-center justify-between gap-2">
    <button className="action-btn" onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))} disabled={currentPageIndex === 0}>
    <ChevronLeft size={16} />
    </button>
    <span className="text-sm font-bold bg-gray-100 px-3 py-1 rounded">
    {currentPageIndex + 1} / {pages.length}
    </span>
    <button className="action-btn" onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))} disabled={currentPageIndex === pages.length - 1}>
    <ChevronRight size={16} />
    </button>
    <button className="action-btn text-blue-600" onClick={addNewPage} title="New Page">
    <Files size={18} />
    </button>
    </div>
    </div>

    {/* Text Formatting (Priority Display) */}
    {/* Show if: (Text Selected OR Text Input Active) AND Tool is NOT Drawing/Erasing */}
    {((selectedId && elements.find(el => el.id === selectedId)?.tool === 'text') || textInput.visible) && !['pen', 'eraser', 'highlighter', 'laser'].includes(tool) && (
    <div className="toolbar-section">
    <h4 className="toolbar-label">Text Options</h4>
    <div className="flex gap-2">
    {/* Bold */}
    <button className={`action-btn ${(textInput.visible ? textInput.fontStyle : elements.find(el => el.id === selectedId)?.fontStyle)?.includes('bold') ? 'active-tool' : ''}`}
    onClick={() => {
    const isEditing = textInput.visible;
    const currentStyle = isEditing ? (textInput.fontStyle || 'normal') : (elements.find(e => e.id === selectedId)?.fontStyle || 'normal');

    const isBold = currentStyle.includes('bold');
    const isItalic = currentStyle.includes('italic');

    let newStyle = 'normal';
    if (!isBold && isItalic) newStyle = 'bold italic';
    else if (!isBold && !isItalic) newStyle = 'bold';
    else if (isBold && isItalic) newStyle = 'italic';
    else if (isBold && !isItalic) newStyle = 'normal';

    if (isEditing) setTextInput({ ...textInput, fontStyle: newStyle });
    else updateSelectedElement({ fontStyle: newStyle });
    }}
    >
    <Bold size={18} />
    </button>

    {/* Italic */}
    <button className={`action-btn ${(textInput.visible ? textInput.fontStyle : elements.find(el => el.id === selectedId)?.fontStyle)?.includes('italic') ? 'active-tool' : ''}`}
    onClick={() => {
    const isEditing = textInput.visible;
    const currentStyle = isEditing ? (textInput.fontStyle || 'normal') : (elements.find(e => e.id === selectedId)?.fontStyle || 'normal');

    const isBold = currentStyle.includes('bold');
    const isItalic = currentStyle.includes('italic');

    let newStyle = 'normal';
    if (isItalic && isBold) newStyle = 'bold';
    else if (isItalic && !isBold) newStyle = 'normal';
    else if (!isItalic && isBold) newStyle = 'italic bold';
    else if (!isItalic && !isBold) newStyle = 'italic';

    if (isEditing) setTextInput({ ...textInput, fontStyle: newStyle });
    else updateSelectedElement({ fontStyle: newStyle });
    }}
    >
    <Italic size={18} />
    </button>

    {/* Underline */}
    <button className={`action-btn ${(textInput.visible ? textInput.textDecoration : elements.find(el => el.id === selectedId)?.textDecoration) === 'underline' ? 'active-tool' : ''}`}
    onClick={() => {
    const isEditing = textInput.visible;
    const currentDeco = isEditing ? (textInput.textDecoration || '') : (elements.find(e => e.id === selectedId)?.textDecoration || '');
    const newDeco = currentDeco === 'underline' ? '' : 'underline';

    if (isEditing) setTextInput({ ...textInput, textDecoration: newDeco });
    else updateSelectedElement({ textDecoration: newDeco });
    }}
    >
    <Underline size={18} />
    </button>

    {/* Font Size Removed */}
    </div>
    </div>
    )}

    {/* Tools */}
    <div className="toolbar-section">
    <h4 className="toolbar-label">{t('tools')}</h4>
    <div className="tool-buttons">
    <button className={`tool-btn ${tool === 'pen' ? 'active' : ''}`} onClick={() => setTool('pen')} title={t('pen')}>
    <Pencil size={20} />
    </button>
    <button className={`tool-btn ${tool === 'highlighter' ? 'active' : ''}`} onClick={() => setTool('highlighter')} title="Highlighter">
    <Highlighter size={20} />
    </button>
    <button className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`} onClick={() => setTool('eraser')} title={t('eraser')}>
    <Eraser size={20} />
    </button>
    <button className={`tool-btn ${tool === 'move' ? 'active' : ''}`} onClick={() => setTool('move')} title={t('move')}>
    <MousePointer2 size={20} />
    </button>
    <button className={`tool-btn ${tool === 'laser' ? 'active' : ''}`} onClick={() => setTool('laser')} title="Laser Pointer">
    <Zap size={20} />
    </button>
    <button className={`tool-btn ${tool === 'text' ? 'active' : ''}`} onClick={() => setTool('text')} title={t('text')}>
    <Type size={20} />
    </button>
    <button className={`tool-btn ${tool === 'sticky' ? 'active' : ''}`} onClick={() => setTool('sticky')} title="Sticky Note">
    <StickyNote size={20} />
    </button>
    <button className={`tool-btn ${tool === 'rectangle' ? 'active' : ''}`} onClick={() => setTool('rectangle')} title={t('rectangle')}>
    <Square size={20} />
    </button>
    <button className={`tool-btn ${tool === 'circle' ? 'active' : ''}`} onClick={() => setTool('circle')} title={t('circle')}>
    <CircleIcon size={20} />
    </button>
    <button className={`tool-btn ${tool === 'arrow' ? 'active' : ''}`} onClick={() => setTool('arrow')} title={t('arrow')}>
    <ArrowRight size={20} />
    </button>
    <button className={`tool-btn ${tool === 'line' ? 'active' : ''}`} onClick={() => setTool('line')} title={t('line')}>
    <Minus size={20} />
    </button>
    <div className="w-px h-6 bg-gray-300 mx-1"></div>
    <button className={`tool-btn ${tool === 'mark-check' ? 'active' : ''} text-green-600`} onClick={() => setTool('mark-check')} title="Correct">
    <Check size={20} />
    </button>
    <button className={`tool-btn ${tool === 'mark-cross' ? 'active' : ''} text-red-600`} onClick={() => setTool('mark-cross')} title="Wrong">
    <X size={20} />
    </button>
    </div>
    </div>

    {/* Colors */}
    <div className="toolbar-section">
    <h4 className="toolbar-label">{t('color')}</h4>
    <div className="color-picker">
    {['#000000', '#ffffff', '#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'].map(c => (
    <button
    key={c}
    className={`color-btn ${strokeColor === c ? 'active' : ''}`}
    style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #ddd' : 'none' }}
    onClick={() => {
    setStrokeColor(c);
    // Also apply to selected element if valid
    if (selectedId) updateSelectedElement({ color: c });
    }}
    />
    ))}
    <label className="color-btn" style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
    <input
    type="color"
    value={strokeColor}
    onChange={(e) => {
    setStrokeColor(e.target.value);
    if (selectedId) updateSelectedElement({ color: e.target.value });
    }}
    style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
    />
    </label>
    </div>
    </div>

    {/* Text Formatting (Only if text selected) */}
    {false && (
    <div className="toolbar-section">
    <h4 className="toolbar-label">Format Text</h4>
    <div className="flex gap-2">
    <button className={`action-btn ${elements.find(el => el.id === selectedId).fontStyle?.includes('bold') ? 'active-tool' : ''}`}
    onClick={() => {
    const el = elements.find(e => e.id === selectedId);
    const isBold = el.fontStyle?.includes('bold');
    const isItalic = el.fontStyle?.includes('italic');
    let newStyle = 'normal';
    if (!isBold && isItalic) newStyle = 'bold italic';
    else if (!isBold && !isItalic) newStyle = 'bold';
    else if (isBold && isItalic) newStyle = 'italic';
    else if (isBold && !isItalic) newStyle = 'normal';

    updateSelectedElement({ fontStyle: newStyle });
    }}
    >
    <Bold size={18} />
    </button>
    <button className={`action-btn ${elements.find(el => el.id === selectedId).fontStyle?.includes('italic') ? 'active-tool' : ''}`}
    onClick={() => {
    const el = elements.find(e => e.id === selectedId);
    const isBold = el.fontStyle?.includes('bold');
    const isItalic = el.fontStyle?.includes('italic');
    let newStyle = 'normal';
    if (isItalic && isBold) newStyle = 'bold';
    else if (isItalic && !isBold) newStyle = 'normal';
    else if (!isItalic && isBold) newStyle = 'italic bold';
    else if (!isItalic && !isBold) newStyle = 'italic';

    updateSelectedElement({ fontStyle: newStyle });
    }}
    >
    <Italic size={18} />
    </button>
    <button className={`action-btn ${elements.find(el => el.id === selectedId).textDecoration === 'underline' ? 'active-tool' : ''}`}
    onClick={() => {
    const el = elements.find(e => e.id === selectedId);
    updateSelectedElement({ textDecoration: el.textDecoration === 'underline' ? '' : 'underline' });
    }}
    >
    <Underline size={18} />
    </button>
    {/* Font Size for Text */}
    <input
    type="number"
    className="w-16 p-1 border rounded"
    value={elements.find(el => el.id === selectedId).fontSize || 24}
    onChange={(e) => updateSelectedElement({ fontSize: parseInt(e.target.value) })}
    />
    </div>
    </div>
    )}

    {/* Stroke/Eraser Size (Hidden if Text Active) */}
    {!((selectedId && elements.find(el => el.id === selectedId)?.tool === 'text') || textInput.visible) && (
    <div className="toolbar-section">
    <h4 className="toolbar-label">{tool === 'eraser' ? t('size') + ' (Eraser)' : t('size')}</h4>
    <div className="flex gap-2 items-center">
    <input
    type="range" min="1" max="50"
    value={tool === 'eraser' ? eraserWidth : strokeWidth}
    onChange={(e) => {
    const val = parseInt(e.target.value);
    if (tool === 'eraser') setEraserWidth(val);
    else setStrokeWidth(val);
    }}
    className="stroke-slider"
    />
    <span className="text-sm font-bold w-6 text-center">{tool === 'eraser' ? eraserWidth : strokeWidth}</span>
    </div>
    </div>
    )}

    {/* PDF Controls */}
    {currentPage.pdfDoc && (
    <div className="toolbar-section">
    <h4 className="toolbar-label">PDF</h4>
    <div className="flex gap-2 items-center">
    <button className="action-btn" disabled={currentPage.currentPdfPage <= 1} onClick={() => updateCurrentPage({ currentPdfPage: currentPage.currentPdfPage - 1 })}>
    <ChevronLeft size={16} />
    </button>
    <span className="text-sm font-bold">{currentPage.currentPdfPage} / {currentPage.pdfDoc.numPages}</span>
    <button className="action-btn" disabled={currentPage.currentPdfPage >= currentPage.pdfDoc.numPages} onClick={() => updateCurrentPage({ currentPdfPage: currentPage.currentPdfPage + 1 })}>
    <ChevronRight size={16} />
    </button>
    {/* PDF Zoom */}
    <div className="w-px h-6 bg-gray-300 mx-1"></div>
    <button className="action-btn" onClick={() => updateCurrentPage({ pdfScale: (currentPage.pdfScale || 1) - 0.1 })} title="Zoom Out">
    <ZoomOut size={16} />
    </button>
    <span className="text-xs w-8 text-center">{Math.round((currentPage.pdfScale || 1) * 100)}%</span>
    <button className="action-btn" onClick={() => updateCurrentPage({ pdfScale: (currentPage.pdfScale || 1) + 0.1 })} title="Zoom In">
    <ZoomIn size={16} />
    </button>
    </div>
    </div>
    )}

    {/* Background Settings */}
    <div className="toolbar-section">
    <h4 className="toolbar-label">Background</h4>
    <div className="flex gap-2 mb-2">
    {/* Patterns */}
    <button className={`action-btn ${currentPage.backgroundPattern === 'solid' ? 'active-tool' : ''}`}
    onClick={() => updateCurrentPage({ backgroundPattern: 'solid' })} title="Solid">
    <Square size={18} fill={currentPage.backgroundPattern === 'solid' ? 'currentColor' : 'none'} />
    </button>
    <button className={`action-btn ${currentPage.backgroundPattern === 'grid' ? 'active-tool' : ''}`}
    onClick={() => updateCurrentPage({ backgroundPattern: 'grid' })} title="Grid">
    <Grid size={18} />
    </button>
    <button className={`action-btn ${currentPage.backgroundPattern === 'dots' ? 'active-tool' : ''}`}
    onClick={() => updateCurrentPage({ backgroundPattern: 'dots' })} title="Dots">
    <CircleIcon size={18} />
    </button>
    <button className={`action-btn ${currentPage.backgroundPattern === 'lines' ? 'active-tool' : ''}`}
    onClick={() => updateCurrentPage({ backgroundPattern: 'lines' })} title="Lines">
    <AlignJustify size={18} />
    </button>
    </div>
    {/* Background Colors */}
    <div className="color-picker" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
    {['#ffffff', '#f3f4f6', '#fff1f2', '#ecfdf5', '#eff6ff', '#fffbeb', '#111827'].map(c => (
    <button
    key={c}
    className={`color-btn ${currentPage.backgroundColor === c ? 'active' : ''}`}
    style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #ddd' : 'none', width: '20px', height: '20px' }}
    onClick={() => updateCurrentPage({ backgroundColor: c })}
    />
    ))}
    <label className="color-btn" style={{ background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', width: '20px', height: '20px' }}>
    <input
    type="color"
    value={currentPage.backgroundColor}
    onChange={(e) => updateCurrentPage({ backgroundColor: e.target.value })}
    style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
    />
    </label>
    </div>
    </div>

    {/* Emojis & Stickers */}
    <div className="toolbar-section">
    <h4 className="toolbar-label">{language === 'ar' ? 'الملصقات والتفاعل' : 'Stickers & Reactions'}</h4>
    <div className="flex gap-1.5 flex-wrap">
    {emojis.map(emoji => (
    <button
    key={emoji}
    className={`action-btn text-xl ${tool === 'emoji' && selectedEmoji === emoji ? 'active-tool' : ''}`}
    style={{ minWidth: '36px', height: '36px', padding: 0 }}
    onClick={() => {
    setTool('emoji');
    setSelectedEmoji(emoji);
    }}
    >
    {emoji}
    </button>
    ))}
    </div>
    </div>

    {/* Whiteboard Timer */}
    <div className="toolbar-section">
    <h4 className="toolbar-label">{language === 'ar' ? 'مؤقت السبورة' : 'Whiteboard Timer'}</h4>
    <div className="flex items-center gap-2">
     {timerSeconds > 0 ? (
    <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 px-4 py-2 rounded-full font-mono font-bold">
    <div className={`w-3 h-3 rounded-full ${timerActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
    <span className="text-blue-600 dark:text-blue-400" style={{ fontSize: '1.25rem', minWidth: '60px', textAlign: 'center' }}>
      {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:{(timerSeconds % 60).toString().padStart(2, '0')}
    </span>
    <div className="w-px h-5 bg-gray-300 dark:bg-gray-700" />
    <button className="text-sm text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors" onClick={() => setTimerActive(!timerActive)}>
    {timerActive ? (language === 'ar' ? 'إيقاف' : 'Pause') : (language === 'ar' ? 'تشغيل' : 'Start')}
    </button>
    <button className="text-sm text-red-500 font-bold hover:text-red-600 transition-colors" onClick={() => { setTimerSeconds(0); setTimerInitialDuration(0); setTimerActive(false); }}>
    {language === 'ar' ? 'إعادة' : 'Reset'}
    </button>
    </div>
    ) : (
    <div className="flex items-center gap-2">
    <input
    type="number"
    min="1"
    max="60"
    className="w-12 p-1 text-center border rounded text-sm dark:bg-gray-800 dark:border-gray-700"
    style={{ color: 'var(--text-primary)', background: 'var(--bg-primary)' }}
    value={timerMinutesInput}
    onChange={(e) => setTimerMinutesInput(Math.max(1, parseInt(e.target.value) || 1))}
    />
    <span className="text-xs text-secondary">{language === 'ar' ? 'دقيقة' : 'min'}</span>
    <button className="action-btn text-xs font-bold px-2 py-1 bg-blue-500 text-white rounded" style={{ height: '30px', width: 'auto' }} onClick={() => {
    const secs = timerMinutesInput * 60;
    setTimerSeconds(secs);
    setTimerInitialDuration(secs);
    setTimerActive(true);
    }}>
    {language === 'ar' ? 'بدء' : 'Start'}
    </button>
    </div>
    )}
    </div>
    </div>

    {/* Actions */}
    <div className="toolbar-section">
    <h4 className="toolbar-label">{t('actions')}</h4>
    <div className="action-buttons">
    <button className="action-btn" onClick={undo}><RotateCcw size={18} /></button>
    <button className="action-btn" onClick={redo}><RotateCw size={18} /></button>
    <button className="action-btn" onClick={handleSnapshot} title="Take Snapshot"><Camera size={18} /></button>
    <label className="action-btn cursor-pointer" title="Add Image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
    handleImageUpload(e);
    e.target.value = ''; // Reset to allow re-upload
    }} />
    <ImageIcon size={18} />
    </label>
    <label className="action-btn cursor-pointer" title="Upload PDF" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(e) => {
    handlePdfUpload(e);
    e.target.value = ''; // Reset
    }} />
    <Upload size={18} />
    </label>
    <button className="action-btn danger" onClick={() => {
    if (window.confirm(language === 'ar' ? 'هل تريد مسح الرسومات من هذه الصفحة؟' : 'Clear drawings from this page?')) {
    // If PDF is active, remove only elements on CURRENT PDF page
    if (currentPage.pdfDoc) {
    const keptElements = elements.filter(el => {
    const p = el.pdfPage || 1;
    return p !== currentPage.currentPdfPage;
    });
    updateCurrentPage({ elements: keptElements });
    } else {
    // No PDF, clear all
    updateCurrentPage({ elements: [] });
    }
    }
    }} title={language === 'ar' ? 'مسح الرسومات' : 'Clear Drawings'}>
    <Trash2 size={18} />
    </button>
    <button className="action-btn danger" onClick={() => {
    if (window.confirm(language === 'ar' ? 'هل تريد مسح كل شيء (بما في ذلك ملف PDF)؟' : 'Clear everything (including PDF)?')) {
    updateCurrentPage({
    pdfDoc: null,
    currentPdfPage: 1,
    elements: [],
    undoStack: [],
    redoStack: []
    });
    setPdfImage(null);
    }
    }} title={language === 'ar' ? 'مسح الكل' : 'Clear Everything'}>
    <RotateCcw size={18} />
    </button>
    </div>
    </div>

    </div>

    {/* Main Stage Area */}
    <div className="canvas-wrapper card relative overflow-hidden"
    style={{
    minHeight: '800px',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px' // Add padding to allow expansion space
    }}
    onContextMenu={(e) => e.preventDefault()} // Block native globally in wrapper
    // Handle resize drag
    onMouseMove={(e) => {
    // CRITICAL SAFETY: If mouse button is not pressed, force stop everything
    if (e.buttons === 0 && (isDrawing.current || isResizingStage.current)) {
    isDrawing.current = false;
    isResizingStage.current = false;
    }

    // Update Cursor Position relative to Stage (for tools)
    if (stageRef.current) {
    const point = stageRef.current.getPointerPosition();
    if (point) setCursorPos(point);
    }

    if (isResizingStage.current) {
    const container = document.getElementById('stage-container');
    if (container) {
    const rect = container.getBoundingClientRect();
    const newWidth = Math.max(100, e.clientX - rect.left);
    const newHeight = Math.max(100, e.clientY - rect.top);
    setStageDimensions({ width: newWidth, height: newHeight });
    }
    } else {
    handleMouseMove(e);
    }
    }}
    onMouseUp={() => {
    handleMouseUp();
    }}
    >


    <div
    id="stage-container"
    style={{
    position: 'relative',
    width: stageDimensions.width,
    height: stageDimensions.height,
    boxShadow: '0 0 20px rgba(0,0,0,0.1)' // Add shadow to distinguish paper
    }}
    >
    <Stage
    width={stageDimensions.width}
    height={stageDimensions.height}
    ref={stageRef}
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onTouchStart={handleMouseDown}
    onTouchMove={handleMouseMove}
    onTouchEnd={handleMouseUp}
    onContextMenu={handleContextMenu}
    style={{
    background: currentPage.backgroundColor,
    borderRadius: '8px',
    cursor: (tool === 'pen' || tool === 'eraser') ? 'none' : (tool === 'text' ? 'text' : 'default')
    }}
    >
    <Layer>
    {/* Background & PDF Layer (Lowest) */}
    {renderBackground()}

    {pdfImage && (
    <KonvaImage
    image={pdfImage}
    width={pdfImage.width * 0.5 * (currentPage.pdfScale || 1)}
    height={pdfImage.height * 0.5 * (currentPage.pdfScale || 1)}
    x={(stageDimensions.width - (pdfImage.width * 0.5 * (currentPage.pdfScale || 1))) / 2}
    y={20}
    />
    )}
    </Layer>

    <Layer>
    {/* Combined Objects and Ink Layer - Erasable */}
    {elements.map((el, i) => {
    // Filter process:
    // If PDF is loaded, check page match. Treat undefined page as Page 1.
    if (currentPage.pdfDoc) {
    const targetPage = el.pdfPage || 1;
    if (targetPage !== currentPage.currentPdfPage) return null;
    }
    return (['pen', 'eraser', 'highlighter'].includes(el.tool)
      ? renderInkElement(el, i)
      : renderObjectElement(el, i));
    })}
    <Transformer ref={transformerRef} />
    </Layer>
    </Stage>

    {/* Eraser Cursor Overlay */}
    {tool === 'eraser' && (
    <div className="eraser-cursor" style={{
    position: 'absolute',
    left: cursorPos.x,
    top: cursorPos.y,
    width: eraserWidth + 'px',
    height: eraserWidth + 'px',
    borderRadius: '50%',
    border: '2px solid rgba(0,0,0,0.5)',
    backgroundColor: 'rgba(255,255,255,0.3)',
    pointerEvents: 'none',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 0 4px rgba(0,0,0,0.2)',
    zIndex: 100
    }} />
    )}

    {/* Pen/Highlighter Cursor Overlay */}
    {(tool === 'pen' || tool === 'highlighter') && (
    <div style={{
    position: 'absolute',
    left: cursorPos.x, top: cursorPos.y,
    width: (tool === 'highlighter' ? 30 : strokeWidth) + 'px',
    height: (tool === 'highlighter' ? 30 : strokeWidth) + 'px',
    borderRadius: '50%',
    backgroundColor: tool === 'highlighter' ? '#ffff00' : strokeColor,
    opacity: tool === 'highlighter' ? 0.5 : 1,
    pointerEvents: 'none',
    transform: 'translate(-50%, -50%)',
    zIndex: 100
    }} />
    )}

    {/* Laser Pointer Overlay */}
    {tool === 'laser' && (
    <div style={{
    position: 'absolute',
    left: cursorPos.x, top: cursorPos.y,
    width: '10px', height: '10px',
    borderRadius: '50%',
    backgroundColor: 'red',
    boxShadow: '0 0 10px 4px red', // Glow effect
    pointerEvents: 'none',
    transform: 'translate(-50%, -50%)',
    zIndex: 200,
    transition: 'top 0.05s linear, left 0.05s linear' // Smooth movement
    }} />
    )}

    {/* Default cursor for other tools? */}
    {/* Default cursor for other tools? */}
    {(tool !== 'pen' && tool !== 'eraser' && tool !== 'highlighter' && tool !== 'laser') && (
    <div style={{
    position: 'absolute',
    left: cursorPos.x, top: cursorPos.y,
    pointerEvents: 'none',
    transform: 'translate(-5px, -5px)', // Approximation for standard pointer? 
    // Actually standard pointer is better handled by CSS cursor: auto.
    // But we set cursor: none on Stage.
    // So we should revert cursor to auto for non-drawing tools, or render a cursor icon.
    }} />
    )}

    {/* Text Input Overlay */}
    {/* Moved INSIDE the relative container to match Stage coordinates */}
    {textInput.visible && (
    <textarea
    defaultValue={textInput.value}
    style={{
    position: 'absolute',
    top: textInput.y, // Removed generic offset, let it be exact
    left: textInput.x,
    fontSize: `${textInput.fontSize}px`,
    border: '2px solid #3b82f6',
    padding: '8px',
    lineHeight: 1,
    color: '#000000', // Always black while typing for clarity
    zIndex: 2000, // Very high Z-Index
    minWidth: '150px',
    minHeight: '50px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    borderRadius: '4px'
    }}
    // Removed onChange to prevent massive re-renders of the Stage
    onKeyDown={(e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault(); // Stop newline
    commitTextInput(e);
    }
    }}
    autoFocus
    onBlur={(e) => commitTextInput(e)}
    />
    )}

    {/* Resize Handle */}
    <div
    className="resize-handle"
    style={{
    position: 'absolute',
    right: '-15px',
    bottom: '-15px',
    width: '30px',
    height: '30px',
    cursor: 'nwse-resize',
    background: '#3b82f6',
    borderRadius: '50%',
    zIndex: 3000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 5px rgba(0,0,0,0.2)'
    }}
    onMouseDown={(e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation(); // Hard stop
    isResizingStage.current = true;
    isDrawing.current = false; // Ensure drawing is off
    }}
    onTouchStart={(e) => {
    e.stopPropagation();
    isResizingStage.current = true;
    isDrawing.current = false;
    }}
    >
    <MoveDiagonal size={16} color="white" />
    </div>

    {/* Context Menu */}
    {contextMenu.visible && (
    <div style={{
    position: 'absolute',
    top: contextMenu.y,
    left: contextMenu.x,
    backgroundColor: '#1f2937', // Dark gray
    border: '1px solid #374151',
    borderRadius: '6px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
    padding: '4px',
    zIndex: 3000,
    display: 'flex', // Vertical list
    flexDirection: 'column',
    gap: '2px',
    minWidth: '120px'
    }}
    onMouseDown={(e) => e.stopPropagation()} // Prevent closing immediately
    >
    {contextMenu.targetId ? (
    <>
    <button className="context-menu-btn"
    style={{ padding: '8px 12px', color: '#e5e7eb', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
    onClick={() => handleContextAction('copy')}
    >
    Copy
    </button>
    <button className="context-menu-btn"
    style={{ padding: '8px 12px', color: '#f87171', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
    onClick={() => handleContextAction('delete')}
    >
    Delete
    </button>
    </>
    ) : (
    // Empty space clicked
    <button className="context-menu-btn"
    disabled={!clipboard}
    style={{
    padding: '8px 12px',
    color: clipboard ? '#e5e7eb' : '#6b7280',
    textAlign: 'left', background: 'transparent', border: 'none', cursor: clipboard ? 'pointer' : 'default', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px'
    }}
    onClick={() => handleContextAction('paste')}
    >
    Paste
    </button>
    )}

    {/* Always show paste if valid clipboard, even on target? Maybe not to keep cleaning. Stick to above logic */}
    {contextMenu.targetId && clipboard && (
    <>
    <div style={{ height: '1px', background: '#374151', margin: '2px 0' }} />
    <button className="context-menu-btn"
    style={{ padding: '8px 12px', color: '#e5e7eb', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
    onClick={() => handleContextAction('paste')}
    >
    Paste
    </button>
    </>
    )}
    </div>
    )}
    </div>

    {/* PDF Loading Indicator */}
    {isPdfLoading && (
    <div style={{
    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white', zIndex: 50
    }}>
    <div className="loader"></div>
    <p>Loading PDF...</p>
    </div>
    )}
    </div>
    </div>
    );
};

export default Whiteboard;
