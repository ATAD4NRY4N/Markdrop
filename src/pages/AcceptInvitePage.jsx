import { CheckCircle, GraduationCap, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { acceptInvitation, getInvitationByToken } from "@/lib/reviewStorage";

export default function AcceptInvitePage() {
  const { token } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState(null);
  // loading | ready | accepting | done | error
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(`/login?next=/accept-invite/${token}`);
      return;
    }

    const load = async () => {
      try {
        const inv = await getInvitationByToken(token);
        setInvitation(inv);
        setStatus("ready");
      } catch {
        setErrorMsg("This invitation is invalid, expired, or has already been accepted.");
        setStatus("error");
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, token]);

  const handleAccept = async () => {
    setStatus("accepting");
    try {
      const { courseId, role } = await acceptInvitation(token, user.id, user.email);
      toast.success(`You've joined as ${role}!`);
      setStatus("done");
      setTimeout(() => navigate(`/review/${courseId}`), 1500);
    } catch (e) {
      setErrorMsg(e.message || "Failed to accept invitation.");
      setStatus("error");
    }
  };

  if (authLoading || status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="max-w-sm w-full mx-4 text-center space-y-5">
        <GraduationCap className="h-10 w-10 mx-auto text-violet-500" />

        {status === "error" && (
          <>
            <XCircle className="h-10 w-10 mx-auto text-destructive" />
            <div className="space-y-1">
              <h1 className="text-lg font-semibold">Invitation unavailable</h1>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/courses">Go to my courses</Link>
            </Button>
          </>
        )}

        {status === "done" && (
          <>
            <CheckCircle className="h-10 w-10 mx-auto text-green-500" />
            <div className="space-y-1">
              <h1 className="text-lg font-semibold">You're in!</h1>
              <p className="text-sm text-muted-foreground">Redirecting to the course…</p>
            </div>
          </>
        )}

        {(status === "ready" || status === "accepting") && invitation && (
          <>
            <div className="space-y-1">
              <h1 className="text-lg font-semibold">You've been invited</h1>
              <p className="text-sm text-muted-foreground">
                Join{" "}
                <span className="font-medium">
                  {invitation.courses?.title ?? "a course"}
                </span>{" "}
                as a{" "}
                <span className="font-medium capitalize">{invitation.role}</span>.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={handleAccept}
              disabled={status === "accepting"}
            >
              {status === "accepting" && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Accept Invitation
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/courses">Decline</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
