"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { useUser } from "@/components/UserContext";
import clsx from "clsx";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface UserData {
  id: string;
  username: string;
  password: string;
  permissions: string[];
  isGuest: boolean;
  profilePicture?: string;
  details: {
    firstName: string;
    surname: string;
    mobileNumber: string;
    email: string;
    dateOfBirth: string;
  };
}

interface ValidationErrors {
  firstName?: string;
  surname?: string;
  email?: string;
  mobileNumber?: string;
  dateOfBirth?: string;
  currentPassword?: string;
  password?: string;
  confirmPassword?: string;
}

export default function MyAccount() {
  const { user } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [passwordErrors, setPasswordErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (user?.id) {
      axios
        .get(`http://localhost:8080/users/${user.id}`, { withCredentials: true })
        .then((res) => setUserData(res.data))
        .catch((err) => console.error("Failed to fetch user data", err));
    }
  }, [user?.id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);

    try {
      const res = await axios.post(`http://localhost:8080/s3/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      const uploadedUrl = res.data;
      setNewImageUrl(uploadedUrl);
    } catch (err) {
      console.error("Image upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (field: keyof UserData["details"], value: string) => {
    setUserData((prev) =>
      prev
        ? {
            ...prev,
            details: {
              ...prev.details,
              [field]: value,
            },
          }
        : prev
    );
  };

  const validateForm = (): boolean => {
    const d = userData?.details;
    const errs: ValidationErrors = {};

    if (!d?.firstName?.trim()) errs.firstName = "First name is required";
    if (!d?.surname?.trim()) errs.surname = "Surname is required";
    if (!d?.email?.trim()) errs.email = "Email is required";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(d.email)) errs.email = "Invalid email format";
    if (!d?.mobileNumber?.trim()) errs.mobileNumber = "Mobile number is required";
    else if (!/^\d{7,15}$/.test(d.mobileNumber)) errs.mobileNumber = "Mobile must be digits only";
    if (!d?.dateOfBirth?.trim()) errs.dateOfBirth = "Date of birth is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!user?.id || !userData) return;
    if (!validateForm()) return;
  
    const { password, ...safeUserData } = userData;
    const updatedData = {
    ...safeUserData,
    profilePicture: newImageUrl || userData.profilePicture || "",
    };
  
    
  
    try {
      await axios.put(`http://localhost:8080/users/${user.id}`, updatedData, {
        withCredentials: true,
      });
  
      const res = await axios.get(`http://localhost:8080/users/${user.id}`, {
        withCredentials: true,
      });
  
      setUserData(res.data);
      setIsEditing(false);
      setNewImageUrl(null);
      setPreviewUrl(null);
      setErrors({});
    } catch (err) {
      console.error("Failed to save or refresh user data", err);
    }
  };
  

  const handleCancel = () => {
    setIsEditing(false);
    setNewImageUrl(null);
    setPreviewUrl(null);
    setErrors({});
  };

  const handlePasswordChange = async () => {
    const { current, new: newPass, confirm } = passwords;
    const errs: ValidationErrors = {};

    if (!current) errs.currentPassword = "Current password is required";
    if (!newPass) errs.password = "New password is required";
    else if (newPass.length < 8) errs.password = "Password must be at least 8 characters";
    if (!confirm) errs.confirmPassword = "Please confirm your new password";
    else if (newPass !== confirm) errs.confirmPassword = "Passwords do not match";

    setPasswordErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await axios.put(
        `http://localhost:8080/users/${user?.id}`,
        {
          currentPassword: current,
          password: newPass,
        },
        { withCredentials: true }
      );

      setPasswordModalOpen(false);
      setPasswords({ current: "", new: "", confirm: "" });
      setPasswordErrors({});
    } catch (err) {
      console.error("Password change failed", err);
      setPasswordErrors({ currentPassword: "Current password is incorrect" });
    }
  };

  if (!userData) return <div className="p-6 text-center">Loading...</div>;

  const d = userData.details;

  return (
    <div className="px-4 py-6 max-w-md w-full mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="text-xl font-bold">My Account</h2>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
            Edit Info
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button size="sm" onClick={handleSave} disabled={uploading} className="w-full sm:w-auto">
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={uploading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="relative group flex flex-col items-center gap-2">
          <div className="relative w-24 h-24">
            <img
              src={
                previewUrl ||
                newImageUrl ||
                userData.profilePicture ||
                `https://ui-avatars.com/api/?name=${d.firstName}+${d.surname}`
              }
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border transition-opacity duration-300"
            />
            {isEditing && (
              <label
                htmlFor="profile-upload"
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-xs text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              >
                Change Photo
              </label>
            )}
          </div>
          {isEditing && (
            <>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
            </>
          )}
        </div>

        {!isEditing ? (
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <Input value={`${d.firstName} ${d.surname}`} disabled />
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <label className="text-sm font-medium">First Name</label>
              <Input
                value={d.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={clsx({ "border-red-500": errors.firstName })}
              />
              {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Surname</label>
              <Input
                value={d.surname}
                onChange={(e) => handleInputChange("surname", e.target.value)}
                className={clsx({ "border-red-500": errors.surname })}
              />
              {errors.surname && <p className="text-sm text-red-500">{errors.surname}</p>}
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            value={d.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            disabled={!isEditing}
            className={clsx({ "border-red-500": errors.email })}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Mobile Number</label>
          <Input
            value={d.mobileNumber}
            onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
            disabled={!isEditing}
            className={clsx({ "border-red-500": errors.mobileNumber })}
          />
          {errors.mobileNumber && <p className="text-sm text-red-500">{errors.mobileNumber}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Date of Birth</label>
          <Input
            value={d.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            disabled={!isEditing}
            className={clsx({ "border-red-500": errors.dateOfBirth })}
          />
          {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Username</label>
          <Input value={userData.username} disabled />
        </div>

        {userData.permissions.length > 0 && (
          <div>
            <label className="text-sm font-medium">Permissions</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {userData.permissions.map((perm) => (
                <Badge key={perm} variant="outline">
                  {perm}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">Change Password</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current Password</label>
                <Input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className={clsx({ "border-red-500": passwordErrors.currentPassword })}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-red-500">{passwordErrors.currentPassword}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className={clsx({ "border-red-500": passwordErrors.password })}
                />
                {passwordErrors.password && (
                  <p className="text-sm text-red-500">{passwordErrors.password}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className={clsx({ "border-red-500": passwordErrors.confirmPassword })}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                )}
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button onClick={handlePasswordChange}>Update Password</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
