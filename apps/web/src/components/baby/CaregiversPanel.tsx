import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import * as caregiversApi from "../../api/caregivers";
import { useAuth } from "../../context/AuthContext";
import { useBaby } from "../../context/BabyContext";
import {
  btnPrimaryClass,
  btnSecondaryClass,
  inputClass,
  labelClass,
} from "../ui/form";

export default function CaregiversPanel() {
  const { user } = useAuth();
  const { activeBaby, refetch } = useBaby();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isOwner = !!activeBaby && !!user && activeBaby.userId === user.id;

  const membersQuery = useQuery({
    queryKey: ["members", activeBaby?.id],
    queryFn: async () => {
      const res = await caregiversApi.listMembers(activeBaby!.id);
      return res.data;
    },
    enabled: !!activeBaby && isOwner,
  });

  const invitesQuery = useQuery({
    queryKey: ["baby-invites", activeBaby?.id],
    queryFn: async () => {
      const res = await caregiversApi.listBabyInvites(activeBaby!.id);
      return res.data;
    },
    enabled: !!activeBaby && isOwner,
  });

  const myInvitesQuery = useQuery({
    queryKey: ["my-invites"],
    queryFn: async () => {
      const res = await caregiversApi.listMyInvites();
      return res.data;
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      caregiversApi.inviteCaregiver(activeBaby!.id, {
        email: email.trim(),
      }),
    onSuccess: (result) => {
      setEmail("");
      setError(null);
      setMessage(
        result.autoAccepted
          ? "Caregiver added (account already exists)."
          : "Invite saved. When they register with that email, they can accept it from Profile."
      );
      void queryClient.invalidateQueries({ queryKey: ["members"] });
      void queryClient.invalidateQueries({ queryKey: ["baby-invites"] });
    },
    onError: () => setError("Could not send invite"),
  });

  const acceptMutation = useMutation({
    mutationFn: (inviteId: string) => caregiversApi.acceptInvite(inviteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-invites"] });
      void queryClient.invalidateQueries({ queryKey: ["babies"] });
      refetch();
      setMessage("Invite accepted. Shared baby is now available.");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (memberUserId: string) =>
      caregiversApi.removeMember(activeBaby!.id, memberUserId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  if (!activeBaby) return null;

  function handleInvite(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    inviteMutation.mutate();
  }

  return (
    <div className="space-y-4 border-t border-theme pt-4">
      <div>
        <h3 className="text-sm font-bold text-theme-body">Caregivers</h3>
        <p className="text-xs text-theme-muted">
          Share this baby diary with a partner or babysitter by email.
        </p>
      </div>

      {myInvitesQuery.data && myInvitesQuery.data.length > 0 && (
        <div className="space-y-2 rounded-xl border border-theme bg-theme-surface-elevated p-3">
          <p className="text-xs font-semibold uppercase text-theme-muted">
            Invites for you
          </p>
          {myInvitesQuery.data.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between gap-2"
            >
              <span className="text-sm text-theme-body">
                {invite.babyName}
              </span>
              <button
                type="button"
                onClick={() => acceptMutation.mutate(invite.id)}
                className={btnPrimaryClass + " w-auto px-3 py-1.5 text-xs"}
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      {isOwner ? (
        <>
          <form onSubmit={handleInvite} className="space-y-2">
            <label htmlFor="caregiverEmail" className={labelClass}>
              Invite by email
            </label>
            <div className="flex gap-2">
              <input
                id="caregiverEmail"
                type="email"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="partner@email.com"
                required
              />
              <button
                type="submit"
                className={btnPrimaryClass + " w-auto shrink-0 px-3 text-xs"}
                disabled={inviteMutation.isPending}
              >
                Invite
              </button>
            </div>
          </form>

          {message && <p className="text-xs text-theme-muted">{message}</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}

          <ul className="space-y-1.5">
            {(membersQuery.data ?? []).map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-theme px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-theme-body">
                    {member.name}
                  </p>
                  <p className="truncate text-xs text-theme-muted">
                    {member.email} · {member.role}
                  </p>
                </div>
                {member.role !== "owner" && (
                  <button
                    type="button"
                    onClick={() => removeMutation.mutate(member.userId)}
                    className={
                      btnSecondaryClass + " px-2 py-1 text-xs text-red-600"
                    }
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>

          {(invitesQuery.data ?? []).length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-theme-muted">
                Pending invites
              </p>
              <ul className="space-y-1">
                {invitesQuery.data!.map((invite) => (
                  <li
                    key={invite.id}
                    className="flex items-center justify-between gap-2 text-sm text-theme-muted"
                  >
                    <span className="truncate">{invite.email}</span>
                    <button
                      type="button"
                      onClick={() =>
                        void caregiversApi
                          .revokeInvite(activeBaby.id, invite.id)
                          .then(() =>
                            queryClient.invalidateQueries({
                              queryKey: ["baby-invites"],
                            })
                          )
                      }
                      className="text-xs text-red-600"
                    >
                      Revoke
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-theme-muted">
          You have caregiver access. Only the owner can invite others.
        </p>
      )}
    </div>
  );
}
