import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../assets/ui/avatar";
import {Button} from '../../assets/ui/button'
import { Input } from "../../assets/ui/input";
import { Label } from "../../assets/ui/label";


export function EditProfilePage({ onNavigate, userRole, onOpenSidebar }) {
  const [editProfile, setEditProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 8900",
    address: "123 Main St, City, State 12345",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
  });

  const handleCancel = () => onNavigate("profile");
  const handleSave = () => {
    // NOTE: Persisting back to ProfilePage would require lifting state or a store.
    // For now, navigate back after "saving".
    onNavigate("profile");
  };

  return (
    <div className="min-h-screen gradient-bg pb-24">
      {/* Header */}
      <div className="p-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-white hover:bg-slate-800"
              onClick={() => onNavigate("profile")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
          </div>

          {userRole === "shopkeeper" && onOpenSidebar && (
            <Button onClick={onOpenSidebar} variant="ghost" className="lg:hidden text-white hover:bg-slate-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          )}
        </motion.div>

        {/* Preview + Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-20 h-20 border-2 border-orange-500">
              <AvatarImage src={editProfile.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                {editProfile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{editProfile.name}</h2>
              <p className="text-slate-400 capitalize">{userRole}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-white">Name</Label>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-orange-500" />
                <Input
                  id="name"
                  value={editProfile.name}
                  onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-orange-500" />
                <Input
                  id="email"
                  type="email"
                  value={editProfile.email}
                  onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-white">Phone</Label>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-500" />
                <Input
                  id="phone"
                  value={editProfile.phone}
                  onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address" className="text-white">Address</Label>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-500" />
                <Input
                  id="address"
                  value={editProfile.address}
                  onChange={(e) => setEditProfile({ ...editProfile, address: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="avatar" className="text-white">Avatar URL</Label>
              <div className="flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-purple-500" />
                <Input
                  id="avatar"
                  value={editProfile.avatar}
                  onChange={(e) => setEditProfile({ ...editProfile, avatar: e.target.value })}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          <Button
            variant="outline"
            className="h-12 glass border-slate-700 text-white hover:bg-slate-800 rounded-xl"
            onClick={handleCancel}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Cancel
          </Button>
          <Button
            className="h-12 bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
            onClick={handleSave}
          >
            <Save className="w-5 h-5 mr-2" />
            Save
          </Button>
        </motion.div>

        <div className="text-center mt-8">
          <p className="text-xs text-slate-500">QuickServe v1.0.0</p>
          <p className="text-xs text-slate-500 mt-1">© 2025 QuickServe. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}