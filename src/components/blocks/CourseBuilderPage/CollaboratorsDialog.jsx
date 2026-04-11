import { Copy, Plus, Shield, Trash2, UserCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import {
  cancelInvitation,
  getCourseCollaborators,
  getPendingInvitations,
  inviteCollaborator,
  removeCollaborator,
  updateCollaboratorRole,
} from "@/lib/reviewStorage";

const ROLE_COLORS = {
  editor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  reviewer: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

const INVITE_ORIGIN = typeof window !== "undefined" ? window.location.origin : "";

export default function CollaboratorsDialog({ open, onOpenChange, courseId }) {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("reviewer");
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);

  const load = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [collabs, invs] = await Promise.all([
        getCourseCollaborators(courseId),
        getPendingInvitations(courseId),
      ]);
      setCollaborators(collabs);
      setInvitations(invs);
    } catch {
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, courseId]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Enter an email address");
      return;
    }
    setInviting(true);
    try {
      const inv = await inviteCollaborator(courseId, inviteEmail.trim(), inviteRole, user.id);
      setInviteEmail("");
      await load();
      const link = `${INVITE_ORIGIN}/accept-invite/${inv.token}`;
      navigator.clipboard?.writeText(link).catch(() => {});
      toast.success("Invite created — link copied to clipboard");
    } catch (e) {
      toast.error(e.message || "Failed to create invite");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    try {
      await removeCollaborator(courseId, userId);
      setCollaborators((prev) => prev.filter((c) => c.user_id !== userId));
      toast.success("Collaborator removed");
    } catch {
      toast.error("Failed to remove collaborator");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateCollaboratorRole(courseId, userId, newRole);
      setCollaborators((prev) =>
        prev.map((c) => (c.user_id === userId ? { ...c, role: newRole } : c))
      );
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleCancelInvitation = async (invId) => {
    try {
      await cancelInvitation(invId);
      setInvitations((prev) => prev.filter((i) => i.id !== invId));
      toast.success("Invitation cancelled");
    } catch {
      toast.error("Failed to cancel invitation");
    }
  };

  const copyLink = (token) => {
    const link = `${INVITE_ORIGIN}/accept-invite/${token}`;
    navigator.clipboard?.writeText(link);
    toast.success("Invite link copied");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-500" />
            Team Access
          </DialogTitle>
          <DialogDescription>
            Invite editors and reviewers to collaborate on this course.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="team">
          <TabsList className="w-full">
            <TabsTrigger value="team" className="flex-1 text-xs">
              Team ({collaborators.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 text-xs">
              Pending ({invitations.length})
            </TabsTrigger>
          </TabsList>

          {/* ── Team tab ─── */}
          <TabsContent value="team" className="space-y-4 pt-3">
            {/* Invite form */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Invite by email</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                  className="flex-1 h-8 text-sm"
                />
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="reviewer">Reviewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  className="h-8 gap-1"
                  onClick={handleInvite}
                  disabled={inviting}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Invite
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                An invite link is created and copied to your clipboard — share it with the person
                you want to add.
              </p>
            </div>

            <Separator />

            {/* Collaborators list */}
            {loading ? (
              <p className="text-xs text-muted-foreground text-center py-4">Loading…</p>
            ) : collaborators.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No collaborators yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {collaborators.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 py-2 px-3 rounded-md border bg-muted/20"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{c.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Select
                        value={c.role}
                        onValueChange={(v) => handleRoleChange(c.user_id, v)}
                      >
                        <SelectTrigger className="h-6 w-24 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="reviewer">Reviewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveCollaborator(c.user_id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Role descriptions */}
            <div className="rounded-md border bg-muted/30 p-3 space-y-1.5 text-xs text-muted-foreground">
              <p>
                <span
                  className={`inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium mr-1.5 ${ROLE_COLORS.editor}`}
                >
                  Editor
                </span>
                Can view and edit all course content and modules.
              </p>
              <p>
                <span
                  className={`inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium mr-1.5 ${ROLE_COLORS.reviewer}`}
                >
                  Reviewer
                </span>
                Gets a read-only learner preview to review content and leave feedback.
              </p>
            </div>
          </TabsContent>

          {/* ── Pending tab ─── */}
          <TabsContent value="pending" className="space-y-2 pt-3">
            {invitations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No pending invitations</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between gap-3 py-2 px-3 rounded-md border bg-muted/20"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Expires {new Date(inv.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${ROLE_COLORS[inv.role]}`}
                      >
                        {inv.role}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-primary"
                        title="Copy invite link"
                        onClick={() => copyLink(inv.token)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        title="Cancel invitation"
                        onClick={() => handleCancelInvitation(inv.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
