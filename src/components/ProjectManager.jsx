import { useState } from "react";

function ProjectManager({
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  activeProject,
}) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    port: "",
    path: "/",
    visible: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.port) {
      onAddProject(formData);
      setFormData({ name: "", port: "", path: "/", visible: true });
      setShowModal(false);
    }
  };

  const toggleVisibility = () => {
    if (activeProject) {
      onUpdateProject(activeProject.id, { visible: !activeProject.visible });
    }
  };

  const handleDelete = () => {
    if (activeProject && confirm(`Delete project "${activeProject.name}"?`)) {
      onDeleteProject(activeProject.id);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {activeProject && (
          <>
            <button
              className="w-9 h-9 bg-bg-tertiary text-gray-400 rounded-lg flex items-center justify-center text-lg transition-all hover:bg-bg-hover hover:scale-105"
              onClick={toggleVisibility}
              title={activeProject.visible ? "Hide Project" : "Show Project"}
            >
              {activeProject.visible ? "👁️" : "👁️‍🗨️"}
            </button>
            <button
              className="w-9 h-9 bg-bg-tertiary text-gray-400 rounded-lg flex items-center justify-center text-lg transition-all hover:bg-red-500 hover:text-white hover:scale-105"
              onClick={handleDelete}
              title="Delete Project"
            >
              🗑️
            </button>
          </>
        )}
        <button
          className="flex items-center gap-2 px-6 py-2 bg-white text-gray-900 rounded-lg font-semibold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          onClick={() => setShowModal(true)}
        >
          <span className="text-xl font-light">+</span>
          <span>Add Project</span>
        </button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] animate-fadeIn"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-bg-secondary border border-gray-700 rounded-2xl shadow-2xl w-[90%] max-w-[500px] animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-8 border-b border-gray-700">
              <h2 className="text-2xl font-bold gradient-text">
                Add New Project
              </h2>
              <button
                className="w-8 h-8 bg-bg-tertiary text-gray-400 rounded-lg flex items-center justify-center text-xl transition-all hover:bg-bg-hover hover:text-white hover:rotate-90"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="text-sm font-semibold text-gray-400"
                >
                  Project Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="My Awesome App"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  autoFocus
                  className="w-full text-base bg-bg-tertiary text-white border border-gray-700 rounded-lg px-4 py-2 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="port"
                  className="text-sm font-semibold text-gray-400"
                >
                  Port
                </label>
                <input
                  id="port"
                  type="number"
                  placeholder="3000"
                  value={formData.port}
                  onChange={(e) =>
                    setFormData({ ...formData, port: e.target.value })
                  }
                  required
                  min="1"
                  max="65535"
                  className="w-full text-base bg-bg-tertiary text-white border border-gray-700 rounded-lg px-4 py-2 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="path"
                  className="text-sm font-semibold text-gray-400"
                >
                  Path (optional)
                </label>
                <input
                  id="path"
                  type="text"
                  placeholder="/"
                  value={formData.path}
                  onChange={(e) =>
                    setFormData({ ...formData, path: e.target.value })
                  }
                  className="w-full text-base bg-bg-tertiary text-white border border-gray-700 rounded-lg px-4 py-2 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="visible"
                  checked={formData.visible}
                  onChange={(e) =>
                    setFormData({ ...formData, visible: e.target.checked })
                  }
                  className="w-4.5 h-4.5 cursor-pointer accent-primary"
                />
                <label htmlFor="visible" className="font-medium cursor-pointer">
                  Show immediately
                </label>
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  className="flex-1 px-6 py-3 bg-bg-tertiary text-gray-400 rounded-lg font-semibold transition-all hover:bg-bg-hover hover:text-white"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 gradient-bg text-white rounded-lg font-semibold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 active:translate-y-0"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectManager;
