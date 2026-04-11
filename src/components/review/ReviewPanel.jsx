import {
  ChevronDown,
  ChevronUp,
  Filter,
  MessageSquare,
  Plus,
  Reply,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import {
  createComment,
  deleteComment,
  getCourseComments,
  updateComment,
} from "@/lib/reviewStorage";

const STATUS_CONFIG = {
  open: {
    label: "Open",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  resolved: {
    label: "Resolved",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
};

const PRIORITY_CONFIG = {
  low: { label: "Low", icon: "↓", className: "text-muted-foreground" },
  normal: { label: "Normal", icon: "→", className: "text-blue-500" },
  high: { label: "High", icon: "↑", className: "text-red-500" },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function CommentCard({
  comment,
  replies,
  modules,
  currentUserId,
  isOwner,
  onDelete,
  onStatusChange,
  onReply,
  depth = 0,
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [expanded, setExpanded] = useState(true);

  const moduleTitle = modules?.find((m) => m.id === comment.module_id)?.title ?? null;
  const authorHandle = comment.author_email?.split("@")[0] ?? "?";
  const canDelete = isOwner || comment.author_id === currentUserId;

  const submitReply = async () => {
    if (!replyBody.trim()) return;
    await onReply(comment.id, comment.module_id, replyBody.trim());
    setReplyBody("");
    setShowReplyForm(false);
  };

  return (
    <div className={`space-y-1 ${depth > 0 ? "ml-4 pl-3 border-l border-border/60" : ""}`}>
      <div className="rounded-md border bg-card p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
              {authorHandle[0].toUpperCase()}
            </div>
            <span className="text-xs font-medium truncate">{authorHandle}</span>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {timeAgo(comment.created_at)}
            </span>
          </div>
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-destructive shrink-0"
              onClick={() => onDelete(comment.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Slide context badge */}
        {moduleTitle && depth === 0 && (
          <p className="text-[10px] text-muted-foreground">
            on <span className="font-medium">{moduleTitle}</span>
            {comment.block_id && " › block"}
          </p>
        )}
        {!comment.module_id && depth === 0 && (
          <p className="text-[10px] text-muted-foreground">course-wide</p>
        )}

        {/* Body */}
        <p className="text-sm leading-relaxed">{comment.body}</p>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${STATUS_CONFIG[comment.status]?.className}`}
            >
              {STATUS_CONFIG[comment.status]?.label}
            </span>
            <span
              className={`text-[10px] font-medium ${PRIORITY_CONFIG[comment.priority]?.className}`}
            >
              {PRIORITY_CONFIG[comment.priority]?.icon}{" "}
              {PRIORITY_CONFIG[comment.priority]?.label}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            {depth === 0 && (
              <Select
                value={comment.status}
                onValueChange={(v) => onStatusChange(comment.id, v)}
              >
                <SelectTrigger className="h-5 w-auto border-0 bg-transparent p-0 shadow-none text-[10px] text-muted-foreground gap-0.5 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open" className="text-xs">
                    Open
                  </SelectItem>
                  <SelectItem value="in_progress" className="text-xs">
                    In progress
                  </SelectItem>
                  <SelectItem value="resolved" className="text-xs">
                    Resolved
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
            {depth === 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground"
                onClick={() => setShowReplyForm((v) => !v)}
                title="Reply"
              >
                <Reply className="h-3 w-3" />
              </Button>
            )}
            {replies?.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground"
                onClick={() => setExpanded((v) => !v)}
                title={expanded ? "Collapse replies" : "Expand replies"}
              >
                {expanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Inline reply form */}
      {showReplyForm && (
        <div className="ml-4 pl-3 border-l border-border/60 space-y-1.5 py-1">
          <Textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Write a reply…"
            className="text-xs min-h-[56px] resize-none"
            autoFocus
          />
          <div className="flex gap-1 justify-end">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs"
              onClick={() => setShowReplyForm(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-6 text-xs"
              onClick={submitReply}
              disabled={!replyBody.trim()}
            >
              Reply
            </Button>
          </div>
        </div>
      )}

      {/* Nested replies */}
      {expanded &&
        replies?.map((r) => (
          <CommentCard
            key={r.id}
            comment={r}
            replies={[]}
            modules={modules}
            currentUserId={currentUserId}
            isOwner={isOwner}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onReply={onReply}
            depth={depth + 1}
          />
        ))}
    </div>
  );
}

export default function ReviewPanel({
  open,
  onOpenChange,
  courseId,
  modules,
  isOwner,
}) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterModule, setFilterModule] = useState("all");
  const [search, setSearch] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newModuleId, setNewModuleId] = useState("course");
  const [newPriority, setNewPriority] = useState("normal");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const data = await getCourseComments(courseId);
      setComments(data);
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, courseId]);

  const handleSubmit = async () => {
    if (!newBody.trim() || !user) return;
    setSubmitting(true);
    try {
      const comment = await createComment({
        courseId,
        moduleId: newModuleId === "course" ? null : newModuleId,
        body: newBody.trim(),
        priority: newPriority,
        authorId: user.id,
        authorEmail: user.email,
      });
      setComments((prev) => [...prev, comment]);
      setNewBody("");
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId, moduleId, body) => {
    if (!user) return;
    try {
      const comment = await createComment({
        courseId,
        moduleId: moduleId || null,
        parentId,
        body,
        authorId: user.id,
        authorEmail: user.email,
      });
      setComments((prev) => [...prev, comment]);
    } catch {
      toast.error("Failed to add reply");
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleStatusChange = async (commentId, status) => {
    try {
      await updateComment(commentId, { status });
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, status } : c))
      );
    } catch {
      toast.error("Failed to update status");
    }
  };

  const topLevel = useMemo(() => comments.filter((c) => !c.parent_id), [comments]);
  const repliesMap = useMemo(() => {
    const map = {};
    for (const c of comments.filter((c) => c.parent_id)) {
      if (!map[c.parent_id]) map[c.parent_id] = [];
      map[c.parent_id].push(c);
    }
    return map;
  }, [comments]);

  const filteredTop = useMemo(() => {
    return topLevel.filter((c) => {
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      if (filterModule !== "all") {
        if (filterModule === "course" && c.module_id !== null) return false;
        if (filterModule !== "course" && c.module_id !== filterModule) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (
          !c.body.toLowerCase().includes(q) &&
          !c.author_email.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [topLevel, filterStatus, filterModule, search]);

  const openCount = topLevel.filter((c) => c.status === "open").length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[400px] sm:w-[440px] flex flex-col p-0 gap-0"
      >
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2 text-sm">
            <MessageSquare className="h-4 w-4 text-violet-500" />
            Review Comments
            {openCount > 0 && (
              <span className="ml-auto bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs px-1.5 py-0.5 rounded-full font-normal">
                {openCount} open
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="text-xs">
            Leave feedback on slides and course content.
          </SheetDescription>
        </SheetHeader>

        {/* Add comment */}
        <div className="px-4 py-3 border-b space-y-2 shrink-0">
          <Label className="text-xs font-medium">Add comment</Label>
          <Textarea
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Write your feedback…"
            className="text-xs resize-none min-h-[68px]"
          />
          <div className="flex gap-2 flex-wrap">
            <Select value={newModuleId} onValueChange={setNewModuleId}>
              <SelectTrigger className="flex-1 min-w-[120px] h-7 text-xs">
                <SelectValue placeholder="Slide" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="course" className="text-xs">
                  Whole course
                </SelectItem>
                {modules?.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-xs">
                    {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={newPriority} onValueChange={setNewPriority}>
              <SelectTrigger className="w-28 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low" className="text-xs">
                  ↓ Low
                </SelectItem>
                <SelectItem value="normal" className="text-xs">
                  → Normal
                </SelectItem>
                <SelectItem value="high" className="text-xs">
                  ↑ High
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="h-7 text-xs shrink-0 gap-1"
              onClick={handleSubmit}
              disabled={!newBody.trim() || submitting || !user}
            >
              <Plus className="h-3.5 w-3.5" />
              Post
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 py-2 border-b space-y-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search text or author…"
              className="pl-6 h-7 text-xs"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="flex-1 h-7 text-xs">
                <Filter className="h-3 w-3 mr-1 shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All statuses
                </SelectItem>
                <SelectItem value="open" className="text-xs">
                  Open
                </SelectItem>
                <SelectItem value="in_progress" className="text-xs">
                  In progress
                </SelectItem>
                <SelectItem value="resolved" className="text-xs">
                  Resolved
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterModule} onValueChange={setFilterModule}>
              <SelectTrigger className="flex-1 h-7 text-xs">
                <SelectValue placeholder="All slides" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All slides
                </SelectItem>
                <SelectItem value="course" className="text-xs">
                  Course-wide
                </SelectItem>
                {modules?.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-xs">
                    {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Comment list */}
        <ScrollArea className="flex-1">
          <div className="px-4 py-3">
            {loading ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                Loading…
              </p>
            ) : filteredTop.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No comments yet</p>
                <p className="text-xs mt-1">Be the first to leave feedback</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTop.map((c) => (
                  <CommentCard
                    key={c.id}
                    comment={c}
                    replies={repliesMap[c.id] ?? []}
                    modules={modules}
                    currentUserId={user?.id}
                    isOwner={isOwner}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                    onReply={handleReply}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
