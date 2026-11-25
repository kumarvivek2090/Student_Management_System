import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FolderArchive, Plus, Download, FileText, Trash2, ExternalLink, BookOpen, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';

const ClassMaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [form, setForm] = useState({
    classId: '',
    subjectId: '',
    title: '',
    description: '',
    fileUrl: '',
    fileType: 'PDF'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mRes, cRes, subRes] = await Promise.all([
        api.get('/materials'),
        api.get('/classes'),
        api.get('/subjects')
      ]);
      if (mRes.data?.success) setMaterials(mRes.data.data || []);
      if (cRes.data?.success && cRes.data.data.length > 0) {
        setClasses(cRes.data.data);
        setForm(prev => ({ ...prev, classId: cRes.data.data[0].id }));
      }
      if (subRes.data?.success && subRes.data.data.length > 0) {
        setSubjects(subRes.data.data);
        setForm(prev => ({ ...prev, subjectId: subRes.data.data[0].id }));
      }
    } catch (e) {
      toast.error('Failed to load learning resources');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/materials', form);
      if (res.data?.success) {
        toast.success('Resource published for students!');
        setShowAddModal(false);
        loadData();
      }
    } catch (e) {
      toast.error('Failed to publish material');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await api.delete(`/materials/${id}`);
      toast.success('Resource deleted');
      loadData();
    } catch (e) {
      toast.error('Failed to delete resource');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card-premium p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E3E1D6]">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-[#52613B] bg-[#E4EAD9] px-2.5 py-0.5 rounded-full border border-[#CAD6B7]">
              Curriculum Repository
            </span>
            <span className="text-xs text-[#555B50] font-semibold">Published Resources: {materials.length}</span>
          </div>
          <h2 className="text-xl font-bold text-[#242820] mt-1 tracking-tight">Class Learning Materials & Syllabus</h2>
          <p className="text-xs text-[#555B50] font-medium mt-0.5">
            Distribute official course syllabi, laboratory safety manuals, slide decks, and reference study guides.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs font-bold flex items-center space-x-2 py-2.5 px-4"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload New Resource</span>
        </button>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.length > 0 ? (
          materials.map((m) => (
            <div
              key={m.id}
              className="card-premium p-5 border border-[#E3E1D6] hover:shadow-card transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Badge variant="olive">{m.fileType}</Badge>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1 text-[#74796D] hover:text-[#B84040] transition-colors"
                    title="Delete resource"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#242820] leading-snug">{m.title}</h3>
                  <p className="text-xs text-[#555B50] mt-1 leading-relaxed">{m.description}</p>
                </div>

                <div className="p-2 rounded-lg bg-[#F8F7F2] border border-[#E3E1D6] text-xs text-[#555B50] space-y-1">
                  <p><strong className="text-[#242820]">Subject:</strong> {m.subjectName}</p>
                  <p><strong className="text-[#242820]">Class:</strong> {m.className}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0EFE6]">
                <a
                  href={m.fileUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => toast.success(`Accessing ${m.title}...`)}
                  className="w-full btn-secondary text-xs font-bold py-2 flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#52613B]" />
                  <span>Open Resource</span>
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full card-premium p-12 text-center text-xs text-[#74796D] font-medium border border-[#E3E1D6]">
            No learning materials uploaded yet.
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Upload Learning Resource"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Target Class</label>
              <select
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
                className="input-field text-xs font-semibold"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Subject</label>
              <select
                value={form.subjectId}
                onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                className="input-field text-xs font-semibold"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242820] mb-1">Resource Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field text-xs font-semibold"
              placeholder="e.g. Physics Lab Safety Guidelines 2026"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Resource Type</label>
              <select
                value={form.fileType}
                onChange={(e) => setForm({ ...form, fileType: e.target.value })}
                className="input-field text-xs font-semibold"
              >
                <option value="PDF">PDF DOCUMENT</option>
                <option value="SLIDES">PRESENTATION SLIDES</option>
                <option value="DOCUMENT">WORD / TEXT DOC</option>
                <option value="VIDEO">VIDEO LECTURE</option>
                <option value="LINK">WEB RESOURCE LINK</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#242820] mb-1">Resource URL / Cloud Link</label>
              <input
                type="url"
                value={form.fileUrl}
                onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                className="input-field text-xs font-semibold"
                placeholder="https://..."
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242820] mb-1">Overview Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field text-xs font-semibold"
              placeholder="What does this resource cover..."
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="btn-secondary text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs font-bold"
            >
              Publish Resource
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClassMaterialsPage;
