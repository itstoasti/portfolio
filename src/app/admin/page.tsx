"use client";

import { MagicCard } from "@/src/components/ui/magic-card";
import { Button } from "@/src/components/ui/button";
import { useState, useEffect } from "react";
import { Plus, Trash2, ExternalLink } from "lucide-react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<any>(null);
  
  // Image Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Site Settings State
  const [settings, setSettings] = useState<any>({
    showUiLibrary: true,
    showSocialLinks: true,
    socialLinks: []
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data && !data.error) {
        setSettings(data);
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchRepoData = async () => {
    if (!password) return alert("Please enter the admin password first.");
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/github?url=${encodeURIComponent(url)}`, {
        headers: {
          "x-admin-password": password
        }
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setProject({
        ...data,
        imageSrc: data.imageSrc || "/projects/placeholder.png",
      });
      
      // Reset image upload state if user fetches a new repo
      setSelectedFile(null);
      setImagePreview(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProject = async () => {
    if (!password) return alert("Please enter the admin password first.");
    setLoading(true);
    try {
      let payload = { ...project, status: "Live" };
      
      // Attach base64 image data if user selected a file
      if (selectedFile && imagePreview) {
        payload.base64Image = imagePreview;
        // Clean filename and prepend timestamp to prevent overwrite errors
        const cleanName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        payload.imageFilename = `${Date.now()}_${cleanName}`;
      }

      const res = await fetch("/api/projects/add", {
        method: "POST",
        headers: {
          "x-admin-password": password,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      setSuccessMessage("Project added! Vercel will redeploy shortly.");
      setProject(null);
      setUrl("");
      setSelectedFile(null);
      setImagePreview(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const saveSettings = async () => {
    if (!password) return alert("Please enter the admin password first.");
    setSavingSettings(true);
    setSuccessMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "x-admin-password": password,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save settings");
      }
      setSuccessMessage("Settings updated! Site will redeploy shortly.");
      // Optional: keep alert for production where HMR isn't active
      if (process.env.NODE_ENV === 'production') {
        alert("Settings updated! Site will redeploy shortly.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const addSocialLink = () => {
    const newLink = {
      id: Math.random().toString(36).substr(2, 9),
      platform: "New Link",
      url: "https://",
      icon: "FaPaperclip"
    };
    setSettings({
      ...settings,
      socialLinks: [...(settings.socialLinks || []), newLink]
    });
  };

  const removeSocialLink = (id: string) => {
    setSettings({
      ...settings,
      socialLinks: settings.socialLinks.filter((l: any) => l.id !== id)
    });
  };

  const updateSocialLink = (id: string, field: string, value: string) => {
    setSettings({
      ...settings,
      socialLinks: settings.socialLinks.map((l: any) => 
        l.id === id ? { ...l, [field]: value } : l
      )
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 lg:p-24">
      <div className="max-w-2xl mx-auto space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-zinc-400">Manage site visibility, social links, and projects. Only authorized users.</p>
        </header>

        {/* Global Admin Password */}
        <MagicCard className="p-6 bg-zinc-900/50 border-zinc-800 border-red-900/30">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-red-400 flex items-center gap-2">
                Admin Password
                <span className="text-xs px-2 py-0.5 rounded bg-red-400/10 text-red-400 border border-red-400/20">Required for any changes</span>
              </label>
              <input 
                type="password"
                placeholder="Enter your secret admin password..." 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-red-900/50 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-white"
              />
            </div>
          </div>
        </MagicCard>

        <MagicCard className="p-6 space-y-6 bg-zinc-900/50 border-zinc-800">
          <header className="space-y-1">
            {successMessage && (
              <div className="p-4 mb-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                <p className="text-cyan-400 text-sm font-medium">{successMessage}</p>
                <button onClick={() => setSuccessMessage(null)} className="text-cyan-400/50 hover:text-cyan-400">
                  <Plus className="w-4 h-4 rotate-45" />
                </button>
              </div>
            )}
            <h2 className="text-xl font-semibold">Site Visibility</h2>
            <p className="text-sm text-zinc-500">Toggle sections on or off the public site.</p>
          </header>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-zinc-800">
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-zinc-200">UI Library Section</label>
                <p className="text-xs text-zinc-500">The bento grid folder icon</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, showUiLibrary: !settings.showUiLibrary})}
                className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${settings.showUiLibrary ? 'bg-cyan-600' : 'bg-zinc-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${settings.showUiLibrary ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-zinc-800">
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-zinc-200">Social Links Section</label>
                <p className="text-xs text-zinc-500">Twitter, GitHub, Resume links in Hero</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, showSocialLinks: !settings.showSocialLinks})}
                className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${settings.showSocialLinks ? 'bg-cyan-600' : 'bg-zinc-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${settings.showSocialLinks ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <Button 
              type="button"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" 
              onClick={saveSettings} 
              disabled={savingSettings || !password}
            >
              {savingSettings ? "Updating..." : "Update Settings"}
            </Button>
          </div>
        </MagicCard>

        {/* Social Links Manager */}
        <MagicCard className="p-6 space-y-6 bg-zinc-900/50 border-zinc-800">
          <header className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Social Media Links</h2>
              <p className="text-sm text-zinc-500">Manage icons shown in the Hero section.</p>
            </div>
            <Button 
              type="button"
              size="sm" 
              variant="outline" 
              className="border-zinc-700 hover:bg-zinc-800"
              onClick={addSocialLink}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Link
            </Button>
          </header>

          <div className="space-y-3">
            {settings.socialLinks?.map((link: any) => (
              <div key={link.id} className="p-4 bg-black/40 rounded-lg border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Platform Name</label>
                      <input 
                        value={link.platform}
                        onChange={(e) => updateSocialLink(link.id, 'platform', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Icon (react-icons)</label>
                      <select 
                        value={link.icon}
                        onChange={(e) => updateSocialLink(link.id, 'icon', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      >
                        <option value="FaXTwitter">Twitter/X</option>
                        <option value="FaGithub">GitHub</option>
                        <option value="FaLinkedin">LinkedIn</option>
                        <option value="FaPaperclip">Generic / Resume</option>
                      </select>
                    </div>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                    onClick={() => removeSocialLink(link.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">URL</label>
                  <div className="flex gap-2">
                    <input 
                      value={link.url}
                      onChange={(e) => updateSocialLink(link.id, 'url', e.target.value)}
                      placeholder="https://..."
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                    <a href={link.url} target="_blank" rel="noreferrer" className="p-1.5 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors">
                      <ExternalLink className="w-4 h-4 text-zinc-400" />
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {(!settings.socialLinks || settings.socialLinks.length === 0) && (
              <div className="text-center py-8 border border-dashed border-zinc-800 rounded-lg text-zinc-500 text-sm">
                No social links added yet.
              </div>
            )}

            <Button 
              type="button"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white mt-4" 
              onClick={saveSettings} 
              disabled={savingSettings || !password}
            >
              {savingSettings ? "Updating..." : "Save All Changes"}
            </Button>
          </div>
        </MagicCard>

        <MagicCard className="p-6 space-y-6 bg-zinc-900/50 border-zinc-800">
          <header className="space-y-1">
            <h2 className="text-xl font-semibold">Add New Project</h2>
            <p className="text-sm text-zinc-500">Auto-fill from GitHub or manual entry.</p>
          </header>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">GitHub Repository URL</label>
              <div className="flex gap-2">
                <input 
                  placeholder="https://github.com/owner/repo" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 bg-black border border-zinc-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
                <Button 
                  type="button"
                  onClick={fetchRepoData} 
                  disabled={loading || !url || !password}
                >
                  {loading ? "Fetching..." : "Auto-Fill"}
                </Button>
              </div>
            </div>
          </div>

          {project && (
            <div className="space-y-6 pt-6 border-t border-zinc-800 animate-in fade-in slide-in-from-top-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Title</label>
                  <input 
                    value={project.title} 
                    onChange={(e) => setProject({...project, title: e.target.value})} 
                    className="w-full bg-black border border-zinc-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-zinc-500" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Description</label>
                  <textarea 
                    value={project.description} 
                    onChange={(e) => setProject({...project, description: e.target.value})}
                    className="w-full bg-black border border-zinc-700 rounded-md p-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Tech Stack (Comma separated)</label>
                  <input 
                    value={project.tech.join(", ")} 
                    onChange={(e) => setProject({...project, tech: e.target.value.split(", ").map(t => t.trim())})} 
                    className="w-full bg-black border border-zinc-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-zinc-500" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Live Site URL (Optional)</label>
                    <input 
                      value={project.link === "#" ? "" : project.link} 
                      onChange={(e) => setProject({...project, link: e.target.value || "#"})} 
                      placeholder="https://..."
                      className="w-full bg-black border border-zinc-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-zinc-500" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Source Code URL (Optional)</label>
                    <input 
                      value={project.code === "#" ? "" : project.code} 
                      onChange={(e) => setProject({...project, code: e.target.value || "#"})} 
                      placeholder="https://github.com/..."
                      className="w-full bg-black border border-zinc-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-zinc-500" 
                    />
                  </div>
                </div>
                
                {/* Image Section */}
                <div className="space-y-4 p-4 border border-zinc-800 bg-black/50 rounded-lg">
                  <label className="text-xs uppercase tracking-wider text-cyan-500 font-bold block mb-2">Project Image</label>
                  
                  {/* Option 1: File Upload */}
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-400">Option 1: Upload a new image from your PC.</p>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-zinc-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-cyan-500/10 file:text-cyan-500
                        hover:file:bg-cyan-500/20
                        cursor-pointer"
                    />
                  </div>
                  
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-zinc-800"></div>
                    <span className="flex-shrink-0 mx-4 text-zinc-600 text-xs">OR</span>
                    <div className="flex-grow border-t border-zinc-800"></div>
                  </div>

                  {/* Option 2: Image URL */}
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-400">Option 2: Use an existing path or URL.</p>
                    <input 
                      value={project.imageSrc} 
                      onChange={(e) => {
                        setProject({...project, imageSrc: e.target.value});
                        setSelectedFile(null); // Clear upload if they type a URL
                        setImagePreview(null);
                      }} 
                      className="w-full bg-black border border-zinc-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                    />
                  </div>

                  {/* Preview */}
                  {(imagePreview || project.imageSrc) && (
                    <div className="mt-4 aspect-video relative rounded-md border border-zinc-800 overflow-hidden bg-zinc-900 flex items-center justify-center">
                      <img 
                        src={imagePreview || project.imageSrc} 
                        alt="Preview" 
                        className="object-contain max-h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text y="50" x="10" fill="gray">Image failed to load</text></svg>';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <Button 
                type="button"
                className="w-full bg-white text-black hover:bg-zinc-200" 
                onClick={saveProject} 
                disabled={loading}
              >
                {loading ? "Saving to GitHub..." : "Confirm & Save Project"}
              </Button>
            </div>
          )}
        </MagicCard>
      </div>
    </div>
  );
}
