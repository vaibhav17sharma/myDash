import { useState } from "react";

function ProjectViewer({ project }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-primary">
        <div className="text-center max-w-md p-12">
          <div className="text-6xl mb-6 animate-pulse">📦</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            No Project Selected
          </h2>
          <p className="text-gray-400">
            Select a project from the sidebar or add a new one to get started
          </p>
        </div>
      </div>
    );
  }

  if (!project.visible) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-primary">
        <div className="text-center max-w-md p-12">
          <div className="text-6xl mb-6 animate-pulse">👁️‍🗨️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Project Hidden</h2>
          <p className="text-gray-400">{project.name} is currently hidden</p>
          <p className="text-sm text-gray-500 mt-2">
            Click the eye icon to show it
          </p>
        </div>
      </div>
    );
  }

  // Use proxy URL to access localhost projects through the backend
  // This works both locally and through tunnels
  const url = `/proxy/${project.port}${project.path || "/"}`;
  const externalUrl = `http://localhost:${project.port}${project.path || "/"}`;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleIframeError = () => {
    setIframeError(true);
  };

  return (
    <div
      className={`h-full flex flex-col bg-bg-primary ${
        isFullscreen ? "fixed inset-0 z-[100]" : ""
      }`}
    >
      <div className="h-[50px] bg-bg-secondary border-b border-gray-700 px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h3 className="text-base font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis">
            {project.name}
          </h3>
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-primary hover:text-secondary hover:underline transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {externalUrl}
          </a>
        </div>
        <div className="flex gap-2">
          <button
            className="w-8 h-8 bg-bg-tertiary text-gray-400 rounded-lg flex items-center justify-center text-lg transition-all hover:bg-bg-hover hover:text-white hover:scale-105"
            onClick={() => window.open(externalUrl, "_blank")}
            title="Open in New Tab"
          >
            ↗
          </button>
          <button
            className="w-8 h-8 bg-bg-tertiary text-gray-400 rounded-lg flex items-center justify-center text-lg transition-all hover:bg-bg-hover hover:text-white hover:scale-105"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? "⊡" : "⊞"}
          </button>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden bg-bg-primary">
        {iframeError ? (
          <div className="h-full flex flex-col items-center justify-center gap-6 p-12 text-center">
            <div className="text-6xl animate-pulse">⚠️</div>
            <h3 className="text-2xl font-bold text-white">
              Failed to Load Project
            </h3>
            <p className="text-gray-400 max-w-md">
              Make sure the project is running on port {project.port}
            </p>
            <button
              className="px-8 py-4 gradient-bg text-white rounded-lg font-semibold shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
              onClick={() => {
                setIframeError(false);
                window.location.reload();
              }}
            >
              Retry
            </button>
          </div>
        ) : (
          <iframe
            src={url}
            title={project.name}
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            className="w-full h-full border-0 bg-white"
          />
        )}
      </div>
    </div>
  );
}

export default ProjectViewer;
