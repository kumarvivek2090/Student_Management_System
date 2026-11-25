import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { BookOpen, ExternalLink, Download, FileText, Layers, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../components/common/Badge';

const LearningResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await api.get('/materials');
      if (res.data?.success) {
        setResources(res.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load learning resources');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
              Academic Learning Repository
            </span>
            <span className="text-xs text-[#555B50] font-semibold">Available Resources: {resources.length}</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">Syllabus & Course Study Materials</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Course reference manuals, lecture slide decks, practice sheets, and textbook guidelines.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.length > 0 ? (
          resources.map((r) => (
            <div
              key={r.id}
              className="card-premium p-5 border border-[#E3E1D6] hover:shadow-card transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Badge variant="olive">{r.fileType}</Badge>
                  <span className="text-xs font-mono font-bold text-[#52613B] bg-[#E4EAD9] px-2 py-0.5 rounded">
                    {r.subjectName}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#242820] leading-snug">{r.title}</h3>
                  <p className="text-xs text-[#555B50] mt-1.5 leading-relaxed">{r.description}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F8F7F2] border border-[#E3E1D6] text-xs text-[#555B50]">
                  <p>Instructor: <strong className="text-[#242820]">{r.teacherName}</strong></p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0EFE6]">
                <a
                  href={r.fileUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => toast.success(`Accessing document: ${r.title}`)}
                  className="w-full btn-secondary text-xs font-bold py-2 flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#52613B]" />
                  <span>Access Material</span>
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full card-premium p-12 text-center text-xs text-[#74796D] font-medium border border-[#E3E1D6]">
            No study resources published yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningResourcesPage;
