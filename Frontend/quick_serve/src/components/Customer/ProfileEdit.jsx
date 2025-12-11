import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, User, Mail, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../assets/ui/avatar";
import { Button } from '../../assets/ui/button'
import { Label } from "../../assets/ui/label";
import { useNavigate } from 'react-router-dom'
import { fetchWithAuth } from '../../utils/api'

const API_BASE_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL

export function EditProfilePage() {
    const navigate = useNavigate()
    const userRole = localStorage.getItem('userRole')?.toLowerCase() || 'customer'
    
    const [editProfile, setEditProfile] = useState({
        name: "",
        email: "",
        phone: "",
        avatar: "",
    });
    
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    // Fetch profile data on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true)
                setError(null)
                
                const response = await fetchWithAuth(`${API_BASE_URL}/api/profile`)
                
                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        // Redirect to login if not authenticated
                        localStorage.clear()
                        navigate('/login')
                        return
                    }
                    throw new Error('Failed to fetch profile')
                }
                
                const data = await response.json()
                setEditProfile({
                    name: data.user.name || "",
                    email: data.user.email || "",
                    phone: data.user.phone || "",
                    avatar: data.user.avatar || "",
                })
            } catch (err) {
                console.error('Error fetching profile:', err)
                setError('Unable to load profile data')
            } finally {
                setLoading(false)
            }
        }
        
        fetchProfile()
    }, [navigate])

    const handleCancel = () => {
        if (userRole === 'shopkeeper') {
            navigate("/shopkeeper/profile")
        } else {
            navigate("/customer/profile")
        }
    };
    
    const handleSave = async () => {
        try {
            setSaving(true)
            setError(null)
            setSuccess(false)
            
            // Client-side validation
            if (!editProfile.name || editProfile.name.trim() === '') {
                setError('Name is required')
                setSaving(false)
                return
            }
            
            if (editProfile.phone && editProfile.phone.length !== 10) {
                setError('Phone must be 10 digits')
                setSaving(false)
                return
            }
            
            const response = await fetchWithAuth(`${API_BASE_URL}/api/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: editProfile.name,
                    phone: editProfile.phone,
                    avatar: editProfile.avatar
                })
            })
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.clear()
                    navigate('/login')
                    return
                }
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to update profile')
            }
            
            const data = await response.json()
            setEditProfile({
                name: data.user.name || "",
                email: data.user.email || "",
                phone: data.user.phone || "",
                avatar: data.user.avatar || "",
            })
            setSuccess(true)
            
            // Show success message and redirect after 2 seconds
            setTimeout(() => {
                if (userRole === 'shopkeeper') {
                    navigate("/shopkeeper/profile")
                } else {
                    navigate("/customer/profile")
                }
            }, 2000)
            
        } catch (err) {
            console.error('Error updating profile:', err)
            setError(err.message || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
                <div className="text-center">
                    {/* Modern Profile Loading Animation */}
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-700/30"></div>
                        <motion.div
                            className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div
                            className="absolute inset-2 rounded-full border-4 border-transparent border-t-orange-500 border-l-orange-500"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-orange-500"
                            />
                        </div>
                    </div>
                    
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <h2 className="text-2xl font-bold text-white mb-2">Loading Profile</h2>
                        <p className="text-slate-400">Getting your account details...</p>
                    </motion.div>
                </div>
            </div>
        )
    }

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
                            className="text-white hover:bg-slate-800 hover:cursor-pointer"
                            onClick={handleCancel}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
                    </div>
                </motion.div>
                
                {/* Success Message */}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg"
                    >
                        <p className="text-green-400 text-center">Profile updated successfully!</p>
                    </motion.div>
                )}
                
                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg"
                    >
                        <p className="text-red-400 text-center">{error}</p>
                    </motion.div>
                )}

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
                            <div className="flex items-center gap-3 ">
                                <User className="w-5 h-5 text-orange-500" />
                                <input
                                    id="name"
                                    value={editProfile.name}
                                    className="text-white  w-full bg-slate-600/60 p-2 rounded-lg ml-2 "
                                    onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-white">Email</Label>
                            <div className="flex items-center gap-3 ">
                                <Mail className="w-5 h-5 text-orange-500" />
                                <input
                                    id="email"
                                    type="email"
                                    value={editProfile.email}
                                    className="text-white w-full bg-slate-600/40 p-2 rounded-lg ml-2 cursor-not-allowed"
                                    readOnly
                                    disabled
                                />
                            </div>
                            <p className="text-xs text-slate-400 ml-8">Email cannot be changed</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone" className="text-white">Phone</Label>
                            <div className="flex items-center gap-3 ">
                                <Phone className="w-5 h-5 text-green-500" />
                                <input
                                    id="phone"
                                    value={editProfile.phone}
                                    placeholder="10 digit phone number"
                                    maxLength="10"
                                    className="text-white  w-full bg-slate-600/60 p-2 rounded-lg ml-2 "
                                    onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value.replace(/\D/g, '') })}
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
                        className="h-12  hover:bg-slate-300 hover:cursor-pointer"
                        onClick={handleCancel}
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        className="h-12 bg-orange-600 hover:bg-orange-700 text-white hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving && (
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent"
                                animate={{ x: [-100, 100] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                        )}
                        <div className="relative z-10 flex items-center gap-2">
                            {saving ? (
                                <>
                                    <motion.div
                                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Save</span>
                                </>
                            )}
                        </div>
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