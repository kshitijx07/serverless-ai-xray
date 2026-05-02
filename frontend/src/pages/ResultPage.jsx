import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Activity, Database, Server } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ResultPage() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let intervalId;
    const fetchResult = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/result/${scanId}`);
        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          setResult(data);
          clearInterval(intervalId);
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          setError('System error. Failed to retrieve tensor data.');
          clearInterval(intervalId);
        }
      }
    };

    fetchResult();
    intervalId = setInterval(fetchResult, 2000);
    return () => clearInterval(intervalId);
  }, [scanId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-red-400 font-mono tracking-widest uppercase mb-4">{error}</p>
        <button onClick={() => navigate('/')} className="text-sm text-zinc-400 hover:text-white transition-colors border-b border-zinc-700 pb-1">
          Return to Input
        </button>
      </div>
    );
  }

  if (!result || result.status === 'PENDING') {
    return (
      <div className="flex flex-col items-center justify-center max-w-md w-full space-y-12">
        <div className="relative flex items-center justify-center w-32 h-32">
          {/* Abstract geometric loading animation */}
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-white/20 rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360 }} 
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 border border-dashed border-white/40 rounded-full"
          />
          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
        </div>
        
        <div className="text-center space-y-3">
          <h2 className="text-xl font-light tracking-widest uppercase">Processing Tensor</h2>
          <div className="flex gap-1 justify-center">
            <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
          <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase mt-4">
            Awaiting Neural Engine Response
          </p>
        </div>
      </div>
    );
  }

  const confidencePercent = (result.confidence * 100).toFixed(1);
  const isPneumonia = result.prediction === 'Pneumonia';

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
      
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 text-xs font-mono tracking-widest uppercase text-zinc-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Terminate Session
        </button>
        <div className="text-xs font-mono tracking-widest text-zinc-600">
          ID: {scanId.substring(0,8)}...
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column - Big Data display */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="md:col-span-5 flex flex-col gap-8"
        >
          <div className="glass-panel p-8 rounded-3xl">
            <h3 className="text-xs font-mono tracking-widest text-zinc-500 uppercase mb-8">Classification Result</h3>
            
            <div className="mb-10">
              <div className="text-6xl md:text-7xl font-extralight tracking-tighter mb-2">
                {isPneumonia ? (
                  <span className="text-white">Positive</span>
                ) : (
                  <span className="text-zinc-500">Negative</span>
                )}
              </div>
              <p className="text-lg font-light text-zinc-400 tracking-wide">
                Detected: {result.prediction}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-xs font-mono uppercase tracking-widest">
                <span className="text-zinc-500">Confidence Match</span>
                <span>{confidencePercent}%</span>
              </div>
              <div className="h-[2px] w-full bg-zinc-900 rounded-full overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${confidencePercent}%` }}
                  transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
                  className="absolute top-0 left-0 h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - System Meta */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="md:col-span-7 flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between aspect-square">
              <Activity className="w-5 h-5 text-zinc-400 mb-4" strokeWidth={1.5} />
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Model Architecture</p>
                <p className="text-lg font-light">TFLite Generic</p>
              </div>
            </div>
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between aspect-square">
              <Database className="w-5 h-5 text-zinc-400 mb-4" strokeWidth={1.5} />
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Status</p>
                <p className="text-lg font-light text-white">{result.status}</p>
              </div>
            </div>
            <div className="glass-panel p-6 rounded-2xl col-span-2 flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <Server className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
                 <div>
                   <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Compute Region</p>
                   <p className="text-sm font-light">AWS Lambda (us-east-1)</p>
                 </div>
               </div>
               <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,1)] animate-pulse"></div>
            </div>
          </div>

          <div className="p-6 border border-white/5 bg-white/[0.01] rounded-2xl mt-4">
            <p className="text-[10px] font-mono leading-relaxed text-zinc-500 tracking-widest uppercase">
              Disclaimer: This interface represents a strictly experimental neural engine. Diagnostic outputs are stochastic approximations and hold no clinical validity. Consult verified medical professionals for physiological assessments.
            </p>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}
