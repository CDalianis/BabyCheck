import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState, type FormEvent } from "react";
import * as babiesApi from "../../api/babies";
import { ApiClientError } from "../../api/client";
import { useBaby } from "../../context/BabyContext";
import { resolveBabyPhotoUrl } from "../../utils/photo";
import {
  btnPrimaryClass,
  btnSecondaryClass,
  inputClass,
  labelClass,
} from "../ui/form";

type GenderOption = "" | "male" | "female" | "other";

interface BabyProfileFormProps {
  onSuccess?: () => void;
}

export default function BabyProfileForm({ onSuccess }: BabyProfileFormProps) {
  const { activeBaby, refetch } = useBaby();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<GenderOption>("");
  const [error, setError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (activeBaby) {
      setName(activeBaby.name);
      setBirthDate(activeBaby.birthDate);
      setGender((activeBaby.gender as GenderOption) ?? "");
    } else {
      setName("");
      setBirthDate("");
      setGender("");
    }
  }, [activeBaby]);

  const createMutation = useMutation({
    mutationFn: () =>
      babiesApi.createBaby({
        name,
        birthDate,
        gender: gender || undefined,
      }),
    onSuccess: () => {
      refetch();
      setError(null);
      onSuccess?.();
    },
    onError: () => setError("Failed to save baby profile"),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      babiesApi.updateBaby(activeBaby!.id, {
        name,
        birthDate,
        gender: gender === "" ? null : gender,
      }),
    onSuccess: () => {
      refetch();
      setError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (err) => {
      setError(
        err instanceof ApiClientError ? err.message : "Failed to update profile"
      );
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      babiesApi.uploadBabyPhoto(activeBaby!.id, file),
    onSuccess: () => {
      refetch();
      setPhotoError(null);
    },
    onError: (err) => {
      setPhotoError(
        err instanceof ApiClientError ? err.message : "Failed to upload photo"
      );
    },
  });

  const removePhotoMutation = useMutation({
    mutationFn: () => babiesApi.deleteBabyPhoto(activeBaby!.id),
    onSuccess: () => {
      refetch();
      setPhotoError(null);
    },
    onError: () => setPhotoError("Failed to remove photo"),
  });

  const photoSrc = resolveBabyPhotoUrl(
    activeBaby?.photoUrl ?? null,
    activeBaby?.updatedAt
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (activeBaby) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    uploadMutation.mutate(file);
    e.target.value = "";
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {activeBaby && (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-theme bg-theme-surface-elevated sm:h-28 sm:w-28"
          >
            {photoSrc ? (
              <img
                src={photoSrc}
                alt={name || activeBaby.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-4xl">
                👶
              </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 text-xs font-semibold text-white opacity-0 transition group-hover:bg-slate-900/40 group-hover:opacity-100">
              Change
            </span>
          </button>

          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs text-theme-muted">
              Photo tiles subtly across the app background.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <button
                type="button"
                className={btnSecondaryClass + " px-3 py-1.5 text-xs"}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload photo"}
              </button>
              {photoSrc && (
                <button
                  type="button"
                  className={
                    btnSecondaryClass + " px-3 py-1.5 text-xs text-red-600"
                  }
                  onClick={() => removePhotoMutation.mutate()}
                  disabled={removePhotoMutation.isPending}
                >
                  Remove photo
                </button>
              )}
            </div>
            {photoError && (
              <p className="mt-2 text-xs text-red-600">{photoError}</p>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
      )}

      <div>
        <label htmlFor="baby-name" className={labelClass}>
          Baby name
        </label>
        <input
          id="baby-name"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="baby-birthDate" className={labelClass}>
          Birth date
        </label>
        <input
          id="baby-birthDate"
          className={inputClass}
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="baby-gender" className={labelClass}>
          Gender <span className="font-normal text-theme-muted">(optional)</span>
        </label>
        <select
          id="baby-gender"
          className={inputClass}
          value={gender}
          onChange={(e) => setGender(e.target.value as GenderOption)}
        >
          <option value="">Prefer not to say</option>
          <option value="male">Boy</option>
          <option value="female">Girl</option>
          <option value="other">Other</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-theme-brand">Profile saved.</p>}

      <button className={btnPrimaryClass} type="submit" disabled={isSaving}>
        {isSaving
          ? "Saving..."
          : activeBaby
            ? "Save changes"
            : "Create baby profile"}
      </button>
    </form>
  );
}
