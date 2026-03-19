import {
  useState, useRef, useEffect, useCallback, type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { useParams, Link } from 'react-router-dom';
import { Stage, Layer, Rect, Circle, Text, Arrow, Group, Transformer } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useSocket } from '@/context/SocketContext';
import { useAuthStore } from '@/stores/auth';
import type { WBElement, WBTool } from '@/types/socket';
import {
  MousePointer2, StickyNote, Type, Square, Circle as CircleIcon,
  Minus, Undo2, Redo2, Download, ZoomIn, ZoomOut,
  Trash2, ArrowLeft, LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── Constants ──────────────────────────────────────────────────────────────────
const STICKY_COLORS = ['#FFE066', '#FF8FAB', '#70D7C7', '#A78BFA', '#FFA94D', '#74C0FC'];
const SHAPE_COLORS  = ['#6366f1', '#10b981', '#f43f5e', '#f97316', '#06b6d4', '#8b5cf6'];
const MIN_SCALE = 0.1;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.1;

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function defaultElement(
  type: WBElement['type'],
  x: number,
  y: number,
  color: string,
): WBElement {
  const base = { id: genId(), type, x, y, rotation: 0, strokeColor: '#1D1E2B', fontSize: 14, content: '', color };
  switch (type) {
    case 'sticky': return { ...base, width: 160, height: 120, content: 'Note', strokeColor: '#333', fontSize: 13 };
    case 'text':   return { ...base, width: 160, height: 40, content: 'Text', color: 'transparent', strokeColor: '#EEEFFC', fontSize: 16 };
    case 'rect':   return { ...base, width: 120, height: 80 };
    case 'circle': return { ...base, width: 80, height: 80 };
    case 'arrow':  return { ...base, width: 0, height: 0, points: [x, y, x + 120, y] };
    default:       return { ...base, width: 120, height: 80 };
  }
}

// ── API helpers ────────────────────────────────────────────────────────────────
const wbKeys = {
  detail: (projectId: string) => ['whiteboard', projectId] as const,
};

// ── Main component ─────────────────────────────────────────────────────────────
export default function WhiteboardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const socket = useSocket();
  const user = useAuthStore((s) => s.user);
  // ── Canvas state ─────────────────────────────────────────────────────────────
  const [elements, setElements]     = useState<WBElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool]             = useState<WBTool>('select');
  const [scale, setScale]           = useState(1);
  const [stagePos, setStagePos]     = useState({ x: 0, y: 0 });
  const [activeColor, setActiveColor] = useState<string>(STICKY_COLORS[0] ?? '#FFE066');

  // Drawing state (rect / circle / arrow drag)
  const [drawing, setDrawing]     = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [draft, setDraft]         = useState<WBElement | null>(null);

  // Inline text editing
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editValue, setEditValue]   = useState('');
  const textareaRef                 = useRef<HTMLTextAreaElement>(null);

  // Undo/Redo
  const history    = useRef<WBElement[][]>([[]]);
  const historyIdx = useRef(0);

  // Konva refs
  const stageRef       = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeRefs       = useRef<Map<string, Konva.Node>>(new Map());

  // Container measurement
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 600 });

  // Debounce save ref
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPanning = useRef(false);
  const panStart  = useRef({ x: 0, y: 0, stageX: 0, stageY: 0 });

  // ── Resize observer ───────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? { width: 800, height: 600 };
      setDims({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Load whiteboard ───────────────────────────────────────────────────────────
  const { data: wbData } = useQuery({
    queryKey: wbKeys.detail(projectId!),
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/whiteboard`);
      return res.data.data as { elements: WBElement[] };
    },
    enabled: !!projectId,
  });

  // Populate elements once data arrives (only on initial load)
  const loadedRef = useRef(false);
  useEffect(() => {
    if (wbData && !loadedRef.current) {
      loadedRef.current = true;
      const els = wbData.elements ?? [];
      setElements(els);
      history.current = [els];
      historyIdx.current = 0;
    }
  }, [wbData]);

  // ── Save mutation ─────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (els: WBElement[]) =>
      api.put(`/projects/${projectId}/whiteboard`, { elements: els }),
  });

  // ── Auto-save (debounced 2s) ──────────────────────────────────────────────────
  const scheduleSave = useCallback((els: WBElement[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveMutation.mutate(els);
    }, 2000);
  }, [saveMutation]);

  // ── History helpers ───────────────────────────────────────────────────────────
  const pushHistory = useCallback((els: WBElement[]) => {
    const idx = historyIdx.current;
    history.current = [...history.current.slice(0, idx + 1), els];
    historyIdx.current = history.current.length - 1;
  }, []);

  const commit = useCallback((els: WBElement[]) => {
    setElements(els);
    pushHistory(els);
    scheduleSave(els);
    // Broadcast to collaborators
    if (projectId) {
      socket?.emit('whiteboard:update', { projectId, elements: els });
    }
  }, [pushHistory, scheduleSave, projectId, socket]);

  const undo = useCallback(() => {
    if (historyIdx.current <= 0) return;
    historyIdx.current -= 1;
    const els = history.current[historyIdx.current] ?? [];
    setElements(els);
    scheduleSave(els);
    if (projectId) socket?.emit('whiteboard:update', { projectId, elements: els });
  }, [scheduleSave, projectId, socket]);

  const redo = useCallback(() => {
    if (historyIdx.current >= history.current.length - 1) return;
    historyIdx.current += 1;
    const els = history.current[historyIdx.current] ?? [];
    setElements(els);
    scheduleSave(els);
    if (projectId) socket?.emit('whiteboard:update', { projectId, elements: els });
  }, [scheduleSave, projectId, socket]);

  // ── Real-time: receive updates from collaborators ─────────────────────────────
  useEffect(() => {
    if (!socket || !projectId) return;
    socket.emit('room:join', projectId);

    const handler = (payload: { projectId: string; elements: WBElement[]; updatedBy: string }) => {
      if (payload.projectId !== projectId) return;
      if (payload.updatedBy === user?.id) return; // own update, skip
      setElements(payload.elements);
    };

    socket.on('whiteboard:update', handler);
    return () => {
      socket.off('whiteboard:update', handler);
      socket.emit('room:leave', projectId);
    };
  }, [socket, projectId, user?.id]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (editingId) return; // don't hijack shortcuts while typing
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (meta && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        commit(elements.filter((el) => el.id !== selectedId));
        setSelectedId(null);
      }
      // Tool shortcuts
      if (!meta) {
        if (e.key === 'v' || e.key === 'Escape') setTool('select');
        if (e.key === 's') setTool('sticky');
        if (e.key === 't') setTool('text');
        if (e.key === 'r') setTool('rect');
        if (e.key === 'c') setTool('circle');
        if (e.key === 'a') setTool('arrow');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editingId, selectedId, elements, commit, undo, redo]);

  // ── Transformer: attach to selected node ─────────────────────────────────────
  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;
    const node = selectedId ? nodeRefs.current.get(selectedId) ?? null : null;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId, elements]);

  // ── Zoom ──────────────────────────────────────────────────────────────────────
  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current!;
    const oldScale = scale;
    const pointer = stage.getPointerPosition()!;
    const direction = e.evt.deltaY < 0 ? 1 : -1;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, oldScale + direction * ZOOM_STEP));
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    setScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  }, [scale]);

  // ── Stage pointer events ──────────────────────────────────────────────────────
  const handleStageMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    // Middle mouse or space: pan
    if (e.evt.button === 1) {
      isPanning.current = true;
      panStart.current = { x: e.evt.clientX, y: e.evt.clientY, stageX: stagePos.x, stageY: stagePos.y };
      return;
    }
    if (tool === 'select') {
      // Clicked on empty area — deselect
      if (e.target === e.target.getStage()) setSelectedId(null);
      return;
    }
    // Place sticky / text on click
    if (tool === 'sticky' || tool === 'text') return; // handled on click

    // Drawing shapes: start drag
    const stage = stageRef.current!;
    const pos = stage.getRelativePointerPosition()!;
    setDrawing(true);
    setDrawStart({ x: pos.x, y: pos.y });
    const el = defaultElement(tool as WBElement['type'], pos.x, pos.y, activeColor);
    setDraft(el);
  };

  const handleStageMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (isPanning.current) {
      const dx = e.evt.clientX - panStart.current.x;
      const dy = e.evt.clientY - panStart.current.y;
      setStagePos({ x: panStart.current.stageX + dx, y: panStart.current.stageY + dy });
      return;
    }
    if (!drawing || !draft) return;
    const stage = stageRef.current!;
    const pos = stage.getRelativePointerPosition()!;
    const dx = pos.x - drawStart.x;
    const dy = pos.y - drawStart.y;

    if (draft.type === 'arrow') {
      setDraft({ ...draft, points: [drawStart.x, drawStart.y, pos.x, pos.y] });
    } else {
      setDraft({
        ...draft,
        x: dx < 0 ? pos.x : drawStart.x,
        y: dy < 0 ? pos.y : drawStart.y,
        width: Math.abs(dx),
        height: Math.abs(dy),
      });
    }
  };

  const handleStageMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === 1) { isPanning.current = false; return; }
    if (!drawing || !draft) return;
    setDrawing(false);
    const minSize = 10;
    if ((draft.type !== 'arrow' && (draft.width < minSize || draft.height < minSize))) {
      setDraft(null);
      return;
    }
    commit([...elements, draft]);
    setSelectedId(draft.id);
    setDraft(null);
  };

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (e.evt.button !== 0) return;
    if (tool === 'sticky' || tool === 'text') {
      const stage = stageRef.current!;
      const pos = stage.getRelativePointerPosition()!;
      const el = defaultElement(tool, pos.x - 80, pos.y - 60, activeColor);
      commit([...elements, el]);
      setSelectedId(el.id);
      setTool('select');
    }
  };

  // ── Element drag end ──────────────────────────────────────────────────────────
  const handleDragEnd = (id: string, e: KonvaEventObject<DragEvent>) => {
    const updated = elements.map((el) =>
      el.id === id ? { ...el, x: e.target.x(), y: e.target.y() } : el,
    );
    commit(updated);
  };

  // ── Transform end ─────────────────────────────────────────────────────────────
  const handleTransformEnd = (id: string, e: KonvaEventObject<Event>) => {
    const node = e.target;
    const updated = elements.map((el) => {
      if (el.id !== id) return el;
      return {
        ...el,
        x: node.x(),
        y: node.y(),
        width:  Math.max(20, node.width()  * node.scaleX()),
        height: Math.max(20, node.height() * node.scaleY()),
        rotation: node.rotation(),
      };
    });
    // Reset scale after absorbing into width/height
    e.target.scaleX(1);
    e.target.scaleY(1);
    commit(updated);
  };

  // ── Double-click: enter text edit mode ───────────────────────────────────────
  const handleDblClick = (el: WBElement) => {
    setEditingId(el.id);
    setEditValue(el.content);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const commitEdit = () => {
    if (!editingId) return;
    const updated = elements.map((el) =>
      el.id === editingId ? { ...el, content: editValue } : el,
    );
    commit(updated);
    setEditingId(null);
  };

  const handleTextareaKey = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') commitEdit();
    if (e.key === 'Enter' && !e.shiftKey) commitEdit();
  };

  // Compute textarea position in screen coords
  const getEditingPos = () => {
    if (!editingId) return null;
    const el = elements.find((e) => e.id === editingId);
    if (!el || !stageRef.current) return null;
    const rect = stageRef.current.container().getBoundingClientRect();
    const x = el.x * scale + stagePos.x + rect.left;
    const y = el.y * scale + stagePos.y + rect.top;
    return { x, y, width: el.width * scale, height: el.height * scale };
  };

  // ── Export PNG ────────────────────────────────────────────────────────────────
  const exportPNG = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const uri = stage.toDataURL({ pixelRatio: 2 });
    const a = document.createElement('a');
    a.download = 'whiteboard.png';
    a.href = uri;
    a.click();
    toast.success('Exported as PNG');
  };

  // ── Ref attachment helper ─────────────────────────────────────────────────────
  const attachRef = (id: string) => (node: Konva.Node | null) => {
    if (node) nodeRefs.current.set(id, node);
    else nodeRefs.current.delete(id);
  };

  // ── Render a single element ───────────────────────────────────────────────────
  const renderElement = (el: WBElement) => {
    const isSelected = selectedId === el.id;
    const isEditing  = editingId  === el.id;
    const commonProps = {
      key: el.id,
      x: el.x,
      y: el.y,
      draggable: tool === 'select',
      onClick: (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        if (tool === 'select') setSelectedId(el.id);
      },
      onDragEnd: (e: KonvaEventObject<DragEvent>) => handleDragEnd(el.id, e),
      onTransformEnd: (e: KonvaEventObject<Event>) => handleTransformEnd(el.id, e),
      onDblClick: () => handleDblClick(el),
    };

    switch (el.type) {
      case 'sticky':
        return (
          <Group ref={attachRef(el.id)} {...commonProps} rotation={el.rotation ?? 0}>
            <Rect
              width={el.width} height={el.height}
              fill={el.color} cornerRadius={6}
              shadowColor="rgba(0,0,0,0.25)" shadowBlur={8} shadowOffsetY={3}
              stroke={isSelected ? '#6366f1' : 'rgba(0,0,0,0.1)'} strokeWidth={isSelected ? 2 : 1}
            />
            {!isEditing && (
              <Text
                text={el.content} width={el.width} height={el.height}
                padding={10} fontSize={el.fontSize}
                fill={el.strokeColor} wrap="word" verticalAlign="middle"
              />
            )}
          </Group>
        );

      case 'text':
        return (
          <Text
            ref={attachRef(el.id)} {...commonProps}
            text={isEditing ? '' : el.content}
            fontSize={el.fontSize} fill={el.strokeColor}
            width={el.width} rotation={el.rotation ?? 0}
            stroke={isSelected ? '#6366f1' : undefined} strokeWidth={isSelected ? 0.5 : 0}
          />
        );

      case 'rect':
        return (
          <Rect
            ref={attachRef(el.id)} {...commonProps}
            width={el.width} height={el.height}
            fill={el.color} cornerRadius={4}
            stroke={isSelected ? '#6366f1' : el.strokeColor} strokeWidth={isSelected ? 2 : 1.5}
            rotation={el.rotation ?? 0}
          />
        );

      case 'circle':
        return (
          <Circle
            ref={attachRef(el.id)} {...commonProps}
            radius={el.width / 2}
            offsetX={0} offsetY={0}
            x={el.x + el.width / 2} y={el.y + el.height / 2}
            fill={el.color}
            stroke={isSelected ? '#6366f1' : el.strokeColor} strokeWidth={isSelected ? 2 : 1.5}
          />
        );

      case 'arrow': {
        const pts = el.points ?? [el.x, el.y, el.x + 120, el.y];
        return (
          <Arrow
            ref={attachRef(el.id) as (node: Konva.Arrow | null) => void}
            key={el.id}
            points={pts}
            stroke={isSelected ? '#6366f1' : el.color}
            strokeWidth={isSelected ? 3 : 2}
            fill={isSelected ? '#6366f1' : el.color}
            pointerLength={10} pointerWidth={8}
            draggable={tool === 'select'}
            onClick={(e: KonvaEventObject<MouseEvent>) => {
              e.cancelBubble = true;
              if (tool === 'select') setSelectedId(el.id);
            }}
            onDragEnd={(e: KonvaEventObject<DragEvent>) => {
              const dx = e.target.x();
              const dy = e.target.y();
              const updated = elements.map((item) =>
                item.id === el.id
                  ? { ...item, points: pts.map((v, i) => i % 2 === 0 ? v + dx : v + dy) }
                  : item,
              );
              e.target.position({ x: 0, y: 0 });
              commit(updated);
            }}
          />
        );
      }

      default: return null;
    }
  };

  // ── Draft preview while drawing ───────────────────────────────────────────────
  const renderDraft = () => {
    if (!draft) return null;
    switch (draft.type) {
      case 'rect':
        return <Rect x={draft.x} y={draft.y} width={draft.width} height={draft.height}
          fill={draft.color} opacity={0.7} stroke="#6366f1" strokeWidth={1} cornerRadius={4} />;
      case 'circle':
        return <Circle x={draft.x + draft.width / 2} y={draft.y + draft.height / 2}
          radius={Math.min(draft.width, draft.height) / 2}
          fill={draft.color} opacity={0.7} stroke="#6366f1" strokeWidth={1} />;
      case 'arrow':
        return <Arrow points={draft.points ?? []} stroke={draft.color} strokeWidth={2}
          fill={draft.color} pointerLength={10} pointerWidth={8} />;
      default: return null;
    }
  };

  // ── Minimap ───────────────────────────────────────────────────────────────────
  const minimap = () => {
    if (elements.length === 0) return null;
    const MM_W = 160, MM_H = 100, PADDING = 20;
    const xs = elements.flatMap((e) => [e.x, e.x + (e.width || 0)]);
    const ys = elements.flatMap((e) => [e.y, e.y + (e.height || 0)]);
    const minX = Math.min(...xs) - PADDING, maxX = Math.max(...xs) + PADDING;
    const minY = Math.min(...ys) - PADDING, maxY = Math.max(...ys) + PADDING;
    const rangeX = maxX - minX || 1, rangeY = maxY - minY || 1;
    const toMM = (x: number, y: number) => ({
      x: ((x - minX) / rangeX) * MM_W,
      y: ((y - minY) / rangeY) * MM_H,
    });

    return (
      <div className="absolute bottom-4 right-4 bg-surface/90 border border-border rounded-lg overflow-hidden shadow-lg">
        <div className="px-2 py-1 text-[10px] text-text-muted border-b border-border">Map</div>
        <svg width={MM_W} height={MM_H} className="block">
          {elements.map((el) => {
            const { x, y } = toMM(el.x, el.y);
            const w = Math.max(4, (el.width / rangeX) * MM_W);
            const h = Math.max(4, (el.height / rangeY) * MM_H);
            return (
              <rect key={el.id} x={x} y={y} width={w} height={h}
                fill={el.color === 'transparent' ? '#6366f1' : el.color}
                opacity={0.7} rx={1} />
            );
          })}
          {/* Viewport indicator */}
          {(() => {
            const vx = toMM(-stagePos.x / scale, -stagePos.y / scale);
            const vw = (dims.width / scale / rangeX) * MM_W;
            const vh = (dims.height / scale / rangeY) * MM_H;
            return <rect x={vx.x} y={vx.y} width={vw} height={vh}
              fill="none" stroke="#6366f1" strokeWidth={1} opacity={0.5} />;
          })()}
        </svg>
      </div>
    );
  };

  const editPos = getEditingPos();
  const canUndo = historyIdx.current > 0;
  const canRedo = historyIdx.current < history.current.length - 1;

  const TOOLS: { id: WBTool; icon: React.ReactNode; label: string; shortcut: string }[] = [
    { id: 'select', icon: <MousePointer2 className="h-4 w-4" />, label: 'Select', shortcut: 'V' },
    { id: 'sticky', icon: <StickyNote   className="h-4 w-4" />, label: 'Sticky', shortcut: 'S' },
    { id: 'text',   icon: <Type         className="h-4 w-4" />, label: 'Text',   shortcut: 'T' },
    { id: 'rect',   icon: <Square       className="h-4 w-4" />, label: 'Rect',   shortcut: 'R' },
    { id: 'circle', icon: <CircleIcon   className="h-4 w-4" />, label: 'Circle', shortcut: 'C' },
    { id: 'arrow',  icon: <Minus        className="h-4 w-4" />, label: 'Arrow',  shortcut: 'A' },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#0f1117] overflow-hidden" style={{ marginTop: '-1px' }}>
      {/* ── Top bar ── */}
      <div className="flex items-center gap-2 px-3 h-11 border-b border-white/10 bg-[#1a1b26] shrink-0 z-10">
        <Link
          to={`/projects/${projectId}`}
          className="flex items-center gap-1.5 h-7 px-2 rounded text-[12px] text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Board
        </Link>
        <div className="w-px h-4 bg-white/10" />
        <LayoutGrid className="h-3.5 w-3.5 text-primary" />
        <span className="text-[13px] font-medium text-text-primary">Whiteboard</span>

        <div className="flex-1" />

        {/* Zoom controls */}
        <button onClick={() => setScale(s => Math.max(MIN_SCALE, s - ZOOM_STEP))}
          className="h-7 w-7 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors">
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <span className="text-[12px] text-text-muted w-10 text-center tabular-nums">
          {Math.round(scale * 100)}%
        </span>
        <button onClick={() => setScale(s => Math.min(MAX_SCALE, s + ZOOM_STEP))}
          className="h-7 w-7 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors">
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => { setScale(1); setStagePos({ x: 0, y: 0 }); }}
          className="h-7 px-2 text-[11px] text-text-muted hover:text-text-primary hover:bg-white/5 rounded transition-colors">
          Reset
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Undo / Redo */}
        <button onClick={undo} disabled={!canUndo}
          className="h-7 w-7 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-white/5 disabled:opacity-30 transition-colors">
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button onClick={redo} disabled={!canRedo}
          className="h-7 w-7 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-white/5 disabled:opacity-30 transition-colors">
          <Redo2 className="h-3.5 w-3.5" />
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Delete selected */}
        {selectedId && (
          <button
            onClick={() => { commit(elements.filter((e) => e.id !== selectedId)); setSelectedId(null); }}
            className="h-7 w-7 flex items-center justify-center rounded text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Export */}
        <button onClick={exportPNG}
          className="flex items-center gap-1.5 h-7 px-2.5 rounded bg-primary/90 hover:bg-primary text-white text-[12px] font-medium transition-colors">
          <Download className="h-3.5 w-3.5" />
          Export
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left toolbar ── */}
        <div className="flex flex-col items-center gap-1 w-11 py-3 border-r border-white/10 bg-[#1a1b26] shrink-0 z-10">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              title={`${t.label} (${t.shortcut})`}
              className={cn(
                'h-8 w-8 flex items-center justify-center rounded transition-colors',
                tool === t.id
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5',
              )}
            >
              {t.icon}
            </button>
          ))}

          <div className="w-6 h-px bg-white/10 my-1" />

          {/* Color palette */}
          {[...STICKY_COLORS, ...SHAPE_COLORS].slice(0, 6).map((c) => (
            <button
              key={c}
              onClick={() => setActiveColor(c)}
              className={cn(
                'h-5 w-5 rounded-full border-2 transition-transform',
                activeColor === c ? 'border-white scale-110' : 'border-transparent',
              )}
              style={{ background: c }}
            />
          ))}
        </div>

        {/* ── Canvas ── */}
        <div ref={containerRef} className="flex-1 relative overflow-hidden bg-[#0f1117]"
          style={{ cursor: tool !== 'select' ? 'crosshair' : isPanning.current ? 'grabbing' : 'default' }}>

          {/* Dot-grid background */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <defs>
              <pattern id="dot" x={stagePos.x % (20 * scale)} y={stagePos.y % (20 * scale)}
                width={20 * scale} height={20 * scale} patternUnits="userSpaceOnUse">
                <circle cx={1} cy={1} r={0.8} fill="#6366f1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot)" />
          </svg>

          <Stage
            ref={stageRef}
            width={dims.width}
            height={dims.height}
            scaleX={scale}
            scaleY={scale}
            x={stagePos.x}
            y={stagePos.y}
            onWheel={handleWheel}
            onMouseDown={handleStageMouseDown}
            onMouseMove={handleStageMouseMove}
            onMouseUp={handleStageMouseUp}
            onClick={handleStageClick}
          >
            <Layer>
              {elements.map(renderElement)}
              {renderDraft()}
            </Layer>
            <Layer>
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => (newBox.width < 20 || newBox.height < 20 ? oldBox : newBox)}
                borderStroke="#6366f1"
                borderStrokeWidth={1.5}
                anchorStroke="#6366f1"
                anchorFill="#fff"
                anchorSize={8}
                anchorCornerRadius={2}
                rotateEnabled
              />
            </Layer>
          </Stage>

          {/* Inline text editor overlay */}
          {editingId && editPos && (
            <textarea
              ref={textareaRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleTextareaKey}
              style={{
                position: 'fixed',
                left: editPos.x,
                top: editPos.y,
                width: editPos.width,
                minHeight: editPos.height,
                fontSize: (elements.find((e) => e.id === editingId)?.fontSize ?? 14) * scale,
                background: 'transparent',
                border: '1.5px solid #6366f1',
                borderRadius: '4px',
                color: elements.find((e) => e.id === editingId)?.strokeColor ?? '#EEEFFC',
                padding: '8px',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                zIndex: 100,
                lineHeight: 1.5,
              }}
            />
          )}

          {minimap()}

          {/* Save indicator */}
          {saveMutation.isPending && (
            <div className="absolute top-3 right-3 text-[11px] text-text-muted bg-surface/80 px-2 py-1 rounded border border-border">
              Saving…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
