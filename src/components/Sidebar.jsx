import { useState } from "react";

function Sidebar({
  projects,
  activeProject,
  onSelectProject,
  onToggleTerminal,
  showTerminal,
  onCollapsedChange,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsed);
    }
  };

  return (
    <div
      className={`${
        isCollapsed ? "w-[70px]" : "w-[280px]"
      } bg-bg-secondary border-r border-gray-700 flex flex-col transition-all duration-250 shadow-lg z-20`}
    >
      <div className="h-15 px-4 lg:px-6 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-4">
          {!isCollapsed && (
            <span className="text-xl font-bold text-white">myDash</span>
          )}
        </div>
        <button
          className="w-7 h-7 bg-bg-tertiary text-gray-400 rounded-sm flex items-center justify-center text-sm transition-all hover:bg-bg-hover hover:text-white hover:scale-105"
          onClick={handleToggleCollapse}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {!isCollapsed && (
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
            Projects
          </h3>
        )}
        <div className="flex flex-col gap-2">
          {projects.length === 0
            ? !isCollapsed && (
                <div className="text-center py-8 text-gray-400">
                  <p>No projects yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Add one to get started
                  </p>
                </div>
              )
            : projects.map((project, index) => (
                <button
                  key={project.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all relative overflow-hidden ${
                    activeProject?.id === project.id
                      ? "bg-bg-elevated border-primary text-white before:absolute before:top-0 before:left-0 before:w-0.5 before:h-full before:bg-gradient-to-b before:from-primary before:to-secondary"
                      : "bg-bg-tertiary border-transparent text-gray-400 hover:bg-bg-hover hover:border-gray-600 hover:text-white hover:translate-x-0.5"
                  }`}
                  onClick={() => onSelectProject(project)}
                  title={isCollapsed ? project.name : ""}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 shadow-sm"
                    style={{
                      background: project.visible ? "#10b981" : "#6b7280",
                    }}
                  ></div>
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                        <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                          {project.name}
                        </span>
                        <span className="text-xs font-mono text-primary">
                          :{project.port}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-gray-500 bg-bg-primary px-1.5 py-0.5 rounded-sm">
                        ⌘{index + 1}
                      </span>
                    </>
                  )}
                </button>
              ))}
        </div>
      </div>

      <div className="p-6 border-t border-gray-700">
        <button
          className={`w-full flex items-center gap-4 p-4 rounded-lg font-medium transition-all ${
            showTerminal
              ? "bg-primary text-white"
              : "bg-bg-tertiary text-gray-400 hover:bg-bg-hover hover:text-white"
          } ${isCollapsed ? "justify-center" : ""}`}
          onClick={onToggleTerminal}
          title="Toggle Terminal (⌘K)"
        >
          <span
            className={`text-sm transition-transform ${
              showTerminal ? "rotate-90" : ""
            }`}
          >
            ▶
          </span>
          {!isCollapsed && <span>Terminal</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
