import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ScanLine, Loader2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type.startsWith('image/')) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError('');
    } else {
      setError('Invalid format. Please select an image.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('image/')) {
      setFile(dropped);
      setPreview(URL.createObjectURL(dropped));
      setError('');
    } else {
      setError('Invalid format. Please drop an image.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError('');

    try {
      const { data } = await axios.get(`${API_BASE_URL}/upload-url`);
      const { uploadUrl, scanId } = data;

      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type }
      });

      navigate(`/result/${scanId}`);
    } catch (err) {
      console.error(err);
      setError('Network exception. Initialization failed.');
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-16">
      
      {/* Left Typography Section */}
      <div className="flex-1 space-y-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-5xl md:text-7xl font-extralight tracking-tighter leading-tight mb-6">
            Neural <br/> <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">Vision.</span>
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed max-w-md">
            Advanced diagnostic interpretation through high-dimensional tensor analysis. Upload radiographic imagery to initiate the sequence.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-zinc-600"
        >
          <span className="w-12 h-[1px] bg-zinc-800"></span>
          System Online
        </motion.div>
      </div>

      {/* Right Upload Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex-1 w-full"
      >
        <div className="glass-panel rounded-3xl p-2 relative overflow-hidden group">
          {/* Animated gradient border effect behind content */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="bg-surface/80 rounded-2xl p-8 relative z-10 h-full min-h-[400px] flex flex-col items-center justify-center">
            
            {!preview ? (
              <div
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-white/30 transition-all duration-500">
                  <Plus className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" strokeWidth={1.5} />
                </div>
                <p className="text-lg font-light mb-2">Select or drag image</p>
                <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">JPG, PNG / Max 5MB</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden mb-8 group/img border border-white/10">
                  <img src={preview} alt="X-ray preview" className="w-full h-full object-cover filter grayscale opacity-80 group-hover/img:opacity-100 transition-opacity duration-700" />
                  
                  {/* Scanning line effect */}
                  {isUploading && (
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-white shadow-[0_0_15px_rgba(255,255,255,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                  )}

                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10 opacity-0 group-hover/img:opacity-100 transition-all hover:bg-white hover:text-black"
                  >
                    <Plus className="w-4 h-4 rotate-45" />
                  </button>
                </div>
                
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="btn-primary w-full py-4 rounded-xl text-sm tracking-widest uppercase flex items-center justify-center gap-3"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <ScanLine className="w-4 h-4" />
                      Execute Analysis
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-0 w-full text-center">
                <p className="text-xs text-red-400 font-mono tracking-wider">{error}</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}
